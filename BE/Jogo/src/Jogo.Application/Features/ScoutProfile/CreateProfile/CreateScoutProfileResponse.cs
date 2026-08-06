namespace Jogo.Application.Features.Scout.CreateProfile;

public record CreateScoutProfileResponse(
    Guid ProfileId,
    string AccessToken,
    string RefreshToken,
    string Role,
    Guid UserId,
    string Organization,
    string Country,
    int ExperienceYears);