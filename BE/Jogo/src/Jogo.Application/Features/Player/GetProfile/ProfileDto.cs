using Jogo.Domain.Enums;

namespace Jogo.Application.Features.Player.GetProfile;

public record ProfileDto(
    Guid Id,
    string FullName,
    DateTime DateOfBirth,
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
    ProfileVisibility Visibility,
    bool IsComplete);