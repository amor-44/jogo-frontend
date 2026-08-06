using Jogo.Domain.Common.Results;

namespace Jogo.Application.Common.Interfaces;

public interface IIdentityService
{
    Task<Result<Guid>> RegisterUserAsync(string email, string password, CancellationToken cancellationToken = default);
    Task<Result<Guid>> CheckCredentialsAsync(string email, string password, CancellationToken cancellationToken = default);
}
