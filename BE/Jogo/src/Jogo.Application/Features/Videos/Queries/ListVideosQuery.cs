using Jogo.Application.Common.Models;
using Jogo.Domain.Common.Results;
using MediatR;

namespace Jogo.Application.Features.Videos.Queries;

public record ListVideosQuery(
    int PageNumber = 1,
    int PageSize = 10
) : IRequest<Result<PaginatedList<VideoDto>>>;
