using Jogo.Application.Common.Interfaces;
using Jogo.Application.Features.Authentication.DTOs;
using Jogo.Domain.Common.Results;
using Jogo.Domain.Entities;
using Jogo.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Jogo.Application.Features.Authentication.Commands.RegisterScout;

public class RegisterScoutCommandHandler(
    IIdentityService identityService,
    ITokenProvider tokenProvider,
    IRefreshTokenService refreshTokenService,
    IAppDbContext context
) : IRequestHandler<RegisterScoutCommand, Result<AuthResponse>>
{
    public async Task<Result<AuthResponse>> Handle(
        RegisterScoutCommand request,
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
            var userResult = User.Create(userId, Role.Scout);

            if (userResult.IsError)
            {
                await transaction.RollbackAsync(cancellationToken);
                return userResult.Errors;
            }

            // 3. Check whether Scout profile already exists
            var profileExists = await context.ScoutProfiles.AnyAsync(
                x => x.UserId == userId,
                cancellationToken
            );

            if (profileExists)
            {
                await transaction.RollbackAsync(cancellationToken);

                return Error.Conflict(
                    "ScoutProfile.AlreadyExists",
                    "A profile already exists for this user."
                );
            }

            // 4. Create Scout profile
            var profileResult = ScoutProfile.Create(
                userId,
                request.Organization,
                request.Country,
                request.ExperienceYears
            );

            if (profileResult.IsError)
            {
                await transaction.RollbackAsync(cancellationToken);
                return profileResult.Errors;
            }

            // 5. Add application entities
            context.Users.Add(userResult.Value);
            context.ScoutProfiles.Add(profileResult.Value);

            // 6. Save database changes
            await context.SaveChangesAsync(cancellationToken);

            // 7. Commit database transaction
            await transaction.CommitAsync(cancellationToken);

            // ---------------------------------------------------------
            // Transaction is finished here.
            // Nothing below should attempt to rollback this transaction.
            // ---------------------------------------------------------

            // 8. Generate tokens
            var (accessToken, refreshToken) = tokenProvider.GenerateTokens(userResult.Value);

            // 9. Save refresh token
            await refreshTokenService.SaveRefreshTokenAsync(
                userId,
                refreshToken,
                cancellationToken
            );

            // 10. Return authentication response
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
            // Never allow rollback failure to hide the original exception.
            try
            {
                await transaction.RollbackAsync(cancellationToken);
            }
            catch (InvalidOperationException)
            {
                // Transaction has already completed.
            }

            throw;
        }
    }
}
