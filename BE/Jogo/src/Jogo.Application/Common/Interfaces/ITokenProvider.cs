namespace Jogo.Application.Common.Interfaces;

public interface ITokenProvider
{
    string GenerateAccessToken(Guid userId, string role);
    string GenerateRefreshToken();
}
