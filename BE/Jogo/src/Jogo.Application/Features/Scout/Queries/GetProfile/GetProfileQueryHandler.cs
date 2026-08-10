using Jogo.Application.Features.Scout.DTOs;
using Jogo.Application.Common.Interfaces;
using Jogo.Domain.Common.Results;

using MediatR;

using Microsoft.EntityFrameworkCore;

namespace Jogo.Application.Features.Scout.Queries.GetProfile;

public class GetProfileQueryHandler : IRequestHandler<GetProfileQuery, Result<ScoutProfileDto>>
{
    private readonly IAppDbContext _context;
    private readonly IUser _currentUser;

    public GetProfileQueryHandler(IAppDbContext context, IUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<ScoutProfileDto>> Handle(GetProfileQuery request, CancellationToken cancellationToken)
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

        var dto = new ScoutProfileDto(
            profile.Id,
            profile.Organization,
            profile.Country,
            profile.ExperienceYears);

        return dto;
    }
}
