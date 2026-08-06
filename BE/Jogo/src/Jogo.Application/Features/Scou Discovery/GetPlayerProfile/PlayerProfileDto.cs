using Jogo.Domain.Enums;

namespace Jogo.Application.Features.Scout.GetPlayerProfile;

public record PlayerProfileDto(
    Guid Id,
    string FullName,
    int Age,
    string Country,
    string? City,
    decimal? Height,
    decimal? Weight,
    PreferredFoot PreferredFoot,
    Position PrimaryPosition,
    Position? SecondaryPosition,
    string? CurrentClub,
    string? Biography,
    string? ProfilePictureUrl,
    int BestOverallScore
);