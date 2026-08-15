using System.Collections.Generic;
using System.Text.Json.Serialization;

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
    // Python model outputs both position_score and positioning_score.
    // Use explicit JsonPropertyName so snake_case auto-naming doesn't mangle them.
    [property: JsonPropertyName("overall_score")] float? OverallScore,
    [property: JsonPropertyName("passing_accuracy")] float? PassingAccuracy,
    [property: JsonPropertyName("ball_control")] float? BallControl,
    [property: JsonPropertyName("movement_efficiency")] float? MovementEfficiency,
    [property: JsonPropertyName("attacking_impact")] float? AttackingImpact,
    [property: JsonPropertyName("positioning_score")] float? PositioningScore,
    [property: JsonPropertyName("position_score")] float? PositionScore,
    [property: JsonPropertyName("defensive_actions")] float? DefensiveActions,
    [property: JsonPropertyName("decision_making")] float? DecisionMaking);