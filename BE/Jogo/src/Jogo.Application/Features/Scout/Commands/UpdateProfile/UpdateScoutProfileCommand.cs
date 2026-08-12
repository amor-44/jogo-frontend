using Jogo.Application.Features.Scout.DTOs;
using Jogo.Domain.Common.Results;

using MediatR;

namespace Jogo.Application.Features.Scout.Commands.UpdateProfile;

public record UpdateScoutProfileCommand(
    string Organization,
    string Country,
    int ExperienceYears
) : IRequest<Result<Success>>;
