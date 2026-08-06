using Jogo.Domain.Enums;

namespace Jogo.Application.Features.Scout.SearchPlayers;

public record PlayerCardDto(
    Guid Id,
    string FullName,
    int Age,
    string Country,
    Position PrimaryPosition,
    int BestOverallScore,
    string? ProfilePictureUrl
);