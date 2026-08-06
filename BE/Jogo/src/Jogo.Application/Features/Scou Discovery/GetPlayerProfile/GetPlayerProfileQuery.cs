using Jogo.Domain.Common.Results;

using MediatR;

namespace Jogo.Application.Features.Scout.GetPlayerProfile;

public record GetPlayerProfileQuery(Guid PlayerId)
    : IRequest<Result<PlayerProfileDto>>;
