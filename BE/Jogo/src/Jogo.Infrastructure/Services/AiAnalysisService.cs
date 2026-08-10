using System;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading;
using System.Threading.Tasks;

using Jogo.Application.Common.Interfaces;
using Jogo.Application.Dtos;

namespace Jogo.Infrastructure.Services.Ai;

public class AiAnalysisService : IAiAnalysisService
{
    private readonly HttpClient _httpClient;

    public AiAnalysisService(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<string> TriggerAnalysisAsync(string videoUrl, CancellationToken cancellationToken = default)
    {
        var response = await _httpClient.PostAsJsonAsync("/analyze", new { video_url = videoUrl }, cancellationToken);
        response.EnsureSuccessStatusCode();

        var result = await response.Content.ReadFromJsonAsync<AnalysisTriggerResponse>(cancellationToken: cancellationToken);
        return result?.AnalysisId ?? throw new InvalidOperationException("Failed to retrieve analysis ID from AI service.");
    }

    public async Task<AiAnalysisReportDto?> GetAnalysisStatusAsync(string analysisId, CancellationToken cancellationToken = default)
    {
        var response = await _httpClient.GetAsync($"/analysis/{analysisId}", cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            return null;
        }

        return await response.Content.ReadFromJsonAsync<AiAnalysisReportDto>(cancellationToken: cancellationToken);
    }
}

public record AnalysisTriggerResponse(string AnalysisId);