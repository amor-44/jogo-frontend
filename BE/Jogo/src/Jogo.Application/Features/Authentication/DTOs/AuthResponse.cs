namespace Jogo.Application.Features.Authentication.DTOs;

public record AuthResponse(string AccessToken, string RefreshToken, string Role, Guid UserId);
