using Jogo.Application.Common.Interfaces;
using Jogo.Domain.Common.Results;

using MediatR;

using Microsoft.EntityFrameworkCore;

namespace Jogo.Application.Features.Scout.GetProfile;

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
        if (string.IsNullOrEmpty(_currentUser.Id) ||
            !Guid.TryParse(_currentUser.Id, out var currentUserId))
        {
            return Error.Unauthorized(
                "ScoutProfile.Unauthorized",
                "User is not authorized.");
        }

        var profile = await _context.ScoutProfiles
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.UserId == currentUserId, cancellationToken);

        if (profile == null)
        {
            return Error.NotFound(
                "ScoutProfile.NotFound",
                "Scout profile not found.");
        }

        var dto = new ProfileDto(
            profile.Id,
            profile.Organization,
            profile.Country,
            profile.ExperienceYears);

        return dto;
    }
}