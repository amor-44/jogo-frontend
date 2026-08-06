using Jogo.Domain.Common.Results;
using MediatR;

namespace Jogo.Application.Features.Videos.DeleteVideo;

public record DeleteVideoCommand(Guid VideoId) : IRequest<Result<Success>>;
