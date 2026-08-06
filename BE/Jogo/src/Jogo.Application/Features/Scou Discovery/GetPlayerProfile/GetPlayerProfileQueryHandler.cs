using Jogo.Application.Common.Interfaces;
using Jogo.Domain.Common.Results;

using MediatR;

using Microsoft.EntityFrameworkCore;

namespace Jogo.Application.Features.Scout.GetPlayerProfile;

public class GetPlayerProfileQueryHandler
    : IRequestHandler<GetPlayerProfileQuery, Result<PlayerProfileDto>>
{
    private readonly IAppDbContext _context;

    public GetPlayerProfileQueryHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<Result<PlayerProfileDto>> Handle(
        GetPlayerProfileQuery request,
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

        var bestScore = player.FootballVideos
            .Where(v => v.AnalysisReport != null)
            .Select(v => v.AnalysisReport!.OverallScore)
            .DefaultIfEmpty(0)
            .Max();

        return new PlayerProfileDto(
            player.Id,
            player.FullName,
            player.Age,
            player.Country,
            player.City,
            player.Height,
            player.Weight,
            player.PreferredFoot,
            player.PrimaryPosition,
            player.SecondaryPosition,
            player.CurrentClub,
            player.Biography,
            player.ProfilePictureUrl,
            bestScore);
    }
}