using Jogo.Domain.Common.Results;

using MediatR;

namespace Jogo.Application.Features.Scout.GetReport;

public record GetReportQuery(Guid PlayerId)
    : IRequest<Result<ReportDto>>;

