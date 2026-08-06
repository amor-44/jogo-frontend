using Jogo.Domain.Common.Results;
using Jogo.Domain.Enums;

using MediatR;

namespace Jogo.Application.Features.Scout.SearchPlayers;

public record SearchPlayersQuery(
    int PageNumber = 1,
    int PageSize = 10,
    int? MinAge = null,
    int? MaxAge = null,
    Position? Position = null,
    string? Country = null,
    int? MinOverallScore = null
) : IRequest<Result<SearchPlayersResponse>>;