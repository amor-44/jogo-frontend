namespace Jogo.Application.Features.Videos.DTOs;

public record VideoDto(
    Guid Id,
    string StorageUrl,
    string OriginalFileName,
    TimeSpan Duration,
    DateTimeOffset UploadedAt,
    string Status,
    bool CanDelete
);
