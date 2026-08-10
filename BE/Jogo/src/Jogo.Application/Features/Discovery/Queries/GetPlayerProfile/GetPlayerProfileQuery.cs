using Jogo.Application.Features.Discovery.DTOs;
using Jogo.Domain.Common.Results;

using MediatR;

using Jogo.Application.Common.Interfaces;

namespace Jogo.Application.Features.Discovery.Queries.GetPlayerProfile;

public sealed record GetPlayerProfileQuery(Guid ProfileId) : ICachedQuery<Result<PlayerCardDto>>
{
    string ICachedQuery.CacheKey => $"player-profile-{ProfileId}";
    string[] ICachedQuery.Tags => ["players", $"player-{ProfileId}"];
    TimeSpan ICachedQuery.Expiration => TimeSpan.FromMinutes(10);
}