using Jogo.Application.Common.Interfaces;
using Jogo.Application.Common.Models;
using Jogo.Application.Features.Discovery.DTOs;
using Jogo.Domain.Common.Results;
using Jogo.Domain.Enums;

using MediatR;

using Microsoft.EntityFrameworkCore;

namespace Jogo.Application.Features.Discovery.Queries.SearchPlayers;

public class SearchPlayersQueryHandler(IAppDbContext context) : IRequestHandler<SearchPlayersQuery, Result<PaginatedList<PlayerCardDto>>>
{
    public async Task<Result<PaginatedList<PlayerCardDto>>> Handle(SearchPlayersQuery request, CancellationToken cancellationToken)
    {
        var query = context.PlayerProfiles
            .Where(p => p.Visibility == ProfileVisibility.Public);

        if (!string.IsNullOrWhiteSpace(request.Country))
        {
            query = query.Where(p => p.Country == request.Country);
        }

        if (request.Position.HasValue)
        {
            query = query.Where(p => p.PrimaryPosition == request.Position.Value || p.SecondaryPosition == request.Position.Value);
        }

        if (request.MinAge.HasValue)
        {
            var maxDateOfBirth = DateTime.Today.AddYears(-request.MinAge.Value);
            query = query.Where(p => p.DateOfBirth <= maxDateOfBirth);
        }

        if (request.MaxAge.HasValue)
        {
            // If MaxAge is 20, they cannot have had their 21st birthday yet.
            var minDateOfBirth = DateTime.Today.AddYears(-request.MaxAge.Value - 1).AddDays(1);
            query = query.Where(p => p.DateOfBirth >= minDateOfBirth);
        }

        var projectedQuery = query.Select(p => new
        {
            Id = p.Id,
            FullName = p.FullName,
            DateOfBirth = p.DateOfBirth,
            Country = p.Country,
            City = p.City,
            PrimaryPosition = p.PrimaryPosition,
            SecondaryPosition = p.SecondaryPosition,
            CurrentClub = p.CurrentClub,
            FootballExperience = p.FootballExperience,
            MarketValue = p.MarketValue,
            ProfilePictureUrl = p.ProfilePictureUrl,
            LatestOverallScore = p.FootballVideos
                .Where(v => v.AnalysisReport != null)
                .OrderByDescending(v => v.AnalysisReport!.CompletedAt)
                .Select(v => (int?)v.AnalysisReport!.OverallScore)
                .FirstOrDefault(),
            VideoCount = p.FootballVideos.Count
        });

        if (request.MinOverallScore.HasValue)
        {
            projectedQuery = projectedQuery.Where(p => p.LatestOverallScore >= request.MinOverallScore.Value);
        }

        if (request.MaxOverallScore.HasValue)
        {
            projectedQuery = projectedQuery.Where(p => p.LatestOverallScore <= request.MaxOverallScore.Value);
        }

        var totalCount = await projectedQuery.CountAsync(cancellationToken);

        var paginatedItems = await projectedQuery
            .OrderBy(p => p.FullName)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        var resultItems = paginatedItems.Select(item => new PlayerCardDto(
            item.Id,
            item.FullName,
            (int)((DateTime.Today - item.DateOfBirth).TotalDays / 365.2425),
            item.Country,
            item.City,
            item.PrimaryPosition,
            item.SecondaryPosition,
            item.CurrentClub,
            item.FootballExperience,
            item.MarketValue,
            item.ProfilePictureUrl,
            item.LatestOverallScore,
            item.VideoCount
        )).ToList();

        var totalPages = (int)Math.Ceiling(totalCount / (double)request.PageSize);

        var paginatedList = new PaginatedList<PlayerCardDto>
        {
            PageNumber = request.PageNumber,
            PageSize = request.PageSize,
            TotalPages = totalPages,
            TotalCount = totalCount,
            Items = resultItems
        };

        return paginatedList;
    }
}
