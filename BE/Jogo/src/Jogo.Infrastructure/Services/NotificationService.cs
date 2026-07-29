using Jogo.Application.Common.Interfaces;
using Microsoft.Extensions.Logging;

namespace Jogo.Infrastructure.Services;

public sealed class NotificationService(ILogger<NotificationService> logger) : INotificationService
{
    public Task SendEmailAsync(string to, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException();
    }

    public Task SendSmsAsync(string phoneNumber, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException();
    }
}
