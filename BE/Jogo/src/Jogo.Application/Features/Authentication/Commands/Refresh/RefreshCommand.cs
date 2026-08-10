using Jogo.Application.Features.Authentication.DTOs;
using Jogo.Domain.Common.Results;
using MediatR;

namespace Jogo.Application.Features.Authentication.Commands.Refresh;

public record RefreshCommand(string AccessToken, string RefreshToken) : IRequest<Result<AuthResponse>>;
