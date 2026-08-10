using Jogo.Application.Features.Authentication.DTOs;
using Jogo.Application.Common.Interfaces;
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
    IAppDbContext context) : IRequestHandler<RegisterScoutCommand, Result<AuthResponse>>
{
    public async Task<Result<AuthResponse>> Handle(RegisterScoutCommand request, CancellationToken cancellationToken)
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

            var userResult = User.Create(userId, Role.Scout);
            if (userResult.IsError)
            {
                return userResult.Errors;
            }

            var profileExists = await context.ScoutProfiles
                .AnyAsync(x => x.UserId == userId, cancellationToken);

            if (profileExists)
            {
                return Error.Conflict("ScoutProfile.AlreadyExists", "A profile already exists for this user.");
            }

            var profileResult = ScoutProfile.Create(
                userId,
                request.Organization,
                request.Country,
                request.ExperienceYears);

            if (profileResult.IsError)
            {
                return profileResult.Errors;
            }

            context.Users.Add(userResult.Value);
            context.ScoutProfiles.Add(profileResult.Value);
            await context.SaveChangesAsync(cancellationToken);

            await transaction.CommitAsync(cancellationToken);

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
