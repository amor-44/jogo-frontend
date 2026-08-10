using Asp.Versioning;

using Jogo.Application.Common.Models;
using Jogo.Application.Features.Discovery.DTOs;
using Jogo.Application.Features.Discovery.Queries.GetPlayerProfile;
using Jogo.Application.Features.Discovery.Queries.SearchPlayers;
using Jogo.Domain.Enums;

using MediatR;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Jogo.Api.Controllers;

[ApiVersion("1")]
[Route("api/v{version:apiVersion}/players")]
[AllowAnonymous]
[Tags("Scout Discovery (Public)")]
public class PlayersController(ISender sender) : ApiController
{
    [HttpGet]
    [ProducesResponseType(typeof(PaginatedList<PlayerCardDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> SearchPlayers(
        [FromQuery] int PageNumber = 1,
        [FromQuery] int PageSize = 10,
        [FromQuery] int? MinAge = null,
        [FromQuery] int? MaxAge = null,
        [FromQuery] Position? Position = null,
        [FromQuery] string? Country = null,
        [FromQuery] int? MinOverallScore = null,
        [FromQuery] int? MaxOverallScore = null,
        CancellationToken cancellationToken = default)
    {
        var query = new SearchPlayersQuery(PageNumber, PageSize, MinAge, MaxAge, Position, Country, MinOverallScore, MaxOverallScore);
        var result = await sender.Send(query, cancellationToken);

        return result.Match(
            response => Ok(response),
            Problem
        );
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(PlayerCardDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetPlayer(
        Guid id,
        CancellationToken cancellationToken)
    {
        var query = new GetPlayerProfileQuery(id);
        var result = await sender.Send(query, cancellationToken);

        return result.Match(
            response => Ok(response),
            Problem
        );
    }
}
