using Jogo.Application.Common.Interfaces;
using Jogo.Domain.Common.Results;
using Jogo.Domain.Entities;
using Jogo.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

using MediatR;

using Microsoft.EntityFrameworkCore;

namespace Jogo.Application.Features.Player.CreateProfile;

public class CreateProfileCommandHandler : IRequestHandler<CreateProfileCommand, Result<Guid>>
{
    private readonly IAppDbContext _context;
    private readonly IUser _currentUser;

    public CreateProfileCommandHandler(IAppDbContext context, IUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<Guid>> Handle(CreateProfileCommand request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(_currentUser.Id) || !Guid.TryParse(_currentUser.Id, out var currentUserId))
        {
            return Error.Unauthorized("PlayerProfile.Unauthorized", "User is not authorized.");
        }

        var profileExists = await _context.PlayerProfiles
            .AnyAsync(p => p.UserId == currentUserId, cancellationToken);

        if (profileExists)
        {
            return Error.Conflict("PlayerProfile.AlreadyExists", "A profile already exists for this user.");
        }

        var profileResult = PlayerProfile.Create(
            currentUserId,
            request.FullName,
            request.DateOfBirth,
            request.PrimaryPosition,
            request.PreferredFoot,
            request.Country);

        if (profileResult.IsError)
        {
            return profileResult.Errors;
        }

        _context.PlayerProfiles.Add(profileResult.Value);
        await _context.SaveChangesAsync(cancellationToken);

        return profileResult.Value.Id;
    }
}
