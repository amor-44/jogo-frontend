using System.Collections.Generic;

namespace Jogo.Infrastructure.Services.Ai;

// ---------------------------------------------------------------------------
// C# models mirroring FootballPerformanceReport.to_dict() from the Python AI.
// Only the fields consumed by AiAnalysisReportDto mapping are declared;
// extra JSON fields are silently ignored during deserialization.
// ---------------------------------------------------------------------------

/// <summary>Top-level response from GET /analysis/{id}.</summary>
public record AiFootballPerformanceResponse(
    string AnalysisId,
    string Status,
    AiFootballPerformanceData? FootballPerformance,
    string? Error
);

/// <summary>Nested "football_performance" object.</summary>
public record AiFootballPerformanceData(
    AiScores Scores,
    List<string> Strengths,
    List<string> Weaknesses,
    List<string> Recommendations,
    List<string> Limitations,
    string AnalysisQuality
);

/// <summary>Score fields — all nullable because the pipeline marks them null
/// when there is insufficient evidence (honest, per the AI design).</summary>
public record AiScores(
    float? OverallScore,
    float? PassingAccuracy,
    float? BallControl,
    float? MovementEfficiency,
    float? AttackingImpact,
    float? PositioningScore,
    float? DefensiveActions,
    float? DecisionMaking
);
