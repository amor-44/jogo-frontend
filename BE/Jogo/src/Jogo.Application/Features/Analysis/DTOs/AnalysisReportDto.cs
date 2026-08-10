using System;
using System.Collections.Generic;

namespace Jogo.Application.Features.Analysis.DTOs;

public record AnalysisReportDto(
    Guid Id,
    Guid VideoId,
    int OverallScore,
    string Summary,
    
    List<string> Strengths,
    
    List<string> Weaknesses,
    
    List<string> Recommendations,
    
    string AIModelVersion,

    DateTimeOffset CompletedAt,
    
    PerformanceMetricsDto Metrics
);
