using Jogo.Application.Features.Authentication.DTOs;
using Jogo.Application.Common.Interfaces;
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
    Microsoft.Extensions.Caching.Hybrid.HybridCache hybridCache) : IRequestHandler<RegisterPlayerCommand, Result<AuthResponse>>
{
    public async Task<Result<AuthResponse>> Handle(RegisterPlayerCommand request, CancellationToken cancellationToken)
    {
        await using var transaction = await context.Database.BeginTransactionAsync(cancellationToken);
        try
        {
            var identityResult = await identityService.RegisterUserAsync(request.Email, request.Password, cancellationToken);
            if (identityResult.IsError)
            {
                return identityResult.Errors;
            }

            var userId = identityResult.Value;

            var userResult = User.Create(userId, Role.Player);
            if (userResult.IsError)
            {
                return userResult.Errors;
            }

            var profileExists = await context.PlayerProfiles
                .AnyAsync(x => x.UserId == userId, cancellationToken);

            if (profileExists)
            {
                return Error.Conflict("PlayerProfile.AlreadyExists", "A profile already exists for this user.");
            }

            var profileResult = PlayerProfile.Create(
                userId,
                request.FullName,
                request.DateOfBirth,
                request.PrimaryPosition,
                request.PreferredFoot,
                request.Country);

            if (profileResult.IsError)
            {
                return profileResult.Errors;
            }

            context.Users.Add(userResult.Value);
            context.PlayerProfiles.Add(profileResult.Value);
            await context.SaveChangesAsync(cancellationToken);

            await transaction.CommitAsync(cancellationToken);

            // Invalidate cache since a new player profile was created
            await hybridCache.RemoveByTagAsync("players", cancellationToken);
            await hybridCache.RemoveByTagAsync($"player-{profileResult.Value.Id}", cancellationToken);

            var (accessToken, refreshToken) = tokenProvider.GenerateTokens(userResult.Value);
            await refreshTokenService.SaveRefreshTokenAsync(userId, refreshToken, cancellationToken);

            return new AuthResponse(
                accessToken,
                refreshToken,
                userResult.Value.Role.ToString(),
                userId);
        }
        catch (Exception)
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
    }
}
