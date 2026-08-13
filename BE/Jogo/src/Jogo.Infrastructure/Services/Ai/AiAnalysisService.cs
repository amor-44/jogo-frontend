using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading;
using System.Threading.Tasks;

using Jogo.Application.Common.Interfaces;
using Jogo.Application.Features.Analysis.DTOs;
using Jogo.Infrastructure.Services.Ai.Performance;

using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Jogo.Infrastructure.Services.Ai.AiAnalysis;

public class AiAnalysisService : IAiAnalysisService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AiAnalysisService> _logger;

    private static readonly JsonSerializerOptions _jsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
    };

    public AiAnalysisService(
        HttpClient httpClient,
        IConfiguration configuration,
        ILogger<AiAnalysisService> logger)
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _logger = logger;

        var baseUrl = _configuration["AiService:BaseUrl"];
        if (!string.IsNullOrEmpty(baseUrl) && _httpClient.BaseAddress == null)
        {
            _httpClient.BaseAddress = new Uri(baseUrl);
        }

        if (int.TryParse(_configuration["AiService:TimeoutSeconds"], out var timeoutSeconds))
        {
            _httpClient.Timeout = TimeSpan.FromSeconds(timeoutSeconds);
        }
    }

    /// <summary>
    /// Sends the video URL to the AI service, which downloads the file and runs analysis.
    /// Returns the analysis_id to poll with. Throws on any real failure — the
    /// caller (AnalyzeVideoJob) already correctly marks the video Failed on
    /// an exception; there is no legitimate reason to fabricate a fake
    /// "fallback" analysis and return random scores as if it succeeded.
    /// </summary>
    public async Task<string> TriggerAnalysisAsync(string videoUrl, CancellationToken cancellationToken = default)
    {
        if (videoUrl.StartsWith("/"))
        {
            var apiBaseUrl = _configuration["ApiBaseUrl"] ?? "http://localhost:5001";
            videoUrl = $"{apiBaseUrl.TrimEnd('/')}{videoUrl}";
        }

        var payload = new { video_url = videoUrl };

        _logger.LogInformation("Triggering AI analysis for video URL: {VideoUrl}", videoUrl);

        var response = await _httpClient.PostAsJsonAsync(
            "/analyze-by-url",
            payload,
            _jsonOptions,
            cancellationToken);

        var rawBody = await response.Content.ReadAsStringAsync(cancellationToken);
        _logger.LogInformation("AI trigger response: Status={StatusCode}, Body={Body}", response.StatusCode, rawBody);

        if (!response.IsSuccessStatusCode)
        {
            throw new HttpRequestException(
                $"AI Analysis trigger request failed with {response.StatusCode}. Details: {rawBody}");
        }

        var result = JsonSerializer.Deserialize<AnalysisTriggerResponse>(rawBody, _jsonOptions);

        var analysisId = result?.AnalysisId
               ?? throw new InvalidOperationException("AI service did not return an analysis_id.");

        _logger.LogInformation("AI analysis triggered successfully. AnalysisId={AnalysisId}", analysisId);
        return analysisId;
    }

    /// <summary>
    /// Retrieves the report and maps it to AiAnalysisReportDto.
    /// Returns null if the analysis genuinely failed or wasn't found.
    /// Throws AnalysisStillProcessingException if it exists but isn't done
    /// yet — callers should poll again after a delay rather than treat that
    /// as failure. /analyze-by-url returns immediately and processes in the
    /// background (needed on hosts with a request/gateway timeout shorter
    /// than real analysis takes), so "not done yet" is the normal case for
    /// a while, not an error.
    /// </summary>
    public async Task<AiAnalysisReportDto?> GetAnalysisStatusAsync(string analysisId, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Retrieving AI analysis status for AnalysisId={AnalysisId}", analysisId);

        try
        {
            var response = await _httpClient.GetAsync($"/analysis/{analysisId}", cancellationToken);

            var rawBody = await response.Content.ReadAsStringAsync(cancellationToken);
            _logger.LogInformation("AI status response: Status={StatusCode}, Body={Body}", response.StatusCode, rawBody);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("AI status request failed with HTTP {StatusCode} for AnalysisId={AnalysisId}", response.StatusCode, analysisId);
                return null;
            }

            var aiResponse = JsonSerializer.Deserialize<AiFootballPerformanceResponse>(rawBody, _jsonOptions);

            if (aiResponse is null)
            {
                _logger.LogWarning("Failed to deserialize AI response for AnalysisId={AnalysisId}. Raw body: {Body}", analysisId, rawBody);
                return null;
            }

            if (aiResponse.Status == "failed")
            {
                _logger.LogWarning("AI analysis failed for AnalysisId={AnalysisId}. Error: {Error}", analysisId, aiResponse.Error);
                return null;
            }

            if (aiResponse.Status == "processing")
            {
                throw new AnalysisStillProcessingException(analysisId);
            }

            _logger.LogInformation(
                "AI response deserialized. AnalysisId={AnalysisId}, Status={Status}, HasFootballPerformance={HasPerf}, HasScores={HasScores}",
                aiResponse.AnalysisId,
                aiResponse.Status,
                aiResponse.FootballPerformance is not null,
                aiResponse.FootballPerformance?.Scores is not null);

            var dto = MapToDto(aiResponse);
            return dto;
        }
        catch (AnalysisStillProcessingException)
        {
            // Not an error — let the caller's poll loop decide when to give up.
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception while retrieving AI status for AnalysisId={AnalysisId}", analysisId);
            return null;
        }
    }

    private static AiAnalysisReportDto MapToDto(AiFootballPerformanceResponse ai)
    {
        var perf = ai.FootballPerformance;
        var overallScore = perf?.Scores?.OverallScore is float s ? (int)Math.Round(s) : 0;
        var quality = perf?.AnalysisQuality ?? "unknown";
        var firstLimitation = perf?.Limitations?.FirstOrDefault();

        var summary = firstLimitation is not null
            ? $"Analysis quality: {quality}. {firstLimitation}"
            : $"Football performance analysis completed. Quality: {quality}.";

        var strengths = perf?.Strengths ?? new List<string>();
        var weaknesses = perf?.Weaknesses ?? new List<string>();
        var recommendations = perf?.Recommendations ?? new List<string>();

        var metrics = new PerformanceMetricsDto(
            PositionScore: (int)Math.Round(perf?.Scores?.PositioningScore ?? 0),
            PassingAccuracy: (int)Math.Round(perf?.Scores?.PassingAccuracy ?? 0),
            BallControl: (int)Math.Round(perf?.Scores?.BallControl ?? 0),
            PositioningScore: (int)Math.Round(perf?.Scores?.PositioningScore ?? 0),
            MovementEfficiency: (int)Math.Round(perf?.Scores?.MovementEfficiency ?? 0),
            DefensiveActions: (int)Math.Round(perf?.Scores?.DefensiveActions ?? 0),
            AttackingImpact: (int)Math.Round(perf?.Scores?.AttackingImpact ?? 0),
            DecisionMaking: (int)Math.Round(perf?.Scores?.DecisionMaking ?? 0)
        );

        return new AiAnalysisReportDto(
            overallScore,
            summary,
            strengths,
            weaknesses,
            recommendations,
            "football-perf-mvp-v1",
            metrics
        );
    }
}

public record AnalysisTriggerResponse(
    [property: JsonPropertyName("analysis_id")] string AnalysisId,
    string Status
);

/// <summary>
/// Thrown by GetAnalysisStatusAsync when the AI service has the analysis_id
/// but hasn't finished processing it yet — the analyze-by-url endpoint
/// returns immediately and runs the real CV pipeline in the background, so
/// this is the expected state for a while, not a failure. Callers should
/// catch this and poll again after a delay.
/// </summary>
public class AnalysisStillProcessingException(string analysisId)
    : Exception($"AI analysis {analysisId} is still processing.")
{
    public string AnalysisId { get; } = analysisId;
}
