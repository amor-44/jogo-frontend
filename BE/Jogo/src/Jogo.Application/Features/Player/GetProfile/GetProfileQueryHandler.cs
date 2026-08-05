using Jogo.Application.Common.Interfaces;
using Jogo.Application.Features.Player.CreateProfile;
using Jogo.Domain.Common.Results;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Jogo.Application.Features.Player.GetProfile;

public class GetProfileQueryHandler : IRequestHandler<GetProfileQuery, Result<ProfileDto>>
{
    private readonly IAppDbContext _context;
    private readonly IUser _currentUser;

    public GetProfileQueryHandler(IAppDbContext context, IUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<ProfileDto>> Handle(GetProfileQuery request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(_currentUser.Id) || !Guid.TryParse(_currentUser.Id, out var currentUserId))
        {
            return Error.Unauthorized("PlayerProfile.Unauthorized", "User is not authorized.");
        }

        var profile = await _context.PlayerProfiles
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.UserId == currentUserId, cancellationToken);

        if (profile == null)
        {
            return Error.NotFound("PlayerProfile.NotFound", "Player profile not found.");
        }

        var dto = new ProfileDto(
            profile.Id,
            profile.FullName,
            profile.DateOfBirth,
            profile.Age,
            profile.Country,
            profile.City,
            profile.Height,
            profile.Weight,
            profile.PreferredFoot,
            profile.PrimaryPosition,
            profile.SecondaryPosition,
            profile.CurrentClub,
            profile.Biography,
            profile.ProfilePictureUrl,
            profile.Visibility,
            profile.IsComplete);

        return dto;
    }
}
