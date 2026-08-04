using System.Security.Cryptography;
using System.Text;
using Jogo.Application.Common.Interfaces;
using Jogo.Domain.Common.Results;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Jogo.Application.Features.Authentication.Logout;

public class LogoutCommandHandler(IAppDbContext context) : IRequestHandler<LogoutCommand, Result<Success>>
{
    public async Task<Result<Success>> Handle(LogoutCommand request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.RefreshToken))
        {
            return Error.Validation("Logout.MissingToken", "Refresh token is required.");
        }

        using var sha256 = SHA256.Create();
        var hashBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(request.RefreshToken));
        var hashedToken = Convert.ToBase64String(hashBytes);

        var existingToken = await context.RefreshTokens.FirstOrDefaultAsync(t => t.TokenHash == hashedToken, cancellationToken);

        if (existingToken == null || !existingToken.IsActive)
        {
            return Result.Success; // Idempotent
        }

        var revokeResult = existingToken.Revoke();
        if (revokeResult.IsError)
        {
            return revokeresult.TopErrors;
        }

        await context.SaveChangesAsync(cancellationToken);
        return Result.Success;
    }
}
