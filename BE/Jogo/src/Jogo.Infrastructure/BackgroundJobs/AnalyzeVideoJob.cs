using Jogo.Application.Common.Interfaces;
using Jogo.Domain.Entities;
using Jogo.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Hybrid;
using Microsoft.Extensions.Logging;

namespace Jogo.Infrastructure.BackgroundJobs;

public class AnalyzeVideoJob
{
    private readonly IAppDbContext _context;
    private readonly IAiAnalysisService _aiAnalysisService;
    private readonly ILogger<AnalyzeVideoJob> _logger;
    private readonly HybridCache _cache;

    public AnalyzeVideoJob(
        IAppDbContext context,
        IAiAnalysisService aiAnalysisService,
        ILogger<AnalyzeVideoJob> logger,
        HybridCache cache
    )
    {
        _context = context;
        _aiAnalysisService = aiAnalysisService;
        _logger = logger;
        _cache = cache;
    }

    public async Task ExecuteAsync(Guid videoId, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Starting AI analysis for video {VideoId}", videoId);

        var video = await _context.FootballVideos.FirstOrDefaultAsync(
            v => v.Id == videoId,
            cancellationToken
        );

        if (video == null)
        {
            _logger.LogError("Video {VideoId} not found for analysis.", videoId);
            return;
        }

        var processResult = video.MarkProcessing();
        if (processResult.IsError)
        {
            _logger.LogWarning(
                "Video {VideoId} could not be marked as processing: {Error}",
                videoId,
                processResult.TopError.Description
            );
            return;
        }

        await _context.SaveChangesAsync(cancellationToken);

        try
        {
            var analysisId = await _aiAnalysisService.TriggerAnalysisAsync(
                video.StorageUrl,
                cancellationToken
            );

            var reportDto = await _aiAnalysisService.GetAnalysisStatusAsync(
                analysisId,
                cancellationToken
            );

            if (reportDto == null)
            {
                throw new Exception(
                    $"Failed to retrieve analysis report for AnalysisId: {analysisId}"
                );
            }

            var metrics = PerformanceMetrics.Create(
                reportDto.Metrics.PositionScore,
                reportDto.Metrics.PassingAccuracy,
                reportDto.Metrics.BallControl,
                reportDto.Metrics.PositioningScore,
                reportDto.Metrics.MovementEfficiency,
                reportDto.Metrics.DefensiveActions,
                reportDto.Metrics.AttackingImpact,
                reportDto.Metrics.DecisionMaking
            );

            var reportResult = AnalysisReport.Create(
                videoId,
                reportDto.OverallScore,
                reportDto.Summary,
                reportDto.Strengths,
                reportDto.Weaknesses,
                reportDto.Recommendations,
                reportDto.AIModelVersion,
                metrics
            );

            if (reportResult.IsError)
            {
                throw new Exception(
                    $"Failed to create AnalysisReport entity: {reportResult.TopError.Description}"
                );
            }

            var completeResult = video.MarkCompleted();
            if (completeResult.IsError)
            {
                throw new Exception(
                    $"Failed to mark video as completed: {completeResult.TopError.Description}"
                );
            }

            _context.AnalysisReports.Add(reportResult.Value);
            await _context.SaveChangesAsync(cancellationToken);

            // Invalidate cache so search results reflect new score
            await _cache.RemoveByTagAsync("players", CancellationToken.None);
            await _cache.RemoveByTagAsync($"player-{video.PlayerProfileId}", CancellationToken.None);

            _logger.LogInformation(
                "Successfully completed AI analysis for video {VideoId}",
                videoId
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to analyze video {VideoId}. Marking as failed.", videoId);
            video.MarkFailed();
            await _context.SaveChangesAsync(cancellationToken);
            throw;
        }
    }
}
