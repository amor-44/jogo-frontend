// Application/Common/Interfaces/IRefreshTokenService.cs
namespace Jogo.Application.Common.Interfaces;

public interface IRefreshTokenService
{
    Task SaveRefreshTokenAsync(Guid userId, string token, CancellationToken cancellationToken = default);
    Task<string?> GetRefreshTokenAsync(Guid userId, CancellationToken cancellationToken = default);
    Task RevokeRefreshTokenAsync(Guid userId, CancellationToken cancellationToken = default);
}