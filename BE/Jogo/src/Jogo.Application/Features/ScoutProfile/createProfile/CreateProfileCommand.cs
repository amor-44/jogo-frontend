using Jogo.Domain.Common.Results;

using MediatR;

namespace Jogo.Application.Features.Scout.CreateProfile;

public record CreateProfileCommand(
    string Email,
    string Password,
    string Organization,
    string Country,
    int ExperienceYears) : IRequest<Result<CreateScoutProfileResponse>>;