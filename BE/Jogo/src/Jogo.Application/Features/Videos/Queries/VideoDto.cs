namespace Jogo.Application.Features.Videos.Queries;

public record VideoDto(
    Guid Id,
    string StorageUrl,
    string OriginalFileName,
    TimeSpan Duration,
    DateTimeOffset UploadedAt,
    string Status,
    bool CanDelete
);
