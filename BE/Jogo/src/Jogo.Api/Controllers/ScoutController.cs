using Asp.Versioning;

using Jogo.Application.Features.Scout.GetPlayerProfile;
using Jogo.Application.Features.Scout.GetReport;
using Jogo.Application.Features.Scout.SearchPlayers;
using Jogo.Domain.Enums;

using MediatR;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Jogo.Api.Controllers;

[ApiVersion("1")]
[Route("api/v{version:apiVersion}/scout")]
[Authorize(Roles = nameof(Role.Scout))]
public class ScoutController : ApiController
{
    private readonly ISender _sender;

    public ScoutController(ISender sender)
    {
        _sender = sender;
    }

    /// <summary>
    /// Search players with filters.
    /// </summary>
    [HttpGet("players")]
    [ProducesResponseType(typeof(SearchPlayersResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> SearchPlayers(
        [FromQuery] SearchPlayersQuery query,
        CancellationToken cancellationToken)
    {
        var result = await _sender.Send(query, cancellationToken);

        if (result.IsError)
        {
            return Problem(result.Errors);
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Get player profile by id.
    /// </summary>
    [HttpGet("players/{playerId:guid}")]
    [ProducesResponseType(typeof(PlayerProfileDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetPlayerProfile(
        Guid playerId,
        CancellationToken cancellationToken)
    {
        var result = await _sender.Send(
            new GetPlayerProfileQuery(playerId),
            cancellationToken);

        if (result.IsError)
        {
            return Problem(result.Errors);
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Get player's best analysis report.
    /// </summary>
    [HttpGet("players/{playerId:guid}/report")]
    [ProducesResponseType(typeof(ReportDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetReport(
        Guid playerId,
        CancellationToken cancellationToken)
    {
        var result = await _sender.Send(
            new GetReportQuery(playerId),
            cancellationToken);

        if (result.IsError)
        {
            return Problem(result.Errors);
        }

        return Ok(result.Value);
    }
}