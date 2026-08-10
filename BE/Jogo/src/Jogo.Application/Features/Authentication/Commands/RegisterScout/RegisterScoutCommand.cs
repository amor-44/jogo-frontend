using Jogo.Application.Features.Authentication.DTOs;
using Jogo.Domain.Common.Results;
using MediatR;

namespace Jogo.Application.Features.Authentication.Commands.RegisterScout;

public record RegisterScoutCommand(
    string Email,
    string Password,
    string Organization,
    string Country,
    int ExperienceYears) : IRequest<Result<AuthResponse>>;
