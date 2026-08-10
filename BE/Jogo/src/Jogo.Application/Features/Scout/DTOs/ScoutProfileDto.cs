namespace Jogo.Application.Features.Scout.DTOs;

public record ScoutProfileDto(
    Guid Id,
    string Organization,
    string Country,
    int ExperienceYears
);
