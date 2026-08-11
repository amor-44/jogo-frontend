using Jogo.Application.Features.Analysis.Commands.RequestAnalysis;
using Jogo.Application.Features.Analysis.Commands.RetryAnalysis;
using Jogo.Application.Features.Videos.Commands.DeleteVideo;
using Jogo.Application.Features.Videos.Queries;
using Jogo.Application.Features.Videos.Commands.UploadVideo;
using MediatR;
using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using System.Threading;
using System.Threading.Tasks;
using System;

namespace Jogo.Api.Controllers;

[ApiController]
[ApiVersion("1")]
[Route("api/v{version:apiVersion}/[controller]")]
[Authorize(Roles = "Player")]
public class VideosController(ISender sender) : ApiController
{
    [HttpPost]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(Guid), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> UploadVideo(IFormFile file, CancellationToken cancellationToken)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest("File is required.");
        }

        using var stream = file.OpenReadStream();
        var command = new UploadVideoCommand(stream, file.FileName, file.ContentType);
        
        var result = await sender.Send(command, cancellationToken);
        
        return result.Match(
            success => Ok(new { Id = success }),
            Problem
        );
    }

    [HttpGet]
    [ProducesResponseType(typeof(Jogo.Application.Common.Models.PaginatedList<Jogo.Application.Features.Videos.DTOs.VideoDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> ListVideos([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, CancellationToken cancellationToken = default)
    {
        var query = new ListVideosQuery(pageNumber, pageSize);
        var result = await sender.Send(query, cancellationToken);
        
        return result.Match(
            success => Ok(success),
            Problem
        );
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(Jogo.Application.Features.Videos.DTOs.VideoDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetVideo(Guid id, CancellationToken cancellationToken)
    {
        var query = new GetVideoQuery(id);
        var result = await sender.Send(query, cancellationToken);
        
        return result.Match(
            success => Ok(success),
            Problem
        );
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteVideo(Guid id, CancellationToken cancellationToken)
    {
        var command = new DeleteVideoCommand(id);
        var result = await sender.Send(command, cancellationToken);
        
        return result.Match(
            success => NoContent(),
            Problem
        );
    }

    [HttpPost("{id}/analysis")]
    [ProducesResponseType(StatusCodes.Status202Accepted)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RequestAnalysis(Guid id, CancellationToken cancellationToken)
    {
        var command = new RequestAnalysisCommand { VideoId = id };
        var result = await sender.Send(command, cancellationToken);
        
        return result.Match(
            success => Accepted(),
            Problem
        );
    }

    [HttpPost("{id}/analysis/retry")]
    [ProducesResponseType(StatusCodes.Status202Accepted)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> RetryAnalysis(Guid id, CancellationToken cancellationToken)
    {
        var command = new RetryAnalysisCommand { VideoId = id };
        var result = await sender.Send(command, cancellationToken);

        return result.Match(
            success => Accepted(),
            Problem
        );
    }
}
