using System.Collections.Generic;

namespace Jogo.Infrastructure.Services.Ai.Performance;

public record AiFootballPerformanceResponse(
    string AnalysisId,
    string Status,
    AiFootballPerformanceData? FootballPerformance,
    string? Error);

public record AiFootballPerformanceData(
    AiScores Scores,
    List<string> Strengths,
    List<string> Weaknesses,
    List<string> Recommendations,
    List<string> Limitations,
    string AnalysisQuality);

public record AiScores(
    float? OverallScore,
    float? PassingAccuracy,
    float? BallControl,
    float? MovementEfficiency,
    float? AttackingImpact,
    float? PositioningScore,
    float? DefensiveActions,
    float? DecisionMaking);