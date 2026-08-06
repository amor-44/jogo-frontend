using Jogo.Application.Common.Interfaces;
using Jogo.Domain.Common.Results;

using Microsoft.AspNetCore.Identity;

namespace Jogo.Infrastructure.Identity;

public class IdentityService(UserManager<IdentityUser> userManager) : IIdentityService
{
    public async Task<Result<Guid>> RegisterUserAsync(string email, string password, CancellationToken cancellationToken = default)
    {
        var existingUser = await userManager.FindByEmailAsync(email);
        if (existingUser != null)
        {
            return Error.Conflict("Identity.EmailTaken", "A user with this email already exists.");
        }

        var identityUser = new IdentityUser
        {
            Id = Guid.NewGuid().ToString(),
            UserName = email,
            Email = email,
        };

        var result = await userManager.CreateAsync(identityUser, password);

        if (!result.Succeeded)
        {
            var errors = result.Errors
                .Select(e => Error.Validation($"Identity.{e.Code}", e.Description))
                .ToList();

            return errors;
        }

        return Guid.Parse(identityUser.Id);
    }

    public async Task<Result<Guid>> CheckCredentialsAsync(string email, string password, CancellationToken cancellationToken = default)
    {
        var identityUser = await userManager.FindByEmailAsync(email);
        if (identityUser == null)
        {
            return Error.Unauthorized("Identity.InvalidCredentials", "Invalid email or password.");
        }

        var isValid = await userManager.CheckPasswordAsync(identityUser, password);
        if (!isValid)
        {
            return Error.Unauthorized("Identity.InvalidCredentials", "Invalid email or password.");
        }

        return Guid.Parse(identityUser.Id);
    }
}
