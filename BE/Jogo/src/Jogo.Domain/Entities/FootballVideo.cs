using Jogo.Domain.Common;
using Jogo.Domain.Common.Results;
using Jogo.Domain.Enums;

namespace Jogo.Domain.Entities;

public class FootballVideo : AuditableEntity
{
    public Guid PlayerProfileId { get; private set; }
    public string StorageUrl { get; private set; } = string.Empty;
    public string OriginalFileName { get; private set; } = string.Empty;
    public TimeSpan Duration { get; private set; }
    public DateTimeOffset UploadedAt { get; private set; }
    public VideoAnalysisStatus Status { get; private set; }

    public PlayerProfile PlayerProfile { get; private set; } = null!;

    public AnalysisReport? AnalysisReport { get; private set; }
    public bool CanDelete => Status == VideoAnalysisStatus.Uploaded;

    private FootballVideo() { }

    private FootballVideo(
        Guid id,
        Guid playerProfileId,
        string storageUrl,
        string originalFileName,
        TimeSpan duration) : base(id)
    {
        PlayerProfileId = playerProfileId;
        StorageUrl = storageUrl;
        OriginalFileName = originalFileName;
        Duration = duration;
        UploadedAt = DateTimeOffset.UtcNow;
        Status = VideoAnalysisStatus.Uploaded;
    }

    public static Result<FootballVideo> Upload(
        Guid playerProfileId,
        string storageUrl,
        string originalFileName,
        TimeSpan duration)
    {
        if (playerProfileId == Guid.Empty) return Error.Validation("FootballVideo.InvalidPlayer", "Player profile ID is required.");
        if (string.IsNullOrWhiteSpace(storageUrl)) return Error.Validation("FootballVideo.InvalidUrl", "Storage URL is required.");
        if (string.IsNullOrWhiteSpace(originalFileName)) return Error.Validation("FootballVideo.InvalidFileName", "Original file name is required.");

        return new FootballVideo(Guid.NewGuid(), playerProfileId, storageUrl, originalFileName, duration);
    }

    public Result<Success> MarkQueued()
    {
        if (Status != VideoAnalysisStatus.Uploaded)
            return Error.Conflict("FootballVideo.InvalidTransition", "Can only queue an uploaded video.");

        Status = VideoAnalysisStatus.Queued;
        return Result.Success;
    }

    public Result<Success> MarkProcessing()
    {
        if (Status != VideoAnalysisStatus.Queued)
            return Error.Conflict("FootballVideo.InvalidTransition", "Can only process a queued video.");

        Status = VideoAnalysisStatus.Processing;
        return Result.Success;
    }

    public Result<Success> MarkCompleted()
    {
        if (Status != VideoAnalysisStatus.Processing)
            return Error.Conflict("FootballVideo.InvalidTransition", "Can only complete a processing video.");

        Status = VideoAnalysisStatus.Completed;
        return Result.Success;
    }

    /// <summary>
    /// Marks the video processing as failed.
    /// This is legal from the Processing state.
    /// </summary>
    public Result<Success> MarkFailed()
    {
        if (Status != VideoAnalysisStatus.Processing)
            return Error.Conflict("FootballVideo.InvalidTransition", "Can only fail a processing video.");

        Status = VideoAnalysisStatus.Failed;
        return Result.Success;
    }

    public Result<Success> Retry()
    {
        if (Status != VideoAnalysisStatus.Failed)
            return Error.Conflict("FootballVideo.InvalidTransition", "Can only retry a failed video.");

        Status = VideoAnalysisStatus.Queued;
        return Result.Success;
    }
}
