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

There is a second, separately-built AI service at `../ai-video-analysis/` (FastAPI, YOLOv8 detection +
ByteTrack tracking + movement analysis + report generation). The two folders currently overlap on
detection/tracking/metrics/report-generation — that needs to be consolidated into one service. `actions.py`
here doesn't overlap with anything in `ai-video-analysis/` (no action classification exists there yet).

## Status

- [x] Player detection (PRD 5.3) — pretrained YOLOv8, `src/detection.py`
- [ ] Video quality assessment (5.1)
- [ ] Player tracking + Re-ID (5.4)
- [ ] Football metrics (5.8)
- [ ] Pose estimation (5.5)
- [x] Action recognition (5.7) — `src/actions.py`
- [ ] Fraud detection & trust score (5.2)
- [ ] Position-based templates (5.9)
- [ ] Report generation (5.10)
