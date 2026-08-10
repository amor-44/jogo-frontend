using Jogo.Application.Features.Player.DTOs;
using System.Text.Json.Serialization;
using Jogo.Domain.Common.Results;
using MediatR;

namespace Jogo.Application.Features.Player.Commands.RespondToContactRequest;

public record RespondToContactRequestCommand(
    Guid ContactRequestId,
    bool Accept) : IRequest<Result<Success>>;
