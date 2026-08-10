using Jogo.Application.Features.Discovery.DTOs;
using Jogo.Domain.Enums;

namespace Jogo.Application.Features.Discovery.DTOs;

public record PlayerCardDto(
    Guid Id,
    string FullName,
    int Age,
    string Country,
    string? City,
    Position PrimaryPosition,
    Position? SecondaryPosition,
    string? CurrentClub,
    string? FootballExperience,
    decimal? MarketValue,
    string? ProfilePictureUrl,
    int? LatestOverallScore,
    int VideoCount = 0,
    List<Jogo.Application.Features.Analysis.DTOs.AnalysisReportDto>? Reports = null);
