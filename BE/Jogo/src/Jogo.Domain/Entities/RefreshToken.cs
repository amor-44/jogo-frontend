using Jogo.Domain.Common;
using Jogo.Domain.Common.Results;

namespace Jogo.Domain.Entities;

public class RefreshToken : AuditableEntity
{
    public Guid UserId { get; private set; }
    public string TokenHash { get; private set; } = string.Empty;
    public DateTimeOffset ExpiresAt { get; private set; }
    public DateTimeOffset? RevokedAt { get; private set; }

    public bool IsActive => RevokedAt == null && ExpiresAt > DateTimeOffset.UtcNow;

    private RefreshToken() { }

    private RefreshToken(Guid id, Guid userId, string tokenHash, DateTimeOffset expiresAt) : base(id)
    {
        UserId = userId;
        TokenHash = tokenHash;
        ExpiresAt = expiresAt;
    }

    public static Result<RefreshToken> Issue(Guid userId, string tokenHash, DateTimeOffset expiresAt)
    {
        if (userId == Guid.Empty)
            return Error.Validation("RefreshToken.InvalidUserId", "User ID cannot be empty.");
        
        if (string.IsNullOrWhiteSpace(tokenHash))
            return Error.Validation("RefreshToken.InvalidHash", "Token hash cannot be empty.");

        if (expiresAt <= DateTimeOffset.UtcNow)
            return Error.Validation("RefreshToken.InvalidExpiry", "Expiration date must be in the future.");

        return new RefreshToken(Guid.NewGuid(), userId, tokenHash, expiresAt);
    }

    public Result<Success> Revoke()
    {
        if (RevokedAt != null)
        {
            return Error.Conflict("RefreshToken.AlreadyRevoked", "Token is already revoked.");
        }

        RevokedAt = DateTimeOffset.UtcNow;
        return Result.Success;
    }
}
