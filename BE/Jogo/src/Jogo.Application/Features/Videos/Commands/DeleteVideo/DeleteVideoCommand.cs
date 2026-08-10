using Jogo.Application.Features.Videos.DTOs;
using Jogo.Domain.Common.Results;
using MediatR;

namespace Jogo.Application.Features.Videos.Commands.DeleteVideo;

public record DeleteVideoCommand(Guid VideoId) : IRequest<Result<Success>>;
