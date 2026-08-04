using Jogo.Domain.Common.Results;
using MediatR;

namespace Jogo.Application.Features.Player.UploadProfileImage;

public record UploadProfileImageCommand(
    Stream FileStream,
    string FileName,
    string ContentType) : IRequest<Result<string>>;
