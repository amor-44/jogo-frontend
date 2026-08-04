using Asp.Versioning;
using Jogo.Application.Features.Player.CreateProfile;
using Jogo.Application.Features.Player.GetProfile;
using Jogo.Application.Features.Player.UpdateProfile;
using Jogo.Application.Features.Player.UploadProfileImage;
using Jogo.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Jogo.Api.Controllers;

[ApiVersion("1")]
[Route("api/v{version:apiVersion}/player")]
[Authorize(Roles = nameof(Role.Player))]
public class PlayerController : ApiController
{
    private readonly ISender _sender;

    public PlayerController(ISender sender)
    {
        _sender = sender;
    }

    [HttpGet("profile")]
    [ProducesResponseType(typeof(ProfileDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetProfile(CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetProfileQuery(), cancellationToken);

        if (result.IsError)
        {
            return Problem(new List<Jogo.Domain.Common.Results.Error> { result.TopError });
        }

        return Ok(result.Value);
    }

    [HttpPost("profile")]
    [ProducesResponseType(typeof(Guid), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> CreateProfile(
        [FromBody] CreateProfileCommand command,
        CancellationToken cancellationToken)
    {
        var result = await _sender.Send(command, cancellationToken);

        if (result.IsError)
        {
            return Problem(new List<Jogo.Domain.Common.Results.Error> { result.TopError });
        }

        return Ok(result.Value);
    }

    [HttpPut("profile")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateProfile(
        [FromBody] UpdateProfileCommand command,
        CancellationToken cancellationToken)
    {
        var result = await _sender.Send(command, cancellationToken);

        if (result.IsError)
        {
            return Problem(new List<Jogo.Domain.Common.Results.Error> { result.TopError });
        }

        return Ok();
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
        
        var result = await _sender.Send(command, cancellationToken);

        if (result.IsError)
        {
            return Problem(new List<Jogo.Domain.Common.Results.Error> { result.TopError });
        }

        return Ok(result.Value);
    }
}
