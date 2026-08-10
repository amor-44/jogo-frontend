using Jogo.Application.Features.Authentication.DTOs;
using Jogo.Application.Common.Interfaces;
using Jogo.Domain.Common.Results;

using MediatR;

using Microsoft.EntityFrameworkCore;

namespace Jogo.Application.Features.Authentication.Commands.Login;

public class LoginCommandHandler(
    IIdentityService identityService,
    ITokenProvider tokenProvider,
    IRefreshTokenService refreshTokenService,
    IAppDbContext context) : IRequestHandler<LoginCommand, Result<AuthResponse>>
{
    public async Task<Result<AuthResponse>> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var identityResult = await identityService.CheckCredentialsAsync(request.Email, request.Password, cancellationToken);
        if (identityResult.IsError)
        {
            return identityResult.Errors;
        }

        var userId = identityResult.Value;

        var user = await context.Users.FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);
        if (user == null)
        {
            return Error.NotFound("User.NotFound", "User not found in domain.");
        }

        user.RecordLogin();
        await context.SaveChangesAsync(cancellationToken);

        var (accessToken, refreshToken) = tokenProvider.GenerateTokens(user);

        await refreshTokenService.SaveRefreshTokenAsync(user.Id, refreshToken, cancellationToken);

        return new AuthResponse(accessToken, refreshToken, user.Role.ToString(), user.Id);
    }
}
