namespace Jogo.Application.Features.Player.DTOs;

public record CreateProfileResponse(
    Guid ProfileId,
    string AccessToken,
    string RefreshToken,
    string Role,
    Guid UserId);
