using Jogo.Domain.Common.Results;
using MediatR;

namespace Jogo.Application.Features.Videos.UploadVideo;

public record UploadVideoCommand(
    Stream VideoStream,
    string FileName,
    string ContentType
) : IRequest<Result<Guid>>;
