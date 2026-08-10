using Jogo.Application.Features.Scout.DTOs;
using Jogo.Domain.Common.Results;

using MediatR;

namespace Jogo.Application.Features.Scout.Queries.GetProfile;

public record GetProfileQuery : IRequest<Result<ScoutProfileDto>>;
