using Jogo.Application.Features.Analysis.DTOs;
using System;
using MediatR;
using Jogo.Domain.Common.Results;

namespace Jogo.Application.Features.Analysis.Queries.GetReport;

public record GetReportQuery(Guid ReportId) : IRequest<Result<AnalysisReportDto>>;
