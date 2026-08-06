using System.Security.Claims;

using Jogo.Domain.Entities;

namespace Jogo.Application.Common.Interfaces;

public interface ITokenProvider
{
    (string AccessToken, string RefreshToken) GenerateTokens(User user);
    string GenerateRefreshToken();
    ClaimsPrincipal? GetPrincipalFromExpiredToken(string token);
}
