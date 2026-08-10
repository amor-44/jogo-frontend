using Jogo.Application.Features.Player.DTOs;
using Jogo.Application.Common.Interfaces;
using Jogo.Domain.Common.Results;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Jogo.Application.Features.Player.Commands.UploadProfileImage;

public class UploadProfileImageCommandHandler : IRequestHandler<UploadProfileImageCommand, Result<string>>
{
    private readonly IAppDbContext _context;
    private readonly IUser _currentUser;
    private readonly IFileStorageService _fileStorageService;
    private readonly Microsoft.Extensions.Caching.Hybrid.HybridCache _hybridCache;

    public UploadProfileImageCommandHandler(
        IAppDbContext context,
        IUser currentUser,
        IFileStorageService fileStorageService,
        Microsoft.Extensions.Caching.Hybrid.HybridCache hybridCache)
    {
        _context = context;
        _currentUser = currentUser;
        _fileStorageService = fileStorageService;
        _hybridCache = hybridCache;
    }

    public async Task<Result<string>> Handle(UploadProfileImageCommand request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(_currentUser.Id) || !Guid.TryParse(_currentUser.Id, out var currentUserId))
        {
            return Error.Unauthorized("PlayerProfile.Unauthorized", "User is not authorized.");
        }

        var profile = await _context.PlayerProfiles
            .FirstOrDefaultAsync(p => p.UserId == currentUserId, cancellationToken);

        if (profile == null)
        {
            return Error.NotFound("PlayerProfile.NotFound", "Player profile not found.");
        }

        // Validate file type (e.g., only images)
        if (!request.ContentType.StartsWith("image/"))
        {
            return Error.Validation("PlayerProfile.InvalidImageType", "Only image files are allowed.");
        }

        var imageUrl = await _fileStorageService.UploadFileAsync(
            request.FileStream,
            request.FileName,
            request.ContentType,
            cancellationToken);

        var updateResult = profile.UpdateProfilePicture(imageUrl);

        if (updateResult.IsError)
        {
            return updateResult.Errors;
        }

        await _context.SaveChangesAsync(cancellationToken);

        await _hybridCache.RemoveByTagAsync("players", cancellationToken);
        await _hybridCache.RemoveByTagAsync($"player-{profile.Id}", cancellationToken);

        return imageUrl;
    }
}
