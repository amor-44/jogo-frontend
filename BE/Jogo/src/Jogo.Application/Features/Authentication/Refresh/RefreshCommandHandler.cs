using System.Security.Cryptography;
using System.Text;
using Jogo.Application.Common.Interfaces;
using Jogo.Domain.Common.Results;
using Jogo.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Jogo.Application.Features.Authentication.Refresh;

public class RefreshCommandHandler(
    ITokenProvider tokenProvider,
    IAppDbContext context) : IRequestHandler<RefreshCommand, Result<RefreshResponse>>
{
    public async Task<Result<RefreshResponse>> Handle(RefreshCommand request, CancellationToken cancellationToken)
    {
        using var sha256 = SHA256.Create();
        var hashBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(request.RefreshToken));
        var hashedToken = Convert.ToBase64String(hashBytes);

        var existingToken = await context.RefreshTokens.FirstOrDefaultAsync(t => t.TokenHash == hashedToken, cancellationToken);

        if (existingToken == null)
        {
            return Error.Unauthorized("RefreshToken.Invalid", "Refresh token is invalid or expired.");
        }

        if (!existingToken.IsActive)
        {
            return Error.Unauthorized("RefreshToken.Revoked", "Refresh token is revoked or expired.");
        }

        var user = await context.Users.FirstOrDefaultAsync(u => u.Id == existingToken.UserId, cancellationToken);
        if (user == null)
        {
            return Error.NotFound("User.NotFound", "User not found.");
        }

        var revokeResult = existingToken.Revoke();
        if (revokeResult.IsError)
        {
            return revokeresult.TopErrors;
        }

        var newAccessToken = tokenProvider.GenerateAccessToken(user.Id, user.Role.ToString());
        var newRefreshTokenString = tokenProvider.GenerateRefreshToken();

        var newHashBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(newRefreshTokenString));
        var newHashedToken = Convert.ToBase64String(newHashBytes);

        var issueResult = RefreshToken.Issue(user.Id, newHashedToken, DateTimeOffset.UtcNow.AddDays(7));
        if (issueResult.IsError)
        {
            return issueresult.TopErrors;
        }

        context.RefreshTokens.Add(issueResult.Value);
        await context.SaveChangesAsync(cancellationToken);

        return new RefreshResponse(newAccessToken, newRefreshTokenString);
    }
}
