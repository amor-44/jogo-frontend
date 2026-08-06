namespace Jogo.Application.Features.Scout.GetReport;

public record ReportDto(
    Guid ReportId,
    int OverallScore,
    string Summary,
    IReadOnlyList<string> Strengths,
    IReadOnlyList<string> Weaknesses,
    IReadOnlyList<string> Recommendations,
    DateTimeOffset CompletedAt,
    string AIModelVersion
);
