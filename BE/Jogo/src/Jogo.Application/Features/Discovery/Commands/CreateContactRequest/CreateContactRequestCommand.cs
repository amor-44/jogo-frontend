using Jogo.Application.Features.Discovery.DTOs;
using System.Text.Json.Serialization;
using Jogo.Domain.Common.Results;
using MediatR;

namespace Jogo.Application.Features.Discovery.Commands.CreateContactRequest;

public record CreateContactRequestCommand(
    Guid PlayerProfileId,
    string? Message) : IRequest<Result<Guid>>;
