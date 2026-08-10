using Asp.Versioning;

using Jogo.Application.Features.Discovery.Commands.CreateContactRequest;
using Jogo.Application.Features.Player.Commands.RespondToContactRequest;
using Jogo.Application.Features.Player.DTOs;
using Jogo.Domain.Enums;

using MediatR;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Jogo.Api.Controllers;

[ApiVersion("1")]
[Route("api/v{version:apiVersion}/contact-requests")]
public class ContactRequestsController(ISender sender) : ApiController
{
    [HttpPost]
    [Authorize(Roles = nameof(Role.Scout))]
    [ProducesResponseType(typeof(Guid), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> CreateContactRequest(
        [FromBody] CreateContactRequestCommand command,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(command, cancellationToken);

        return result.Match(
            response => Ok(response),
            Problem
        );
    }

    [HttpPost("{id:guid}/respond")]
    [Authorize(Roles = nameof(Role.Player))]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RespondToContactRequest(
        Guid id,
        [FromBody] RespondToContactRequestDto dto,
        CancellationToken cancellationToken)
    {
        var command = new RespondToContactRequestCommand(id, dto.Accept);
        var result = await sender.Send(command, cancellationToken);

        return result.Match(
            _ => Ok(),
            Problem
        );
    }

    [HttpGet("player")]
    [Authorize(Roles = nameof(Role.Player))]
    [ProducesResponseType(typeof(Jogo.Application.Common.Models.PaginatedList<Jogo.Application.Features.Player.DTOs.PlayerContactRequestDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> ListPlayerContactRequests(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        var query = new Jogo.Application.Features.Player.Queries.ListContactRequests.ListContactRequestsQuery(pageNumber, pageSize);
        var result = await sender.Send(query, cancellationToken);

        return result.Match(
            response => Ok(response),
            Problem
        );
    }

    [HttpGet("scout")]
    [Authorize(Roles = nameof(Role.Scout))]
    [ProducesResponseType(typeof(Jogo.Application.Common.Models.PaginatedList<Jogo.Application.Features.Scout.DTOs.ScoutContactRequestDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> ListScoutContactRequests(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        var query = new Jogo.Application.Features.Scout.Queries.ListContactRequests.ListContactRequestsQuery(pageNumber, pageSize);
        var result = await sender.Send(query, cancellationToken);

        return result.Match(
            response => Ok(response),
            Problem
        );
    }
}
