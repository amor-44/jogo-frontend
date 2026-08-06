// Infrastructure/Services/RefreshTokenService.cs
using Jogo.Application.Common.Interfaces;

using Microsoft.Extensions.Caching.Distributed;

namespace Jogo.Infrastructure.Services;

public class RefreshTokenService : IRefreshTokenService
{
    private readonly IDistributedCache _cache;

    public RefreshTokenService(IDistributedCache cache)
    {
        _cache = cache;
    }

    public async Task SaveRefreshTokenAsync(Guid userId, string token, CancellationToken cancellationToken = default) =>
        await _cache.SetStringAsync(
            $"refresh:{userId}",
            token,
            new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromDays(7)
            },
            cancellationToken);

    public async Task<string?> GetRefreshTokenAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _cache.GetStringAsync($"refresh:{userId}", cancellationToken);
    }

    public async Task RevokeRefreshTokenAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        await _cache.RemoveAsync($"refresh:{userId}", cancellationToken);
    }
}