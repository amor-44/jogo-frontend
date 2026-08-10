using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

using Jogo.Application.Common.Interfaces;
using Jogo.Application.Features.Analysis.DTOs;

namespace Jogo.Infrastructure.Services;

public class FakeAiAnalysisService : IAiAnalysisService
{
    public async Task<string> TriggerAnalysisAsync(string videoUrl, CancellationToken cancellationToken = default)
    {
        // Ù…Ø­Ø§ÙƒØ§Ø© ØªØ£Ø®ÙŠØ± Ø¨Ø³ÙŠØ· Ù„Ø¨Ø¯Ø¡ Ø§Ù„Ù…Ø¹Ø§Ù„Ø¬Ø©
        await Task.Delay(500, cancellationToken);

        // Ø¥Ø±Ø¬Ø§Ø¹ ID ÙˆÙ‡Ù…ÙŠ Ù„Ø¹Ù…Ù„ÙŠØ© Ø§Ù„ØªØ­Ù„ÙŠÙ„
        return $"fake-analysis-id-{Guid.NewGuid()}";
    }

    public async Task<AiAnalysisReportDto?> GetAnalysisStatusAsync(string analysisId, CancellationToken cancellationToken = default)
    {
        // Ù…Ø­Ø§ÙƒØ§Ø© ØªØ£Ø®ÙŠØ± Ø§Ø³ØªØ±Ø¬Ø§Ø¹ Ø§Ù„Ù†ØªÙŠØ¬Ø©
        await Task.Delay(500, cancellationToken);

        var random = Random.Shared;
        int overallScore = random.Next(50, 99);
        
        return new AiAnalysisReportDto(
            OverallScore: overallScore,
            Summary: $"Simulated performance analysis. Player showed varying degrees of proficiency.",
            Strengths: ["Excellent ball control", "Accurate passing"],
            Weaknesses: ["Defensive positioning", "Stamina"],
            Recommendations: ["Focus on interval training", "Review defensive drills"],
            AIModelVersion: "FakeAI-1.1.0",
            Metrics: new PerformanceMetricsDto(
                PositionScore: random.Next(40, 100),
                PassingAccuracy: random.Next(40, 100),
                BallControl: random.Next(40, 100),
                PositioningScore: random.Next(40, 100),
                MovementEfficiency: random.Next(40, 100),
                DefensiveActions: random.Next(40, 100),
                AttackingImpact: random.Next(40, 100),
                DecisionMaking: random.Next(40, 100)
            )
        );
    }
}
