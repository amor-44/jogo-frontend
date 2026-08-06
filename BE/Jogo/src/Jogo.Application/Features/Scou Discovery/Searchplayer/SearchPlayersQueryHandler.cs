using Jogo.Application.Common.Interfaces;
using Jogo.Domain.Common.Results;

using MediatR;

using Microsoft.EntityFrameworkCore;

namespace Jogo.Application.Features.Scout.SearchPlayers;

public class SearchPlayersQueryHandler
    : IRequestHandler<SearchPlayersQuery, Result<SearchPlayersResponse>>
{
    private readonly IAppDbContext _context;

    public SearchPlayersQueryHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<Result<SearchPlayersResponse>> Handle(
        SearchPlayersQuery request,
        CancellationToken cancellationToken)
    {
        var query = _context.PlayerProfiles
            .AsNoTracking()
            .AsQueryable();

        var today = DateTime.UtcNow.Date;

        if (request.MinAge.HasValue)
        {
            var maxBirthDate = today.AddYears(-request.MinAge.Value);
            query = query.Where(x => x.DateOfBirth <= maxBirthDate);
        }

        if (request.MaxAge.HasValue)
        {
            var minBirthDate = today.AddYears(-(request.MaxAge.Value + 1)).AddDays(1);
            query = query.Where(x => x.DateOfBirth >= minBirthDate);
        }

        if (request.Position.HasValue)
        {
            query = query.Where(x => x.PrimaryPosition == request.Position);
        }

        if (!string.IsNullOrWhiteSpace(request.Country))
        {
            query = query.Where(x => x.Country == request.Country);
        }

        var players = await query
            .Select(player => new
            {
                Player = player,
                BestScore = player.FootballVideos
                    .Where(v => v.AnalysisReport != null)
                    .Select(v => (int?)v.AnalysisReport!.OverallScore)
                    .Max() ?? 0
            })
            .ToListAsync(cancellationToken);

        var playerDtos = players
            .Select(x => new PlayerCardDto(
                x.Player.Id,
                x.Player.FullName,
                x.Player.Age,
                x.Player.Country,
                x.Player.PrimaryPosition,
                x.BestScore,
                x.Player.ProfilePictureUrl
            ));

        if (request.MinOverallScore.HasValue)
        {
            playerDtos = playerDtos
                .Where(x => x.BestOverallScore >= request.MinOverallScore.Value);
        }

        var filteredList = playerDtos.ToList();
        var totalCount = filteredList.Count;

        var resultPlayers = filteredList
            .OrderByDescending(x => x.BestOverallScore)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToList();

        return new SearchPlayersResponse(
            resultPlayers,
            totalCount,
            request.PageNumber,
            request.PageSize);
    }
}