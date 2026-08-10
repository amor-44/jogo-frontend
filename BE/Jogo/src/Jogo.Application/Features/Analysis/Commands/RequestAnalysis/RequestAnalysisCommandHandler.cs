using Jogo.Application.Features.Analysis.DTOs;
using Jogo.Application.Common.Interfaces;
using Jogo.Domain.Common.Results;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Jogo.Application.Features.Analysis.Commands.RequestAnalysis;

public class RequestAnalysisCommandHandler : IRequestHandler<RequestAnalysisCommand, Result<Success>>
{
    private readonly IAppDbContext _context;
    private readonly IUser _currentUser;
    private readonly IBackgroundJobService _backgroundJobService;

    public RequestAnalysisCommandHandler(
        IAppDbContext context,
        IUser currentUser,
        IBackgroundJobService backgroundJobService)
    {
        _context = context;
        _currentUser = currentUser;
        _backgroundJobService = backgroundJobService;
    }

    public async Task<Result<Success>> Handle(RequestAnalysisCommand request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(_currentUser.Id) || !Guid.TryParse(_currentUser.Id, out var userId))
            return Error.Unauthorized("Analysis.Unauthorized", "User is not authenticated.");

        var profile = await _context.PlayerProfiles
            .FirstOrDefaultAsync(p => p.UserId == userId, cancellationToken);

        if (profile == null)
            return Error.NotFound("Analysis.ProfileNotFound", "Player profile not found.");

        var video = await _context.FootballVideos
            .FirstOrDefaultAsync(v => v.Id == request.VideoId, cancellationToken);

        if (video == null)
            return Error.NotFound("Analysis.VideoNotFound", "Video not found.");

        if (video.PlayerProfileId != profile.Id)
            return Error.Forbidden("Analysis.Forbidden", "You can only request analysis for your own videos.");

        var queueResult = video.MarkQueued();
        if (queueResult.IsError)
            return queueResult.Errors;

        await _context.SaveChangesAsync(cancellationToken);

        _backgroundJobService.EnqueueAnalyzeVideoJob(video.Id);

        return Result.Success;
    }
}
