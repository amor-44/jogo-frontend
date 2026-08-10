using Jogo.Domain.Common;

namespace Jogo.Domain.ValueObjects;

public class PerformanceMetrics
{
    public int PositionScore { get; private set; }
    public int PassingAccuracy { get; private set; }
    public int BallControl { get; private set; }
    public int PositioningScore { get; private set; }
    public int MovementEfficiency { get; private set; }
    public int DefensiveActions { get; private set; }
    public int AttackingImpact { get; private set; }
    public int DecisionMaking { get; private set; }

    private PerformanceMetrics() { }

    private PerformanceMetrics(
        int positionScore,
        int passingAccuracy,
        int ballControl,
        int positioningScore,
        int movementEfficiency,
        int defensiveActions,
        int attackingImpact,
        int decisionMaking)
    {
        PositionScore = positionScore;
        PassingAccuracy = passingAccuracy;
        BallControl = ballControl;
        PositioningScore = positioningScore;
        MovementEfficiency = movementEfficiency;
        DefensiveActions = defensiveActions;
        AttackingImpact = attackingImpact;
        DecisionMaking = decisionMaking;
    }

    public static PerformanceMetrics Create(
        int positionScore,
        int passingAccuracy,
        int ballControl,
        int positioningScore,
        int movementEfficiency,
        int defensiveActions,
        int attackingImpact,
        int decisionMaking)
    {
        return new PerformanceMetrics(
            positionScore,
            passingAccuracy,
            ballControl,
            positioningScore,
            movementEfficiency,
            defensiveActions,
            attackingImpact,
            decisionMaking);
    }

}
