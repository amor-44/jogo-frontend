using Jogo.Domain.Common.Results;

using MediatR;

namespace Jogo.Application.Features.Scout.GetProfile;

public record GetProfileQuery : IRequest<Result<ProfileDto>>;
