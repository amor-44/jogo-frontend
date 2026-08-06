namespace Jogo.Application.Common.Interfaces;

public interface IVideoStorageService
{
    Task<string> UploadVideoAsync(Stream videoStream, string fileName, string contentType, CancellationToken cancellationToken);
    Task DeleteVideoAsync(string fileUrl, CancellationToken cancellationToken);
    Task<TimeSpan> GetVideoDurationAsync(string fileUrl, CancellationToken cancellationToken);
}
