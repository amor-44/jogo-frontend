using Jogo.Application.Features.Authentication.DTOs;
using Jogo.Domain.Common.Results;
using MediatR;

namespace Jogo.Application.Features.Authentication.Commands.Logout;

public record LogoutCommand(string RefreshToken) : IRequest<Result<Success>>;
