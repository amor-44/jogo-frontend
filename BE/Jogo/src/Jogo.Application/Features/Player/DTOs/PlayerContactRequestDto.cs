using System;

namespace Jogo.Application.Features.Player.DTOs;

public record PlayerContactRequestDto(
    Guid ContactRequestId,
    Guid ScoutProfileId,
    string Organization,
    string Country,
    int ExperienceYears,
    string Status,
    DateTimeOffset RequestedAt,
    DateTimeOffset? RespondedAt);
