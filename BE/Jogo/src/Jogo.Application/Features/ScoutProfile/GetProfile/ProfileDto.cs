namespace Jogo.Application.Features.Scout.GetProfile;

public record ProfileDto(
    Guid Id,
    string Organization,
    string Country,
    int ExperienceYears
);
