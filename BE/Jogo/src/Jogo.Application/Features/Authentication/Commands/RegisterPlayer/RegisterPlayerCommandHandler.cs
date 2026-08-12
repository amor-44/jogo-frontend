using Jogo.Application.Common.Interfaces;
using Jogo.Application.Features.Authentication.DTOs;
using Jogo.Domain.Common.Results;
using Jogo.Domain.Entities;
using Jogo.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Jogo.Application.Features.Authentication.Commands.RegisterPlayer;

public class RegisterPlayerCommandHandler(
    IIdentityService identityService,
    ITokenProvider tokenProvider,
    IRefreshTokenService refreshTokenService,
    IAppDbContext context,
    Microsoft.Extensions.Caching.Hybrid.HybridCache hybridCache
) : IRequestHandler<RegisterPlayerCommand, Result<AuthResponse>>
{
    public async Task<Result<AuthResponse>> Handle(
        RegisterPlayerCommand request,
        CancellationToken cancellationToken
    )
    {
        await using var transaction = await context.Database.BeginTransactionAsync(
            cancellationToken
        );

        try
        {
            // 1. Create Identity user
            var identityResult = await identityService.RegisterUserAsync(
                request.Email,
                request.Password,
                cancellationToken
            );

            if (identityResult.IsError)
            {
                await transaction.RollbackAsync(cancellationToken);
                return identityResult.Errors;
            }

            var userId = identityResult.Value;

            // 2. Create application User
            var userResult = User.Create(userId, Role.Player);

            if (userResult.IsError)
            {
                await transaction.RollbackAsync(cancellationToken);
                return userResult.Errors;
            }

            // 3. Make sure profile doesn't already exist
            var profileExists = await context.PlayerProfiles.AnyAsync(
                x => x.UserId == userId,
                cancellationToken
            );

            if (profileExists)
            {
                await transaction.RollbackAsync(cancellationToken);

                return Error.Conflict(
                    "PlayerProfile.AlreadyExists",
                    "A profile already exists for this user."
                );
            }

            // 4. Create player profile
            var profileResult = PlayerProfile.Create(
                userId,
                request.FullName,
                request.DateOfBirth,
                request.PrimaryPosition,
                request.PreferredFoot,
                request.Country
            );

            if (profileResult.IsError)
            {
                await transaction.RollbackAsync(cancellationToken);
                return profileResult.Errors;
            }

            // 5. Add application entities
            context.Users.Add(userResult.Value);
            context.PlayerProfiles.Add(profileResult.Value);

            // 6. Save database changes
            await context.SaveChangesAsync(cancellationToken);

            // 7. Commit database transaction
            await transaction.CommitAsync(cancellationToken);

            // ---------------------------------------------------------
            // Everything below this point happens AFTER the DB commit.
            // Do NOT attempt to rollback the transaction here.
            // ---------------------------------------------------------

            // 8. Invalidate cache
            await hybridCache.RemoveByTagAsync("players", cancellationToken);

            await hybridCache.RemoveByTagAsync(
                $"player-{profileResult.Value.Id}",
                cancellationToken
            );

            // 9. Generate tokens
            var (accessToken, refreshToken) = tokenProvider.GenerateTokens(userResult.Value);

            // 10. Save refresh token
            await refreshTokenService.SaveRefreshTokenAsync(
                userId,
                refreshToken,
                cancellationToken
            );

            // 11. Return response
            return new AuthResponse(
                accessToken,
                refreshToken,
                userResult.Value.Role.ToString(),
                userId
            );
        }
        catch
        {
            // The transaction may already have been committed.
            // Only rollback if the transaction is still active.
            try
            {
                await transaction.RollbackAsync(cancellationToken);
            }
            catch (InvalidOperationException)
            {
                // Transaction has already completed.
                // Do not hide the original exception.
            }

            throw;
        }
    }
}
