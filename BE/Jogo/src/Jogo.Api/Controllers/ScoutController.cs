using Asp.Versioning;

using Jogo.Application.Common.Models;
using Jogo.Application.Features.Scout.Commands.UpdateProfile;
using Jogo.Application.Features.Scout.DTOs;
using Jogo.Application.Features.Scout.Queries.GetProfile;
using Jogo.Application.Features.Scout.Queries.ListContactRequests;
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
}
