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


## Status

- [x] Player detection (PRD 5.3) — pretrained YOLOv8, `src/detection.py`

- [ ] Football metrics (5.8)

- [ ] Position-based templates (5.9)
- [x] Report generation (5.10) — `src/report.py`
