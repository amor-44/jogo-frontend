using Jogo.Application.Features.Videos.DTOs;
using Jogo.Application.Common.Interfaces;
using Jogo.Domain.Common.Results;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Jogo.Application.Features.Videos.Queries;

public class GetVideoQueryHandler : IRequestHandler<GetVideoQuery, Result<VideoDto>>
{
    private readonly IAppDbContext _context;
    private readonly IUser _currentUser;

    public GetVideoQueryHandler(IAppDbContext context, IUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<VideoDto>> Handle(GetVideoQuery request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(_currentUser.Id) || !Guid.TryParse(_currentUser.Id, out var currentUserId))
        {
            return Error.Unauthorized("GetVideo.Unauthorized", "User is not authorized.");
        }

        var profile = await _context.PlayerProfiles
            .FirstOrDefaultAsync(p => p.UserId == currentUserId, cancellationToken);

        if (profile == null)
        {
            return Error.NotFound("GetVideo.ProfileNotFound", "Player profile not found.");
        }

        var video = await _context.FootballVideos
            .FirstOrDefaultAsync(v => v.Id == request.VideoId, cancellationToken);

        if (video == null)
        {
            return Error.NotFound("GetVideo.VideoNotFound", "Video not found.");
        }

        if (video.PlayerProfileId != profile.Id)
        {
            return Error.Forbidden("GetVideo.Forbidden", "You can only view your own videos.");
        }

        var dto = new VideoDto(
            video.Id,
            video.StorageUrl,
            video.OriginalFileName,
            video.Duration,
            video.UploadedAt,
            video.Status.ToString(),
            video.CanDelete
        );

        return dto;
    }
}
