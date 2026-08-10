using Jogo.Application.Features.Videos.DTOs;
using Jogo.Application.Common.Interfaces;
using Jogo.Application.Common.Models;
using Jogo.Domain.Common.Results;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Jogo.Application.Features.Videos.Queries;

public class ListVideosQueryHandler : IRequestHandler<ListVideosQuery, Result<PaginatedList<VideoDto>>>
{
    private readonly IAppDbContext _context;
    private readonly IUser _currentUser;

    public ListVideosQueryHandler(IAppDbContext context, IUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<PaginatedList<VideoDto>>> Handle(ListVideosQuery request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(_currentUser.Id) || !Guid.TryParse(_currentUser.Id, out var currentUserId))
        {
            return Error.Unauthorized("ListVideos.Unauthorized", "User is not authorized.");
        }

        var profile = await _context.PlayerProfiles
            .FirstOrDefaultAsync(p => p.UserId == currentUserId, cancellationToken);

        if (profile == null)
        {
            return Error.NotFound("ListVideos.ProfileNotFound", "Player profile not found.");
        }

        var query = _context.FootballVideos
            .Where(v => v.PlayerProfileId == profile.Id)
            .OrderByDescending(v => v.UploadedAt);

        var totalCount = await query.CountAsync(cancellationToken);
        
        var videos = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        var dtos = videos.Select(v => new VideoDto(
            v.Id,
            v.StorageUrl,
            v.OriginalFileName,
            v.Duration,
            v.UploadedAt,
            v.Status.ToString(),
            v.CanDelete
        )).ToList();

        var paginatedList = new PaginatedList<VideoDto>
        {
            Items = dtos,
            TotalCount = totalCount,
            PageNumber = request.PageNumber,
            PageSize = request.PageSize,
            TotalPages = (int)Math.Ceiling(totalCount / (double)request.PageSize)
        };

        return paginatedList;
    }
}
