namespace Jogo.Application.Features.Analysis.DTOs;

public record PerformanceMetricsDto(
    int PositionScore,
    int PassingAccuracy,
    int BallControl,
    int PositioningScore,
    int MovementEfficiency,
    int DefensiveActions,
    int AttackingImpact,
    int DecisionMaking
);
