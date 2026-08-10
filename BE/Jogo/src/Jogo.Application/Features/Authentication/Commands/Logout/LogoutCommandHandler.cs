using Jogo.Application.Features.Authentication.DTOs;
using Jogo.Application.Common.Interfaces;
using Jogo.Domain.Common.Results;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Jogo.Application.Features.Authentication.Commands.Logout;

public class LogoutCommandHandler(
    IRefreshTokenService refreshTokenService,
    IUser currentUser,
    ILogger<LogoutCommandHandler> logger) : IRequestHandler<LogoutCommand, Result<Success>>
{
    public async Task<Result<Success>> Handle(LogoutCommand request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.RefreshToken))
        {
            return Error.Validation("Logout.MissingToken", "Refresh token is required.");
        }

        if (string.IsNullOrEmpty(currentUser.Id) || !Guid.TryParse(currentUser.Id, out var currentUserId))
        {
            logger.LogWarning("Logout failed: unable to parse current user id.");
            return Error.Unauthorized("Logout.Unauthorized", "User is not authorized.");
        }

        await refreshTokenService.RevokeRefreshTokenAsync(currentUserId, cancellationToken);
        
        logger.LogInformation("Successfully revoked refresh token for user {UserId}.", currentUserId);

        return Result.Success;
    }
}
