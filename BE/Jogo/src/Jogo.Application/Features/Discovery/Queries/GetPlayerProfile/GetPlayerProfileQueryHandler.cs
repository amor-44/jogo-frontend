using Jogo.Application.Features.Discovery.DTOs;
using Jogo.Application.Common.Interfaces;
using Jogo.Domain.Common.Results;
using Jogo.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Jogo.Application.Features.Discovery.Queries.GetPlayerProfile;

public class GetPlayerProfileQueryHandler(IAppDbContext context) : IRequestHandler<GetPlayerProfileQuery, Result<PlayerCardDto>>
{
    public async Task<Result<PlayerCardDto>> Handle(GetPlayerProfileQuery request, CancellationToken cancellationToken)
    {
        var player = await context.PlayerProfiles
            .Include(p => p.FootballVideos)
            .ThenInclude(v => v.AnalysisReport)
            .FirstOrDefaultAsync(p => p.Id == request.ProfileId, cancellationToken);

        if (player == null)
        {
            return Error.NotFound("Player.NotFound", "Player profile not found.");
        }

        if (player.Visibility != ProfileVisibility.Public)
        {
            return Error.Forbidden("Player.Hidden", "This player profile is not public.");
        }

        var reports = player.FootballVideos
            .Select(v => v.AnalysisReport)
            .Where(r => r != null)
            .OrderByDescending(r => r!.CompletedAt)
            .Select(report => new Jogo.Application.Features.Analysis.DTOs.AnalysisReportDto(
                report!.Id,
                report.VideoId,
                report.OverallScore,
                report.Summary,
                report.Strengths.ToList(),
                report.Weaknesses.ToList(),
                report.Recommendations.ToList(),
                report.AIModelVersion,
                report.CompletedAt,
                new Jogo.Application.Features.Analysis.DTOs.PerformanceMetricsDto(
                    report.Metrics.PositionScore,
                    report.Metrics.PassingAccuracy,
                    report.Metrics.BallControl,
                    report.Metrics.PositioningScore,
                    report.Metrics.MovementEfficiency,
                    report.Metrics.DefensiveActions,
                    report.Metrics.AttackingImpact,
                    report.Metrics.DecisionMaking
                )
            ))
            .ToList();

        int? latestOverallScore = reports.Count > 0 ? reports.First().OverallScore : null;

        var dto = new PlayerCardDto(
            player.Id,
            player.FullName,
            player.Age,
            player.Country,
            player.City,
            player.PrimaryPosition,
            player.SecondaryPosition,
            player.CurrentClub,
            player.FootballExperience,
            player.MarketValue,
            player.ProfilePictureUrl,
            latestOverallScore,
            player.FootballVideos.Count,
            reports);

        return dto;
    }
}
