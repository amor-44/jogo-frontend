using Jogo.Application.Features.Analysis.DTOs;

namespace Jogo.Application.Common.Interfaces;

public interface IAiAnalysisService
{
    Task<string> TriggerAnalysisAsync(
        string videoUrl,
        CancellationToken cancellationToken = default
    );
    Task<AiAnalysisReportDto?> GetAnalysisStatusAsync(
        string analysisId,
        CancellationToken cancellationToken = default
    );
}
