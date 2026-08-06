namespace Jogo.Application.Features.Player.CreateProfile;

public record CreateProfileResponse(
    Guid ProfileId,
    string AccessToken,
    string RefreshToken,
    string Role,
    Guid UserId);