using Jogo.Application.Common.Interfaces;
using Jogo.Domain.Common.Results;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Jogo.Application.Features.Videos.DeleteVideo;

public class DeleteVideoCommandHandler : IRequestHandler<DeleteVideoCommand, Result<Success>>
{
    private readonly IAppDbContext _context;
    private readonly IUser _currentUser;
    private readonly IVideoStorageService _videoStorageService;

    public DeleteVideoCommandHandler(
        IAppDbContext context,
        IUser currentUser,
        IVideoStorageService videoStorageService)
    {
        _context = context;
        _currentUser = currentUser;
        _videoStorageService = videoStorageService;
    }

    public async Task<Result<Success>> Handle(DeleteVideoCommand request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(_currentUser.Id) || !Guid.TryParse(_currentUser.Id, out var currentUserId))
        {
            return Error.Unauthorized("DeleteVideo.Unauthorized", "User is not authorized.");
        }

        var profile = await _context.PlayerProfiles
            .FirstOrDefaultAsync(p => p.UserId == currentUserId, cancellationToken);

        if (profile == null)
        {
            return Error.NotFound("DeleteVideo.ProfileNotFound", "Player profile not found.");
        }

        var video = await _context.FootballVideos
            .FirstOrDefaultAsync(v => v.Id == request.VideoId, cancellationToken);

        if (video == null)
        {
            return Error.NotFound("DeleteVideo.VideoNotFound", "Video not found.");
        }

        if (video.PlayerProfileId != profile.Id)
        {
            return Error.Forbidden("DeleteVideo.Forbidden", "You can only delete your own videos.");
        }

        if (!video.CanDelete)
        {
            return Error.Conflict("DeleteVideo.InvalidState", "Video cannot be deleted in its current state.");
        }

        await _videoStorageService.DeleteVideoAsync(video.StorageUrl, cancellationToken);
        _context.FootballVideos.Remove(video);
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success;
    }
}
