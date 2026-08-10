using Jogo.Application.Features.Player.DTOs;
using Jogo.Domain.Common.Results;
using MediatR;

namespace Jogo.Application.Features.Player.Queries.GetProfile;

public record GetProfileQuery() : IRequest<Result<PlayerProfileDto>>;
