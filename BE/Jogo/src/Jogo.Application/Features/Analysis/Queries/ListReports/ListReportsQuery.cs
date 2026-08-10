using Jogo.Application.Features.Analysis.DTOs;
using MediatR;
using Jogo.Application.Common.Models;
using Jogo.Domain.Common.Results;

namespace Jogo.Application.Features.Analysis.Queries.ListReports;

public record ListReportsQuery(int PageNumber = 1, int PageSize = 10) : IRequest<Result<PaginatedList<AnalysisReportDto>>>;
