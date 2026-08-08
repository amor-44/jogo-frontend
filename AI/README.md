# Jogo AI Service

Computer-vision pipeline for the Jogo platform: player detection, tracking, pose, metrics, and report generation
from a single uploaded match video (see the PRD, Section 5 — AI Engineering Playbook).

## Local setup

```
cd AI
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Layout

- `src/` — pipeline modules (detection, tracking, pose, metrics, ...), one file per PRD Section 5 module.
- `scripts/` — standalone entry points for local benchmarking (e.g. `scripts/benchmark_detection.py`).

## Note on `ai-video-analysis/`

detection/tracking/metrics/report-generation — that needs to be consolidated into one service, and this
folder's PRs add capabilities (Re-ID, real-world metrics, PRD-11.2-exact report schema) worth merging in
rather than picking one folder to delete outright.

## Note on the backend report DTO

`BE/Jogo/src/Jogo.Application/Dtos/AiAnalysisReportDto.cs` currently has a different shape
(OverallScore/Summary/Strengths/Weaknesses/Recommendations/AIModelVersion) than the PRD 11.2 schema
`report.py` implements here. Worth syncing with the backend devs on which is canonical.

> > > > > > > main

## Status

- [x] Player detection (PRD 5.3) — pretrained YOLOv8, `src/detection.py`
- [x] Video quality assessment (5.1) — `src/video_quality.py`
- [x] Player tracking + Re-ID (5.4) — `src/tracking.py`
- [x] Football metrics (5.8) — `src/metrics.py`
- [x] Pose estimation (5.5) — `src/pose.py`
- [x] Action recognition (5.7) — `src/action_recognition.py`
- [x] Fraud detection & trust score (5.2) — `src/fraud_detection.py`
- [x] Position-based templates (5.9) — `src/position_templates.py`
- [x] Report generation (5.10) — `src/report.py`
