using Jogo.Application.Common.Interfaces;
using Jogo.Domain.Common.Results;
using Jogo.Domain.Entities;

using MediatR;

using Microsoft.EntityFrameworkCore;

namespace Jogo.Application.Features.Scout.CreateProfile;

public class CreateProfileCommandHandler
    : IRequestHandler<CreateProfileCommand, Result<Guid>>
{
    private readonly IAppDbContext _context;
    private readonly IUser _currentUser;

    public CreateProfileCommandHandler(
        IAppDbContext context,
        IUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<Guid>> Handle(
        CreateProfileCommand request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(_currentUser.Id) ||
            !Guid.TryParse(_currentUser.Id, out var currentUserId))
        {
            return Error.Unauthorized(
                "ScoutProfile.Unauthorized",
                "User is not authorized.");
        }

        var profileExists = await _context.ScoutProfiles
            .AnyAsync(x => x.UserId == currentUserId, cancellationToken);

        if (profileExists)
        {
            return Error.Conflict(
                "ScoutProfile.AlreadyExists",
                "A profile already exists for this user.");
        }

        var profileResult = ScoutProfile.Create(
            currentUserId,
            request.Organization,
            request.Country,
            request.ExperienceYears);

        if (profileResult.IsError)
        {
            return profileResult.Errors;
        }

        _context.ScoutProfiles.Add(profileResult.Value);

        await _context.SaveChangesAsync(cancellationToken);

        return profileResult.Value.Id;
    }
}