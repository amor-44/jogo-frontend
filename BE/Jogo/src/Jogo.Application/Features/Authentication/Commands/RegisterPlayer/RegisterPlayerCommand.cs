using Jogo.Application.Features.Authentication.DTOs;
using Jogo.Domain.Common.Results;
using Jogo.Domain.Enums;
using MediatR;

namespace Jogo.Application.Features.Authentication.Commands.RegisterPlayer;

public record RegisterPlayerCommand(
    string Email,
    string Password,
    string FullName,
    DateTime DateOfBirth,
    Position PrimaryPosition,
    PreferredFoot PreferredFoot,
    string Country
) : IRequest<Result<AuthResponse>>;
