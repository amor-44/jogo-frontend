using System.Security.Claims;

using Jogo.Application.Common.Interfaces;
using Jogo.Domain.Common.Results;

using MediatR;

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Jogo.Application.Features.Authentication.Refresh;

public class RefreshCommandHandler(
    ITokenProvider tokenProvider,
    IRefreshTokenService refreshTokenService,
    IAppDbContext context,
    ILogger<RefreshCommandHandler> logger) : IRequestHandler<RefreshCommand, Result<RefreshResponse>>
{
    public async Task<Result<RefreshResponse>> Handle(RefreshCommand request, CancellationToken cancellationToken)
    {
        // 1. استخراج الـ Claims من الـ Access Token المنتهي
        ClaimsPrincipal? principal;
        try
        {
            principal = tokenProvider.GetPrincipalFromExpiredToken(request.AccessToken);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Failed to parse expired access token.");
            return Error.Unauthorized("AccessToken.Invalid", "Invalid access token.");
        }

        if (principal is null)
        {
            logger.LogWarning("Access token principal is null.");
            return Error.Unauthorized("AccessToken.Invalid", "Invalid access token.");
        }

        var userIdClaim = principal.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdClaim, out var userId))
        {
            logger.LogWarning("Invalid UserId claim format in token: {UserIdClaim}", userIdClaim);
            return Error.Unauthorized("AccessToken.InvalidClaims", "Invalid token claims.");
        }

        // 2. التحقق من وجود المستخدم في قاعدة البيانات
        var user = await context.Users.FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);
        if (user is null)
        {
            logger.LogWarning("User with ID {UserId} was not found during refresh token operation.", userId);
            return Error.NotFound("User.NotFound", "User not found.");
        }

        // 3. التحقق من الـ Refresh Token في Redis Cache
        var savedRefreshToken = await refreshTokenService.GetRefreshTokenAsync(userId, cancellationToken);
        if (string.IsNullOrEmpty(savedRefreshToken) || savedRefreshToken != request.RefreshToken)
        {
            logger.LogWarning("Invalid or expired refresh token attempt for user {UserId}.", userId);
            return Error.Unauthorized("RefreshToken.Invalid", "Refresh token is invalid or expired.");
        }

        // 4. توليد التوكينات وتقسيم الـ Tuple
        var (newAccessToken, newRefreshToken) = tokenProvider.GenerateTokens(user);

        // 5. حفظ الـ Refresh Token الجديد في Redis
        await refreshTokenService.SaveRefreshTokenAsync(userId, newRefreshToken, cancellationToken);

        logger.LogInformation("Successfully refreshed token for user: {UserId}", userId);

        // 6. إرجاع النتيجة
        return new RefreshResponse(newAccessToken, newRefreshToken);
    }
}