using Jogo.Application.Features.Scout.DTOs;
using Jogo.Application.Common.Interfaces;
using Jogo.Domain.Common.Results;

using MediatR;

using Microsoft.EntityFrameworkCore;

namespace Jogo.Application.Features.Scout.Commands.UpdateProfile;

public class UpdateScoutProfileCommandHandler : IRequestHandler<UpdateScoutProfileCommand, Result<Success>>
{
    private readonly IAppDbContext _context;
    private readonly IUser _currentUser;

    public UpdateScoutProfileCommandHandler(
        IAppDbContext context,
        IUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<Success>> Handle(
        UpdateScoutProfileCommand request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(_currentUser.Id) ||
            !Guid.TryParse(_currentUser.Id, out var currentUserId))
        {
            return Error.Unauthorized(
                "ScoutProfile.Unauthorized",
                "User is not authorized.");
        }

        var profile = await _context.ScoutProfiles
            .FirstOrDefaultAsync(
                s => s.UserId == currentUserId,
                cancellationToken);

        if (profile == null)
        {
            return Error.NotFound(
                "ScoutProfile.NotFound",
                "Scout profile not found.");
        }

        var updateResult = profile.UpdateDetails(
            request.Organization,
            request.Country,
            request.ExperienceYears);

        if (updateResult.IsError)
        {
            return updateResult;
        }

        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success;
    }
}
