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
}
