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
        // محاكاة تأخير بسيط لبدء المعالجة
        await Task.Delay(500, cancellationToken);

        // إرجاع ID وهمي لعملية التحليل
        return $"fake-analysis-id-{Guid.NewGuid()}";
    }

    public async Task<AiAnalysisReportDto?> GetAnalysisStatusAsync(string analysisId, CancellationToken cancellationToken = default)
    {
        // محاكاة تأخير استرجاع النتيجة
        await Task.Delay(500, cancellationToken);

        // إرجاع الـ Dto بجميع الـ 6 قيم المطلوبة حسب الـ Constructor
        return new AiAnalysisReportDto(
            85,                                         // OverallScore (int)
            "Analysis completed successfully.",         // Summary (string)
            new List<string> { "Good pace", "High accuracy" },          // Strengths
            new List<string> { "Need stamina improvement" },           // Weaknesses
            new List<string> { "Practice daily drills" },               // Recommendations
            "https://example.com/processed-video.mp4"   // VideoUrl (string)
        );
    }
}