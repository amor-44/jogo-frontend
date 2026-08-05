using Jogo.Application.Common.Interfaces;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Logging;

namespace Jogo.Infrastructure.Services;

public class LocalVideoStorageService(
    IWebHostEnvironment environment,
    ILogger<LocalVideoStorageService> logger
) : IVideoStorageService
{
    public async Task<string> UploadVideoAsync(
        Stream videoStream,
        string fileName,
        string contentType,
        CancellationToken cancellationToken
    )
    {
        try
        {
            var uploadsFolder = Path.Combine(
                environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"),
                "uploads", "videos"
            );

            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            var uniqueFileName = $"{Guid.NewGuid()}_{fileName}";
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using var fileStreamToWrite = new FileStream(filePath, FileMode.Create);
            await videoStream.CopyToAsync(fileStreamToWrite, cancellationToken);

            return $"/uploads/videos/{uniqueFileName}";
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error uploading video {FileName}", fileName);
            throw;
        }
    }

    public Task DeleteVideoAsync(string fileUrl, CancellationToken cancellationToken)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(fileUrl))
                return Task.CompletedTask;

            // Trim leading slash and replace forward slashes with OS specific path separators
            var relativePath = fileUrl.TrimStart('/').Replace('/', Path.DirectorySeparatorChar);
            
            var filePath = Path.Combine(
                environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"),
                relativePath
            );

            if (File.Exists(filePath))
            {
                File.Delete(filePath);
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error deleting video {FileUrl}", fileUrl);
            // Optionally swallow or throw. For now, swallow it to avoid breaking the DB transaction if the file is already gone.
        }

        return Task.CompletedTask;
    }

    public Task<TimeSpan> GetVideoDurationAsync(string fileUrl, CancellationToken cancellationToken)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(fileUrl))
                return Task.FromResult(TimeSpan.Zero);

            var relativePath = fileUrl.TrimStart('/').Replace('/', Path.DirectorySeparatorChar);
            var filePath = Path.Combine(
                environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"),
                relativePath
            );

            if (File.Exists(filePath))
            {
                using var file = TagLib.File.Create(filePath);
                return Task.FromResult(file.Properties.Duration);
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error extracting duration for video {FileUrl}", fileUrl);
        }

        return Task.FromResult(TimeSpan.Zero);
    }
}
