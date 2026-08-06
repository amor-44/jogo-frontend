using Jogo.Domain.Common.Results;
using Jogo.Domain.Enums;

using MediatR;

namespace Jogo.Application.Features.Player.CreateProfile;

public record CreateProfileCommand(
    string Email,
    string Password,
    string Role,
    string FullName,
    DateTime DateOfBirth,
    Position PrimaryPosition,
    PreferredFoot PreferredFoot,
    string Country) : IRequest<Result<CreateProfileResponse>>;