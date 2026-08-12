using Jogo.Application.Common.Interfaces;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Logging;

namespace Jogo.Infrastructure.Services;

public class LocalFileStorageService(
    IWebHostEnvironment environment,
    ILogger<LocalFileStorageService> logger
) : IFileStorageService
{
    public async Task<string> UploadFileAsync(
        Stream fileStream,
        string fileName,
        string contentType,
        CancellationToken cancellationToken
    )
    {
        try
        {
            var uploadsFolder = Path.Combine(
                environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"),
                "uploads"
            );

            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            var uniqueFileName = $"{Guid.NewGuid()}_{fileName}";
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using var fileStreamToWrite = new FileStream(filePath, FileMode.Create);
            await fileStream.CopyToAsync(fileStreamToWrite, cancellationToken);

            return $"/uploads/{uniqueFileName}";
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error uploading file {FileName}", fileName);
            throw;
        }
    }

    public Task DeleteFileAsync(string fileUrl, CancellationToken cancellationToken)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(fileUrl)) return Task.CompletedTask;

            // Remove leading slash if present to prevent absolute path issues
            var normalizedUrl = fileUrl.TrimStart('/');
            
            var webRootPath = environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            var filePath = Path.Combine(webRootPath, normalizedUrl);

            if (File.Exists(filePath))
            {
                File.Delete(filePath);
                logger.LogInformation("Deleted file {FilePath}", filePath);
            }

            return Task.CompletedTask;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error deleting file {FileUrl}", fileUrl);
            // We usually don't want to fail the whole process if a delete fails, so we just log it.
            return Task.CompletedTask;
        }
    }
}
