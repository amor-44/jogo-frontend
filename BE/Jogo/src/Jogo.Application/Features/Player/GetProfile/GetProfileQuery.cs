using Jogo.Domain.Common.Results;
using MediatR;

namespace Jogo.Application.Features.Player.GetProfile;

public record GetProfileQuery() : IRequest<Result<ProfileDto>>;
