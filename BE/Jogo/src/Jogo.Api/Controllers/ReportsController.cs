using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Jogo.Application.Common.Models;
using Jogo.Application.Features.Analysis.DTOs;
using Jogo.Application.Features.Analysis.Queries.GetReport;
using Jogo.Application.Features.Analysis.Queries.ListReports;

namespace Jogo.Api.Controllers;

[ApiController]
[ApiVersion("1")]
[Route("api/v{version:apiVersion}/[controller]")]
public class ReportsController(ISender sender) : ApiController
{
    /// <summary>
    /// Gets a specific analysis report by its ID.
    /// </summary>
    /// <param name="id">The ID of the report to retrieve.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The requested analysis report.</returns>
    [HttpGet("{id}")]
    [Authorize(Roles = "Player,Scout")]
    [ProducesResponseType(typeof(AnalysisReportDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetReport(Guid id, CancellationToken cancellationToken)
    {
        var query = new GetReportQuery(id);
        var result = await sender.Send(query, cancellationToken);
        
        return result.Match(
            success => Ok(success),
            Problem
        );
    }

    /// <summary>
    /// Lists all analysis reports for the current player.
    /// </summary>
    /// <param name="pageNumber">The page number to retrieve.</param>
    /// <param name="pageSize">The number of items per page.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A paginated list of analysis reports.</returns>
    [HttpGet]
    [Authorize(Roles = "Player")]
    [ProducesResponseType(typeof(PaginatedList<AnalysisReportDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> ListReports([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, CancellationToken cancellationToken = default)
    {
        var query = new ListReportsQuery(pageNumber, pageSize);
        var result = await sender.Send(query, cancellationToken);
        
        return result.Match(
            success => Ok(success),
            Problem
        );
    }
}
