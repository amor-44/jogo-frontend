using Jogo.Application.Common.Interfaces;
using Jogo.Application.Common.Models;
using Jogo.Application.Features.Scout.DTOs;
using Jogo.Domain.Common.Results;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Jogo.Application.Features.Scout.Queries.ListContactRequests;

public class ListContactRequestsQueryHandler(IAppDbContext context, IUser currentUser) : IRequestHandler<ListContactRequestsQuery, Result<PaginatedList<ScoutContactRequestDto>>>
{
    public async Task<Result<PaginatedList<ScoutContactRequestDto>>> Handle(ListContactRequestsQuery request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(currentUser.Id) || !System.Guid.TryParse(currentUser.Id, out var currentUserId))
        {
            return Error.Unauthorized("ScoutProfile.Unauthorized", "User is not authorized.");
        }

        var profile = await context.ScoutProfiles
            .FirstOrDefaultAsync(x => x.UserId == currentUserId, cancellationToken);

        if (profile == null)
        {
            return Error.NotFound("ScoutProfile.NotFound", "Scout profile not found.");
        }

        var query = context.ContactRequests
            .Include(x => x.PlayerProfile)
                .ThenInclude(p => p.User)
            .Where(x => x.ScoutProfileId == profile.Id)
            .OrderByDescending(x => x.RequestedAt)
            .Select(x => new ScoutContactRequestDto(
                x.Id,
                x.PlayerProfileId,
                x.PlayerProfile.FullName,
                x.PlayerProfile.PrimaryPosition.ToString(),
                x.PlayerProfile.Country,
                x.Status.ToString(),
                x.RequestedAt,
                x.RespondedAt,
                x.Status == Jogo.Domain.Enums.ContactRequestStatus.Accepted ? x.PlayerProfile.User.Email : null));

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        var result = new PaginatedList<ScoutContactRequestDto>
        {
            PageNumber = request.PageNumber,
            PageSize = request.PageSize,
            TotalCount = totalCount,
            TotalPages = (int)System.Math.Ceiling(totalCount / (double)request.PageSize),
            Items = items
        };

        return result;
    }
}
