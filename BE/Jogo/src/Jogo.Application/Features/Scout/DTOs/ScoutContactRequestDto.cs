using System;

namespace Jogo.Application.Features.Scout.DTOs;

public record ScoutContactRequestDto(
    Guid ContactRequestId,
    Guid PlayerProfileId,
    string PlayerFullName,
    string PlayerPosition,
    string PlayerCountry,
    string Status,
    DateTimeOffset RequestedAt,
    DateTimeOffset? RespondedAt,
    string? PlayerEmail = null);
