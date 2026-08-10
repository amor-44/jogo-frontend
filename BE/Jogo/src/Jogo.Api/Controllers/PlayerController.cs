using Asp.Versioning;

using Jogo.Application.Common.Models;
using Jogo.Application.Features.Player.Commands.UpdateProfile;
using Jogo.Application.Features.Player.Commands.UploadProfileImage;
using Jogo.Application.Features.Player.DTOs;
using Jogo.Application.Features.Player.Queries.GetProfile;
using Jogo.Application.Features.Player.Queries.ListContactRequests;
using Jogo.Domain.Enums;

using MediatR;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Jogo.Api.Controllers;

[ApiVersion("1")]
[Route("api/v{version:apiVersion}/player")]
[Authorize(Roles = nameof(Role.Player))]
[Tags("Player Dashboard (Private)")]
public class PlayerController(ISender sender) : ApiController
{
    [HttpGet("me")]
    [ProducesResponseType(typeof(PlayerProfileDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetProfile(CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetProfileQuery(), cancellationToken);
        return result.Match(
            response => Ok(response),
            Problem
        );
    }

    [HttpPut("me")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateProfile(
        [FromBody] UpdateProfileCommand command,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(command, cancellationToken);
        return result.Match(
            _ => Ok(),
            Problem
        );
    }

    [HttpPost("profile/image")]
    [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UploadProfileImage(
        IFormFile file,
        CancellationToken cancellationToken)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest("File is empty.");
        }

        await using var stream = file.OpenReadStream();
        var command = new UploadProfileImageCommand(stream, file.FileName, file.ContentType);

        var result = await sender.Send(command, cancellationToken);
        return result.Match(
            response => Ok(response),
            Problem
        );
    }

}
