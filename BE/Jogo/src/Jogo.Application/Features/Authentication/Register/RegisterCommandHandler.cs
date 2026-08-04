using Jogo.Application.Common.Interfaces;
using Jogo.Domain.Common.Results;
using Jogo.Domain.Entities;
using Jogo.Domain.Enums;
using MediatR;

namespace Jogo.Application.Features.Authentication.Register;

public class RegisterCommandHandler(
    IIdentityService identityService,
    IAppDbContext context) : IRequestHandler<RegisterCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        var role = Enum.Parse<Role>(request.Role, ignoreCase: true);

        var identityResult = await identityService.RegisterUserAsync(request.Email, request.Password, cancellationToken);
        if (identityResult.IsError)
        {
            return identityResult.Errors;
        }

        var userId = identityResult.Value;
        
        var userResult = User.Create(userId, role);
        if (userResult.IsError)
        {
            return userResult.Errors;
        }

        context.Users.Add(userResult.Value);
        await context.SaveChangesAsync(cancellationToken);

        return userId;
    }
}
