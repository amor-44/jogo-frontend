using Jogo.Domain.Common.Results;
using MediatR;

namespace Jogo.Application.Features.Authentication.Refresh;

public record RefreshCommand(string RefreshToken) : IRequest<Result<RefreshResponse>>;
