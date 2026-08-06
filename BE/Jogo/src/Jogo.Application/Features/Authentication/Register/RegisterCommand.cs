using Jogo.Domain.Common.Results;
using MediatR;

namespace Jogo.Application.Features.Authentication.Register;

public record RegisterCommand(string Email, string Password, string Role) : IRequest<Result<Guid>>;
