namespace Jogo.Application.Common.Interfaces;

public interface IFileStorageService
{
    Task<string> UploadFileAsync(Stream fileStream, string fileName, string contentType, CancellationToken cancellationToken);
    Task DeleteFileAsync(string fileUrl, CancellationToken cancellationToken);
}
