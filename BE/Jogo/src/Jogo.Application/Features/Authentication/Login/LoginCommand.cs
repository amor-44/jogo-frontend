using Jogo.Domain.Common.Results;
using MediatR;

namespace Jogo.Application.Features.Authentication.Login;

public record LoginCommand(string Email, string Password) : IRequest<Result<LoginResponse>>;
