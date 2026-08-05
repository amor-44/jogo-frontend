namespace Jogo.Application.Dtos;

public record AiAnalysisReportDto(
    int OverallScore,
    string Summary,
    List<string> Strengths,
    List<string> Weaknesses,
    List<string> Recommendations,
    string AIModelVersion
);
