using Jogo.Application.Common.Interfaces;
using Jogo.Application.Dtos;

namespace Jogo.Infrastructure.Services;

public class FakeAiAnalysisService : IAiAnalysisService
{
    public async Task<AiAnalysisReportDto> AnalyzeAsync(string storageUrl, CancellationToken cancellationToken = default)
    {
        // Simulate a delay for the AI analysis
        await Task.Delay(TimeSpan.FromSeconds(3), cancellationToken);

        return new AiAnalysisReportDto(
            OverallScore: 85,
            Summary: "Solid performance overall, but needs to work on positioning during counter-attacks.",
            Strengths: ["Excellent ball control", "Accurate passing"],
            Weaknesses: ["Defensive positioning", "Stamina"],
            Recommendations: ["Focus on interval training", "Review defensive drills"],
            AIModelVersion: "FakeAI-1.0.0"
        );
    }
}
