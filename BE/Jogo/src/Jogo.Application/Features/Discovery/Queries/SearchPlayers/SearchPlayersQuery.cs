using Jogo.Application.Common.Interfaces;
using Jogo.Application.Common.Models;
using Jogo.Application.Features.Discovery.DTOs;
using Jogo.Domain.Common.Results;
using Jogo.Domain.Enums;

namespace Jogo.Application.Features.Discovery.Queries.SearchPlayers;

public sealed record SearchPlayersQuery(
    int PageNumber = 1,
    int PageSize = 10,
    int? MinAge = null,
    int? MaxAge = null,
    Position? Position = null,
    string? Country = null,
    int? MinOverallScore = null,
    int? MaxOverallScore = null) : ICachedQuery<Result<PaginatedList<PlayerCardDto>>>
{
    string ICachedQuery.CacheKey => $"players-search-{PageNumber}-{PageSize}-{MinAge}-{MaxAge}-{Position}-{Country}-{MinOverallScore}-{MaxOverallScore}";

    string[] ICachedQuery.Tags => ["players"];

    TimeSpan ICachedQuery.Expiration => TimeSpan.FromMinutes(5);
}
