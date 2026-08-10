using System;
using System.Threading;
using System.Threading.Tasks;

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

    public async Task ExecuteAsync(Guid videoId, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Starting AI analysis for video {VideoId}", videoId);

        var video = await _context.FootballVideos
            .FirstOrDefaultAsync(v => v.Id == videoId, cancellationToken);

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

        await _context.SaveChangesAsync(cancellationToken);

        try
        {
            var analysisId = await _aiAnalysisService.TriggerAnalysisAsync(video.StorageUrl, cancellationToken);

            var reportDto = await _aiAnalysisService.GetAnalysisStatusAsync(analysisId, cancellationToken);

            if (reportDto == null)
            {
                throw new Exception($"Failed to retrieve analysis report for AnalysisId: {analysisId}");
            }

            // ✅ إضافة الـ 8 بارامترات المطلوبة بالضبط
            var reportResult = AnalysisReport.Create(
     videoId,
     reportDto.OverallScore,
     reportDto.Summary,
     reportDto.Strengths,
     reportDto.Weaknesses,
     reportDto.Recommendations,
     video.StorageUrl
              );

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
            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Successfully completed AI analysis for video {VideoId}", videoId);
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