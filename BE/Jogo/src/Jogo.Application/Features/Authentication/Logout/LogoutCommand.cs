using Jogo.Domain.Common.Results;
using MediatR;

namespace Jogo.Application.Features.Authentication.Logout;

public record LogoutCommand(string RefreshToken) : IRequest<Result<Success>>;
