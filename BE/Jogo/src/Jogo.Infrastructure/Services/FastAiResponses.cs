using System.Text.Json.Serialization;

namespace Jogo.Infrastructure.Services.Ai;

public record FastAiStartResponse(
    [property: JsonPropertyName("analysis_id")] string AnalysisId,
    [property: JsonPropertyName("status")] string Status,
    [property: JsonPropertyName("message")] string Message
);

public record FastAiPollResponse(
    [property: JsonPropertyName("analysis_id")] string AnalysisId,
    [property: JsonPropertyName("status")] string Status,
    [property: JsonPropertyName("report")] FastAiReportDetails? Report,
    [property: JsonPropertyName("error")] string? Error
);

public record FastAiReportDetails(
    [property: JsonPropertyName("metrics")] FastAiMetrics Metrics,
    [property: JsonPropertyName("observations")] List<string> Observations,
    [property: JsonPropertyName("recommendations")] List<string> Recommendations,
    [property: JsonPropertyName("limitations")] List<string> Limitations
);

public record FastAiMetrics(
    [property: JsonPropertyName("average_speed_pixels_per_second")] double AvgSpeed,
    [property: JsonPropertyName("estimated_distance_pixels")] double Distance,
    [property: JsonPropertyName("direction_changes")] int DirectionChanges,
    [property: JsonPropertyName("confidence_level")] string ConfidenceLevel
);