using Jogo.Application.Common.Interfaces;
using Jogo.Application.Features.Analysis.DTOs;
using Jogo.Domain.Entities;
using Jogo.Domain.ValueObjects;
using Jogo.Infrastructure.Services.Ai.AiAnalysis;
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
            _logger.LogInformation("Step 1: Triggering AI analysis for video {VideoId} with StorageUrl={StorageUrl}", videoId, video.StorageUrl);

            var analysisId = await _aiAnalysisService.TriggerAnalysisAsync(
                video.StorageUrl,
                cancellationToken
            );

            _logger.LogInformation("Step 2: AI analysis triggered. AnalysisId={AnalysisId}. Polling for report...", analysisId);

            // The AI service returns immediately and processes in the
            // background (a real CV pipeline on a real video takes far
            // longer than any single HTTP request should stay open for,
            // especially behind a gateway with its own timeout). Poll
            // until it's actually done instead of checking once — this
            // job runs as a Hangfire background job, not inside a web
            // request, so there's no reverse-proxy timeout to worry about
            // here.
            AiAnalysisReportDto? reportDto = null;
            const int maxPollAttempts = 120; // 120 * 10s = 20 minutes
            var pollInterval = TimeSpan.FromSeconds(10);
            for (var attempt = 1; attempt <= maxPollAttempts; attempt++)
            {
                try
                {
                    reportDto = await _aiAnalysisService.GetAnalysisStatusAsync(analysisId, cancellationToken);
                    break; // definitive result: completed (non-null) or genuinely failed (null)
                }
                catch (AnalysisStillProcessingException)
                {
                    _logger.LogInformation(
                        "AnalysisId={AnalysisId} still processing (poll attempt {Attempt}/{Max}); waiting {Delay}s...",
                        analysisId, attempt, maxPollAttempts, pollInterval.TotalSeconds);
                    await Task.Delay(pollInterval, cancellationToken);
                }
            }

            if (reportDto == null)
            {
                throw new Exception(
                    $"Failed to retrieve analysis report for AnalysisId: {analysisId} (either the analysis failed, or it didn't finish within {maxPollAttempts * pollInterval.TotalSeconds}s)"
                );
            }

            _logger.LogInformation(
                "Step 3: Report retrieved for video {VideoId}. OverallScore={OverallScore}, Summary={Summary}, Strengths={StrengthsCount}, Weaknesses={WeaknessesCount}, Recommendations={RecommendationsCount}",
                videoId, reportDto.OverallScore, reportDto.Summary,
                reportDto.Strengths.Count, reportDto.Weaknesses.Count, reportDto.Recommendations.Count);

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
                "Successfully completed AI analysis for video {VideoId}. Report saved with OverallScore={OverallScore}",
                videoId, reportDto.OverallScore
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
