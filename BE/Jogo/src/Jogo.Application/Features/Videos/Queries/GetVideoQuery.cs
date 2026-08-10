using Jogo.Application.Features.Videos.DTOs;
using Jogo.Domain.Common.Results;
using MediatR;

namespace Jogo.Application.Features.Videos.Queries;

public record GetVideoQuery(Guid VideoId) : IRequest<Result<VideoDto>>;
