using Jogo.Application.Dtos;

namespace Jogo.Application.Common.Interfaces;

public interface IAiAnalysisService
{
    Task<AiAnalysisReportDto> AnalyzeAsync(string storageUrl, CancellationToken cancellationToken = default);
}
