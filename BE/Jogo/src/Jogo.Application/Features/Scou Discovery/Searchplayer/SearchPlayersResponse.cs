namespace Jogo.Application.Features.Scout.SearchPlayers;

public record SearchPlayersResponse(
    IReadOnlyList<PlayerCardDto> Players,
    int TotalCount,
    int PageNumber,
    int PageSize
);
