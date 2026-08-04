using Jogo.Domain.Common.Results;
using Jogo.Domain.Enums;
using MediatR;

namespace Jogo.Application.Features.Player.UpdateProfile;

public record UpdateProfileCommand(
    string? City,
    decimal? Height,
    decimal? Weight,
    Position? SecondaryPosition,
    string? CurrentClub,
    string? Biography,
    ProfileVisibility Visibility) : IRequest<Result<Success>>;
