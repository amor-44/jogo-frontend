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
using Jogo.Application.Dtos;

namespace Jogo.Infrastructure.Services.Ai;

/// <summary>
/// Calls the football_performance_analysis FastAPI service.
///
/// Flow:
///   1. TriggerAnalysisAsync  – POST /analyze-by-url  → returns analysis_id
///   2. GetAnalysisStatusAsync – GET /analysis/{id}    → maps report → AiAnalysisReportDto
/// </summary>
public class AiAnalysisService : IAiAnalysisService
{
    private readonly HttpClient _httpClient;

    // JSON options matching Python snake_case keys
    private static readonly JsonSerializerOptions _jsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
    };

    public AiAnalysisService(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    /// <summary>
    /// Sends the video URL to the AI service, which downloads the file and runs analysis.
    /// Returns the analysis_id to poll with.
    /// </summary>
    public async Task<string> TriggerAnalysisAsync(string videoUrl, CancellationToken cancellationToken = default)
    {
        var payload = new { video_url = videoUrl };

        var response = await _httpClient.PostAsJsonAsync(
            "/analyze-by-url",
            payload,
            _jsonOptions,
            cancellationToken);

        response.EnsureSuccessStatusCode();

        var result = await response.Content.ReadFromJsonAsync<AnalysisTriggerResponse>(
            _jsonOptions, cancellationToken: cancellationToken);

        return result?.AnalysisId
               ?? throw new InvalidOperationException("AI service did not return an analysis_id.");
    }

    /// <summary>
    /// Retrieves the completed report and maps it to AiAnalysisReportDto.
    /// Returns null if the analysis is not found or failed.
    /// </summary>
    public async Task<AiAnalysisReportDto?> GetAnalysisStatusAsync(string analysisId, CancellationToken cancellationToken = default)
    {
        var response = await _httpClient.GetAsync($"/analysis/{analysisId}", cancellationToken);
        if (!response.IsSuccessStatusCode)
            return null;

        var aiResponse = await response.Content.ReadFromJsonAsync<AiFootballPerformanceResponse>(
            _jsonOptions, cancellationToken: cancellationToken);

        if (aiResponse is null || aiResponse.Status == "failed")
            return null;

        return MapToDto(aiResponse);
    }

    // -----------------------------------------------------------------------
    // Mapping: FootballPerformanceReport.to_dict() → AiAnalysisReportDto
    // -----------------------------------------------------------------------
    private static AiAnalysisReportDto MapToDto(AiFootballPerformanceResponse ai)
    {
        var perf = ai.FootballPerformance;

        // overall_score is 0-100 float from the AI; cast to int for the DTO.
        // Fallback to 0 if the pipeline had insufficient evidence.
        var overallScore = perf?.Scores?.OverallScore is float s ? (int)Math.Round(s) : 0;

        // Build a human-readable summary from analysis_quality + limitations
        var quality = perf?.AnalysisQuality ?? "unknown";
        var firstLimitation = perf?.Limitations?.FirstOrDefault();
        var summary = firstLimitation is not null
            ? $"Analysis quality: {quality}. {firstLimitation}"
            : $"Football performance analysis completed. Quality: {quality}.";

        var strengths = perf?.Strengths ?? new List<string>();
        var weaknesses = perf?.Weaknesses ?? new List<string>();
        var recommendations = perf?.Recommendations ?? new List<string>();

        return new AiAnalysisReportDto(
            overallScore,
            summary,
            strengths,
            weaknesses,
            recommendations,
            AIModelVersion: "football-perf-mvp-v1"
        );
    }
}

/// <summary>Shape of the /analyze-by-url response body.</summary>
public record AnalysisTriggerResponse(
    [property: JsonPropertyName("analysis_id")] string AnalysisId,
    string Status
);
