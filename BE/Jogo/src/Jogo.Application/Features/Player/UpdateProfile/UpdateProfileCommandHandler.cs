using Jogo.Application.Common.Interfaces;
using Jogo.Domain.Common.Results;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Jogo.Application.Features.Player.UpdateProfile;

public class UpdateProfileCommandHandler : IRequestHandler<UpdateProfileCommand, Result<Success>>
{
    private readonly IAppDbContext _context;
    private readonly IUser _currentUser;

    public UpdateProfileCommandHandler(IAppDbContext context, IUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<Success>> Handle(UpdateProfileCommand request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(_currentUser.Id) || !Guid.TryParse(_currentUser.Id, out var currentUserId))
        {
            return Error.Unauthorized("PlayerProfile.Unauthorized", "User is not authorized.");
        }

        var profile = await _context.PlayerProfiles
            .FirstOrDefaultAsync(p => p.UserId == currentUserId, cancellationToken);

        if (profile == null)
        {
            return Error.NotFound("PlayerProfile.NotFound", "Player profile not found.");
        }

        var updateResult = profile.UpdateDetails(
            request.City,
            request.Height,
            request.Weight,
            request.SecondaryPosition,
            request.CurrentClub,
            request.Biography);

        if (updateResult.IsError)
        {
            return updateResult;
        }

        var visibilityResult = profile.ChangeVisibility(request.Visibility);
        
        if (visibilityResult.IsError)
        {
            return visibilityResult;
        }

        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success;
    }
}
