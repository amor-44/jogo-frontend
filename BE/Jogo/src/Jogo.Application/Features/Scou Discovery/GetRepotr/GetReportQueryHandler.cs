using Jogo.Application.Common.Interfaces;
using Jogo.Domain.Common.Results;

using MediatR;

using Microsoft.EntityFrameworkCore;

namespace Jogo.Application.Features.Scout.GetReport;

public class GetReportQueryHandler
    : IRequestHandler<GetReportQuery, Result<ReportDto>>
{
    private readonly IAppDbContext _context;

    public GetReportQueryHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<Result<ReportDto>> Handle(
        GetReportQuery request,
        CancellationToken cancellationToken)
    {
        var player = await _context.PlayerProfiles
            .AsNoTracking()
            .Include(x => x.FootballVideos)
                .ThenInclude(x => x.AnalysisReport)
            .FirstOrDefaultAsync(x => x.Id == request.PlayerId, cancellationToken);

        if (player == null)
        {
            return Error.NotFound(
                "PlayerProfile.NotFound",
                "Player profile not found.");
        }

        var report = player.FootballVideos
            .Where(v => v.AnalysisReport != null)
            .Select(v => v.AnalysisReport!)
            .OrderByDescending(r => r.OverallScore)
            .FirstOrDefault();

        if (report == null)
        {
            return Error.NotFound(
                "AnalysisReport.NotFound",
                "No analysis report found.");
        }

        return new ReportDto(
            report.Id,
            report.OverallScore,
            report.Summary,
            report.Strengths,
            report.Weaknesses,
            report.Recommendations,
            report.CompletedAt,
            report.AIModelVersion);
    }
}