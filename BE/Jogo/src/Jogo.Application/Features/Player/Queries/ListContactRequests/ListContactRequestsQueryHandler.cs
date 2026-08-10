using Jogo.Application.Common.Interfaces;
using Jogo.Application.Common.Models;
using Jogo.Application.Features.Player.DTOs;
using Jogo.Domain.Common.Results;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Jogo.Application.Features.Player.Queries.ListContactRequests;

public class ListContactRequestsQueryHandler(IAppDbContext context, IUser currentUser) : IRequestHandler<ListContactRequestsQuery, Result<PaginatedList<PlayerContactRequestDto>>>
{
    public async Task<Result<PaginatedList<PlayerContactRequestDto>>> Handle(ListContactRequestsQuery request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(currentUser.Id) || !System.Guid.TryParse(currentUser.Id, out var currentUserId))
        {
            return Error.Unauthorized("PlayerProfile.Unauthorized", "User is not authorized.");
        }

        var profile = await context.PlayerProfiles
            .FirstOrDefaultAsync(x => x.UserId == currentUserId, cancellationToken);

        if (profile == null)
        {
            return Error.NotFound("PlayerProfile.NotFound", "Player profile not found.");
        }

        var query = context.ContactRequests
            .Include(x => x.ScoutProfile)
            .Where(x => x.PlayerProfileId == profile.Id)
            .OrderByDescending(x => x.RequestedAt)
            .Select(x => new PlayerContactRequestDto(
                x.Id,
                x.ScoutProfileId,
                x.ScoutProfile.Organization,
                x.ScoutProfile.Country,
                x.ScoutProfile.ExperienceYears,
                x.Status.ToString(),
                x.RequestedAt,
                x.RespondedAt));

                var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        var result = new PaginatedList<PlayerContactRequestDto>
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
