using Jogo.Application.Common.Interfaces;
using Microsoft.Extensions.Logging;

namespace Jogo.Infrastructure.Services;

public sealed class NotificationService(ILogger<NotificationService> logger) : INotificationService
{
    public Task SendEmailAsync(string to, CancellationToken cancellationToken = default)
    {
        logger.LogInformation("Sending email to {To}", to);
        return Task.CompletedTask;
    }

    public Task SendSmsAsync(string phoneNumber, CancellationToken cancellationToken = default)
    {
        logger.LogInformation("Sending SMS to {PhoneNumber}", phoneNumber);
        return Task.CompletedTask;
    }
}
