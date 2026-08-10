using Jogo.Application.Features.Authentication.DTOs;
using Jogo.Domain.Common.Results;
using MediatR;

namespace Jogo.Application.Features.Authentication.Commands.Login;

public record LoginCommand(string Email, string Password) : IRequest<Result<AuthResponse>>;
