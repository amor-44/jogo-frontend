using Jogo.Application.Features.Player.DTOs;
using Jogo.Domain.Common.Results;
using Jogo.Domain.Enums;
using MediatR;

namespace Jogo.Application.Features.Player.Commands.UpdateProfile;

public record UpdateProfileCommand(
    string? City,
    decimal? Height,
    decimal? Weight,
    Position? SecondaryPosition,
    string? CurrentClub,
    string? Biography,
    string? FootballExperience,
    decimal? MarketValue,
    ProfileVisibility Visibility
) : IRequest<Result<Success>>;
