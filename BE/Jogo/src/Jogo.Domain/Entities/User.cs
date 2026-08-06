using Jogo.Domain.Common.Results;
using Jogo.Domain.Enums;

using Microsoft.AspNetCore.Identity;

namespace Jogo.Domain.Entities;

public class User : IdentityUser<Guid>
{
    public Role Role { get; private set; }
    public AccountStatus Status { get; private set; }
    public DateTimeOffset? LastLoginAt { get; private set; }

    private User() { }

    private User(Guid id, Role role) 
    {
        Id = id;
        Role = role;
        Status = AccountStatus.Active;
    }

    public static Result<User> Create(Guid id, Role role)
    {
        if (id == Guid.Empty)
        {
            return Error.Validation("User.InvalidId", "User ID cannot be empty.");
        }

        return new User(id, role);
    }

    public void RecordLogin()
    {
        LastLoginAt = DateTimeOffset.UtcNow;
    }

    public Result<Success> Suspend()
    {
        if (Status == AccountStatus.Suspended)
        {
            return Error.Conflict("User.AlreadySuspended", "User is already suspended.");
        }

        Status = AccountStatus.Suspended;
        return Result.Success;
    }

    public Result<Success> Reactivate()
    {
        if (Status == AccountStatus.Active)
        {
            return Error.Conflict("User.AlreadyActive", "User is already active.");
        }

        Status = AccountStatus.Active;
        return Result.Success;
    }
}
