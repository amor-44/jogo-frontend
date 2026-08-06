using Jogo.Domain.Common.Results;

using MediatR;

namespace Jogo.Application.Features.Scout.UpdateProfile;

public record UpdateProfileCommand(
    string Organization,
    string Country,
    int ExperienceYears
) : IRequest<Result<Success>>;
