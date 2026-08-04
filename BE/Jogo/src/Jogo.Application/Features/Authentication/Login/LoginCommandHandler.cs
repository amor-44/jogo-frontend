using System.Security.Cryptography;
using System.Text;
using Jogo.Application.Common.Interfaces;
using Jogo.Domain.Common.Results;
using Jogo.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Jogo.Application.Features.Authentication.Login;

public class LoginCommandHandler(
    IIdentityService identityService,
    ITokenProvider tokenProvider,
    IAppDbContext context) : IRequestHandler<LoginCommand, Result<LoginResponse>>
{
    public async Task<Result<LoginResponse>> Handle(LoginCommand request, CancellationToken cancellationToken)
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

        var accessToken = tokenProvider.GenerateAccessToken(user.Id, user.Role.ToString());
        var refreshTokenString = tokenProvider.GenerateRefreshToken();

        using var sha256 = SHA256.Create();
        var hashBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(refreshTokenString));
        var hashedToken = Convert.ToBase64String(hashBytes);

        var refreshTokenResult = RefreshToken.Issue(
            user.Id, 
            hashedToken,
            DateTimeOffset.UtcNow.AddDays(7));

        if (refreshTokenResult.IsError)
        {
            return refreshTokenResult.Errors;
        }

        context.RefreshTokens.Add(refreshTokenResult.Value);
        await context.SaveChangesAsync(cancellationToken);

        return new LoginResponse(accessToken, refreshTokenString);
    }
}
