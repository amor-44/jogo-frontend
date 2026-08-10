using Jogo.Application.Features.Analysis.DTOs;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Jogo.Application.Common.Interfaces;
using Jogo.Application.Common.Models;
using Jogo.Domain.Common.Results;

namespace Jogo.Application.Features.Analysis.Queries.ListReports;

public class ListReportsQueryHandler : IRequestHandler<ListReportsQuery, Result<PaginatedList<AnalysisReportDto>>>
{
    private readonly IAppDbContext _context;
    private readonly IUser _currentUser;

    public ListReportsQueryHandler(IAppDbContext context, IUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<PaginatedList<AnalysisReportDto>>> Handle(ListReportsQuery request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(_currentUser.Id) || !Guid.TryParse(_currentUser.Id, out var currentUserId))
        {
            return Error.Unauthorized("ListReports.Unauthorized", "User is not authorized.");
        }

        var profile = await _context.PlayerProfiles
            .FirstOrDefaultAsync(p => p.UserId == currentUserId, cancellationToken);

        if (profile == null)
        {
            return Error.NotFound("ListReports.ProfileNotFound", "Player profile not found.");
        }

        var query = _context.AnalysisReports
            .Include(r => r.FootballVideo)
            .Where(r => r.FootballVideo.PlayerProfileId == profile.Id);

        var totalCount = await query.CountAsync(cancellationToken);
        
        var reports = await query
            .OrderByDescending(r => r.CompletedAt)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        var dtos = reports.Select(report => new AnalysisReportDto(
            report.Id,
            report.VideoId,
            report.OverallScore,
            report.Summary,
            report.Strengths.ToList(),
            report.Weaknesses.ToList(),
            report.Recommendations.ToList(),
            report.AIModelVersion,
            report.CompletedAt,
            new PerformanceMetricsDto(
                report.Metrics.PositionScore,
                report.Metrics.PassingAccuracy,
                report.Metrics.BallControl,
                report.Metrics.PositioningScore,
                report.Metrics.MovementEfficiency,
                report.Metrics.DefensiveActions,
                report.Metrics.AttackingImpact,
                report.Metrics.DecisionMaking
            )
        )).ToList();

        var paginatedList = new PaginatedList<AnalysisReportDto>
        {
            Items = dtos,
            TotalCount = totalCount,
            PageNumber = request.PageNumber,
            PageSize = request.PageSize,
            TotalPages = (int)Math.Ceiling(totalCount / (double)request.PageSize)
        };

        return paginatedList;
    }
}
