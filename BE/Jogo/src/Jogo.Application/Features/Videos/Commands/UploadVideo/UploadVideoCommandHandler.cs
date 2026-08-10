using Jogo.Application.Features.Videos.DTOs;
using Jogo.Application.Common.Interfaces;
using Jogo.Application.Common.Models;
using Jogo.Domain.Common.Results;
using Jogo.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Jogo.Application.Features.Videos.Commands.UploadVideo;

public class UploadVideoCommandHandler : IRequestHandler<UploadVideoCommand, Result<Guid>>
{
    private readonly IAppDbContext _context;
    private readonly IUser _currentUser;
    private readonly IVideoStorageService _videoStorageService;
    private readonly VideoSettings _videoSettings;

    public UploadVideoCommandHandler(
        IAppDbContext context,
        IUser currentUser,
        IVideoStorageService videoStorageService,
        IOptions<VideoSettings> videoSettings)
    {
        _context = context;
        _currentUser = currentUser;
        _videoStorageService = videoStorageService;
        _videoSettings = videoSettings.Value;
    }

    public async Task<Result<Guid>> Handle(UploadVideoCommand request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(_currentUser.Id) || !Guid.TryParse(_currentUser.Id, out var currentUserId))
        {
            return Error.Unauthorized("UploadVideo.Unauthorized", "User is not authorized.");
        }

        var profile = await _context.PlayerProfiles
            .FirstOrDefaultAsync(p => p.UserId == currentUserId, cancellationToken);

        if (profile == null)
        {
            return Error.NotFound("UploadVideo.ProfileNotFound", "Player profile not found.");
        }

        if (!profile.IsComplete)
        {
            return Error.Validation("UploadVideo.ProfileIncomplete", "Your profile must be complete before uploading videos.");
        }

        // Validate format
        var extension = Path.GetExtension(request.FileName).ToLowerInvariant();
        if (!_videoSettings.AllowedFormats.Contains(extension))
        {
            return Error.Validation("UploadVideo.InvalidFormat", $"Invalid video format. Allowed formats: {string.Join(", ", _videoSettings.AllowedFormats)}");
        }

        // Validate size
        if (request.VideoStream.Length > _videoSettings.MaxSizeBytes)
        {
            return Error.Validation("UploadVideo.FileTooLarge", $"Video file is too large. Maximum size is {_videoSettings.MaxSizeBytes / (1024 * 1024)} MB.");
        }

        // Upload physical file
        var fileUrl = await _videoStorageService.UploadVideoAsync(
            request.VideoStream,
            request.FileName,
            request.ContentType,
            cancellationToken);

        // Extract duration using TagLib via the storage service
        var duration = await _videoStorageService.GetVideoDurationAsync(fileUrl, cancellationToken);

        // Create domain entity
        var videoResult = FootballVideo.Upload(profile.Id, fileUrl, request.FileName, duration);
        if (videoResult.IsError)
        {
            // Clean up the file if domain creation fails
            await _videoStorageService.DeleteVideoAsync(fileUrl, cancellationToken);
            return videoResult.Errors;
        }

        _context.FootballVideos.Add(videoResult.Value);
        await _context.SaveChangesAsync(cancellationToken);

        return videoResult.Value.Id;
    }
}
