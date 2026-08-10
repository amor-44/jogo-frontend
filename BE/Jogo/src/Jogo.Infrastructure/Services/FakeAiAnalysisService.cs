using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

using Jogo.Application.Common.Interfaces;
using Jogo.Application.Dtos;

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

        // Ø¥Ø±Ø¬Ø§Ø¹ Ø§Ù„Ù€ Dto Ø¨Ø¬Ù…ÙŠØ¹ Ø§Ù„Ù€ 6 Ù‚ÙŠÙ… Ø§Ù„Ù…Ø·Ù„ÙˆØ¨Ø© Ø­Ø³Ø¨ Ø§Ù„Ù€ Constructor
        return new AiAnalysisReportDto(
            85,                                         // OverallScore (int)
            "Analysis completed successfully.",         // Summary (string)
            new List<string> { "Good pace", "High accuracy" },          // Strengths
            new List<string> { "Need stamina improvement" },           // Weaknesses
            new List<string> { "Practice daily drills" },               // Recommendations
            "fake-ai-v1"                                            // AIModelVersion
        );
    }
}
