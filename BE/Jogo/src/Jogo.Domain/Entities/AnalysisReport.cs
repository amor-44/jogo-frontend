using Jogo.Domain.Common;
using Jogo.Domain.Common.Results;
using Jogo.Domain.ValueObjects;

namespace Jogo.Domain.Entities;

public class AnalysisReport : AuditableEntity
{
    public Guid VideoId { get; private set; }
    public int OverallScore { get; private set; }
    public string Summary { get; private set; } = string.Empty;
    public List<string> Strengths { get; private set; } = [];
    public List<string> Weaknesses { get; private set; } = [];
    public List<string> Recommendations { get; private set; } = [];
    public DateTimeOffset CompletedAt { get; private set; }
    public string AIModelVersion { get; private set; } = string.Empty;
    public PerformanceMetrics Metrics { get; private set; } = null!;
    public FootballVideo FootballVideo { get; private set; } = null!;

    private AnalysisReport() { }

    private AnalysisReport(
        Guid id,
        Guid videoId,
        int overallScore,
        string summary,
        IReadOnlyList<string> strengths,
        IReadOnlyList<string> weaknesses,
        IReadOnlyList<string> recommendations,
        string aiModelVersion,
        PerformanceMetrics metrics) : base(id)
    {
        VideoId = videoId;
        OverallScore = overallScore;
        Summary = summary;
        Strengths = strengths.ToList();
        Weaknesses = weaknesses.ToList();
        Recommendations = recommendations.ToList();
        AIModelVersion = aiModelVersion;
        Metrics = metrics;
        CompletedAt = DateTimeOffset.UtcNow;
    }

    public static Result<AnalysisReport> Create(
        Guid videoId,
        int overallScore,
        string summary,
        IReadOnlyList<string> strengths,
        IReadOnlyList<string> weaknesses,
        IReadOnlyList<string> recommendations,
        string aiModelVersion,
        PerformanceMetrics metrics)
    {
        if (videoId == Guid.Empty) return Error.Validation("AnalysisReport.InvalidVideo", "Video ID is required.");
        if (overallScore < 0 || overallScore > 100) return Error.Validation("AnalysisReport.InvalidScore", "Score must be between 0 and 100.");
        if (string.IsNullOrWhiteSpace(summary)) return Error.Validation("AnalysisReport.InvalidSummary", "Summary is required.");
        if (string.IsNullOrWhiteSpace(aiModelVersion)) return Error.Validation("AnalysisReport.InvalidModelVersion", "AI Model Version is required.");
        if (metrics == null) return Error.Validation("AnalysisReport.InvalidMetrics", "Performance metrics are required.");

        return new AnalysisReport(Guid.NewGuid(), videoId, overallScore, summary, strengths, weaknesses, recommendations, aiModelVersion, metrics);
    }
}
