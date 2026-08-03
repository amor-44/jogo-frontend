public class PlayerInsight
{
    public Guid Id { get; set; }
    public Guid ReportId { get; set; }
    public AIReport Report { get; set; } = null!;
    public InsightType Type { get; set; }
    public string Description { get; set; } = null!;
}
