using System.Collections.Generic;
public class AIReport
{
    public Guid Id { get; set; }
    public Guid VideoId { get; set; }
    public FootballVideo Video { get; set; } = null!;
    public decimal OverallScore { get; set; }
    public decimal PassingAccuracy { get; set; }
    public decimal BallControl { get; set; }
    public decimal PositioningScore { get; set; }
    public decimal MovementEfficiency { get; set; }
    public decimal DefensiveActions { get; set; }
    public decimal AttackingImpact { get; set; }
    public decimal DecisionMaking { get; set; }
    public string AIModelVersion { get; set; } = null!;
    public DateTime AnalysisDate { get; set; }
    public ICollection<PlayerInsight> Insights { get; set; } = new List<PlayerInsight>();
}
