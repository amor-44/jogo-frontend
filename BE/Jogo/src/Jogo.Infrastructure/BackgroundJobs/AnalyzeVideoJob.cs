using Jogo.Application.Common.Interfaces;
using Jogo.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Jogo.Infrastructure.BackgroundJobs;

public class AnalyzeVideoJob
{
    private readonly IAppDbContext _context;
    private readonly IAiAnalysisService _aiAnalysisService;
    private readonly ILogger<AnalyzeVideoJob> _logger;

    public AnalyzeVideoJob(
        IAppDbContext context,
        IAiAnalysisService aiAnalysisService,
        ILogger<AnalyzeVideoJob> logger)
    {
        _context = context;
        _aiAnalysisService = aiAnalysisService;
        _logger = logger;
    }

    public async Task ExecuteAsync(Guid videoId)
    {
        _logger.LogInformation("Starting AI analysis for video {VideoId}", videoId);

        var video = await _context.FootballVideos
            .FirstOrDefaultAsync(v => v.Id == videoId);

        if (video == null)
        {
            _logger.LogError("Video {VideoId} not found for analysis.", videoId);
            return;
        }

        var processResult = video.MarkProcessing();
        if (processResult.IsError)
        {
            _logger.LogWarning("Video {VideoId} could not be marked as processing: {Error}", videoId, processResult.TopError.Description);
            return;
        }

        await _context.SaveChangesAsync(CancellationToken.None);

        try
        {
            var reportDto = await _aiAnalysisService.AnalyzeAsync(video.StorageUrl);

            var reportResult = AnalysisReport.Create(
                videoId,
                reportDto.OverallScore,
                reportDto.Summary,
                reportDto.Strengths,
                reportDto.Weaknesses,
                reportDto.Recommendations,
                reportDto.AIModelVersion);

            if (reportResult.IsError)
            {
                throw new Exception($"Failed to create AnalysisReport entity: {reportResult.TopError.Description}");
            }

            var completeResult = video.MarkCompleted();
            if (completeResult.IsError)
            {
                throw new Exception($"Failed to mark video as completed: {completeResult.TopError.Description}");
            }

            _context.AnalysisReports.Add(reportResult.Value);
            await _context.SaveChangesAsync(CancellationToken.None);

            _logger.LogInformation("Successfully completed AI analysis for video {VideoId}", videoId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to analyze video {VideoId}. Marking as failed.", videoId);
            video.MarkFailed();
            await _context.SaveChangesAsync(CancellationToken.None);
            throw; // Re-throw for Hangfire to handle retries if configured
        }
    }
}
