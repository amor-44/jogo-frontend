"""Report generation (PRD Section 5.10).

Aggregates every upstream module's output into the exact JSON shape the backend expects
(PRD Section 11.2's "Analysis result" contract), validated with Pydantic so the .NET
backend can deserialize it without ambiguity (PRD step 76). Also renders an HTML/CSS
template (delivered by the Graphic Designer) to PDF via WeasyPrint for the shareable
version (step 79).

`build_report()` deliberately takes plain scalars/dicts rather than importing the other
modules' dataclasses (`QualityAssessment`, `TrustAssessment`, `FootballMetrics`, ...) —
this is the one module that conceptually depends on everything else (PRD 5.10 is built
last, after 5.1-5.9), but a hard Python import dependency would mean this file can't even
be reviewed/tested until every other module's PR has merged. Passing plain values matches
how results would actually flow through a real job pipeline anyway (a job store keyed by
job id, not shared live objects across independently-developed modules — see
`ai-video-analysis/app/storage/job_store.py` for exactly that pattern already in place).

Note for whoever wires this into the backend: `Jogo.Application.Dtos.AiAnalysisReportDto`
(BE/Jogo/src/Jogo.Application/Dtos/AiAnalysisReportDto.cs) currently has a *different*
shape (OverallScore/Summary/Strengths/Weaknesses/Recommendations/AIModelVersion) than
this PRD-11.2-based schema. That looks like early backend scaffolding that hasn't been
synced to the PRD contract yet — worth a heads-up to the backend devs rather than silently
picking one shape.
"""

from pydantic import BaseModel, Field

SCHEMA_VERSION = "1.0"


class ActionDto(BaseModel):
    type: str
    confidence: float
    timestampMs: float


class MetricsDto(BaseModel):
    distanceCoveredKm: float
    avgSpeedKmh: float
    maxSpeedKmh: float
    sprintsCount: int
    heatmapUrl: str | None = None


class PositionAnalysisDto(BaseModel):
    position: str
    unavailableMetrics: list[str]


class AnalysisResult(BaseModel):
    """Exact shape of PRD 11.2's "Analysis result (AI Service -> .NET, via RabbitMQ)"."""

    schemaVersion: str = SCHEMA_VERSION
    jobId: str
    status: str
    qualityScore: float
    trustScore: float
    metrics: MetricsDto
    actions: list[ActionDto] = Field(default_factory=list)
    positionAnalysis: PositionAnalysisDto
    confidenceOverall: float


def _confidence_overall(quality_score: float, trust_score: float, action_confidences: list[float]) -> float:
    """PRD step 78: simple, documented function — never an opaque single number.

    Equal-weighted average of: input quality, trust (fraud) score, and the mean
    confidence of detected actions (1.0 — i.e. no penalty — if no actions were
    detected, since an empty action list isn't itself a confidence problem).
    """
    action_confidence = sum(action_confidences) / len(action_confidences) if action_confidences else 1.0
    return round((quality_score + trust_score + action_confidence) / 3, 4)


def build_report(
    job_id: str,
    quality_score: float,
    trust_score: float,
    distance_covered_km: float,
    avg_speed_kmh: float,
    max_speed_kmh: float,
    actions: list[dict],  # each: {"type": str, "confidence": float, "timestamp_ms": float}
    position: str,
    unavailable_metrics: list[str],
    heatmap_url: str | None = None,
) -> AnalysisResult:
    """PRD steps 76-78: populate the Pydantic model from every upstream module's output.

    Each parameter maps directly to one upstream module's result:
    - quality_score        <- video_quality.assess_video_quality().quality_score (5.1)
    - trust_score           <- fraud_trust.assess_trust().trust_score (5.2)
    - distance/avg/max speed <- metrics.compute_metrics() (5.8)
    - actions                <- actions.classify_actions(), each event as a dict (5.7)
    - position/unavailable   <- position_templates.build_position_analysis() (5.9)
    """
    sprints_count = sum(1 for a in actions if a["type"] == "sprint")
    action_confidences = [a["confidence"] for a in actions]

    return AnalysisResult(
        jobId=job_id,
        status="completed",
        qualityScore=quality_score,
        trustScore=trust_score,
        metrics=MetricsDto(
            distanceCoveredKm=distance_covered_km,
            avgSpeedKmh=avg_speed_kmh,
            maxSpeedKmh=max_speed_kmh,
            sprintsCount=sprints_count,
            heatmapUrl=heatmap_url,
        ),
        actions=[ActionDto(type=a["type"], confidence=a["confidence"], timestampMs=a["timestamp_ms"]) for a in actions],
        positionAnalysis=PositionAnalysisDto(position=position, unavailableMetrics=unavailable_metrics),
        confidenceOverall=_confidence_overall(quality_score, trust_score, action_confidences),
    )


def render_report_pdf(report: AnalysisResult, template_path: str, output_path: str) -> str:
    """PRD step 79: render the Graphic Designer's HTML/CSS template with Jinja2, convert to PDF."""
    from jinja2 import Template
    from weasyprint import HTML

    with open(template_path, encoding="utf-8") as f:
        template = Template(f.read())
    html = template.render(report=report.model_dump())
    HTML(string=html).write_pdf(output_path)
    return output_path
