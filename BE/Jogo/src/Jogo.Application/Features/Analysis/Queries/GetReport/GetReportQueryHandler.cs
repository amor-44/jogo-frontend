using Jogo.Application.Features.Analysis.DTOs;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Jogo.Application.Common.Interfaces;
using Jogo.Domain.Common.Results;
using Jogo.Domain.Enums;

namespace Jogo.Application.Features.Analysis.Queries.GetReport;

public class GetReportQueryHandler : IRequestHandler<GetReportQuery, Result<AnalysisReportDto>>
{
    private readonly IAppDbContext _context;
    private readonly IUser _currentUser;

    public GetReportQueryHandler(IAppDbContext context, IUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<AnalysisReportDto>> Handle(GetReportQuery request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(_currentUser.Id) || !Guid.TryParse(_currentUser.Id, out var currentUserId))
        {
            return Error.Unauthorized("GetReport.Unauthorized", "User is not authorized.");
        }

        var report = await _context.AnalysisReports
            .Include(r => r.FootballVideo)
            .FirstOrDefaultAsync(r => r.Id == request.ReportId, cancellationToken);

        if (report == null)
        {
            return Error.NotFound("GetReport.NotFound", "Report not found.");
        }

        // Check if the current user is a player who owns the video
        var playerProfile = await _context.PlayerProfiles
            .FirstOrDefaultAsync(p => p.UserId == currentUserId, cancellationToken);

        if (playerProfile != null)
        {
            if (report.FootballVideo.PlayerProfileId != playerProfile.Id)
            {
                return Error.Forbidden("GetReport.Forbidden", "You can only view your own reports.");
            }
        }
        else
        {
            // Current user might be a scout
            var scoutProfile = await _context.ScoutProfiles
                .FirstOrDefaultAsync(s => s.UserId == currentUserId, cancellationToken);

            if (scoutProfile == null)
            {
                // Not a player and not a scout
                return Error.Forbidden("GetReport.Forbidden", "You do not have permission to view this report.");
            }
            
            // Scouts can only view reports if there is an accepted contact request
            var hasAcceptedContactRequest = await _context.ContactRequests
                .AnyAsync(cr => cr.ScoutProfileId == scoutProfile.Id 
                             && cr.PlayerProfileId == report.FootballVideo.PlayerProfileId 
                             && cr.Status == ContactRequestStatus.Accepted, cancellationToken);
                             
            if (!hasAcceptedContactRequest)
            {
                return Error.Forbidden("GetReport.Forbidden", "You must have an accepted contact request with this player to view their reports.");
            }
        }

        var metricsDto = new PerformanceMetricsDto(
            report.Metrics.PositionScore,
            report.Metrics.PassingAccuracy,
            report.Metrics.BallControl,
            report.Metrics.PositioningScore,
            report.Metrics.MovementEfficiency,
            report.Metrics.DefensiveActions,
            report.Metrics.AttackingImpact,
            report.Metrics.DecisionMaking
        );

        var dto = new AnalysisReportDto(
            report.Id,
            report.VideoId,
            report.OverallScore,
            report.Summary,
            report.Strengths.ToList(),
            report.Weaknesses.ToList(),
            report.Recommendations.ToList(),
            report.AIModelVersion,
            report.CompletedAt,
            metricsDto
        );

        return dto;
    }
}
