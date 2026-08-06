using Asp.Versioning;

using Jogo.Application.Features.Scout.CreateProfile;
using Jogo.Application.Features.Scout.GetPlayerProfile;
using Jogo.Application.Features.Scout.GetProfile;
using Jogo.Application.Features.Scout.GetReport;
using Jogo.Application.Features.Scout.SearchPlayers;
using Jogo.Application.Features.Scout.UpdateProfile;
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
    /// Get current scout profile.
    /// </summary>
    [HttpGet("me")]
    public async Task<IActionResult> GetProfile(CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetProfileQuery(), cancellationToken);

        if (result.IsError)
        {
            return Problem(result.Errors);
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Update current scout profile.
    /// </summary>
    [HttpPut("me")]
    public async Task<IActionResult> UpdateProfile(
        [FromBody] UpdateProfileCommand command,
        CancellationToken cancellationToken)
    {
        var result = await _sender.Send(command, cancellationToken);

        if (result.IsError)
        {
            return Problem(result.Errors);
        }

        return Ok(result.Value);
    }
    /// <summary>
    /// Create a new scout profile.
    /// </summary>
    [HttpPost]
    [AllowAnonymous]
    [ProducesResponseType(typeof(CreateScoutProfileResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateProfile(
        [FromBody] CreateProfileCommand command,
        CancellationToken cancellationToken)
    {
        var result = await _sender.Send(command, cancellationToken);

        if (result.IsError)
        {
            return Problem(result.Errors);
        }

        return CreatedAtAction(nameof(GetPlayerProfile), new { playerId = result.Value.ProfileId }, result.Value);
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