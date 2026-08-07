# Jogo — AI Video Analysis Service (MVP)

A standalone backend service that analyzes short football skill/training clips: it detects and
tracks the main player, computes simple movement metrics, and returns a structured performance
report as JSON.

This is deliberately an **MVP**, scoped to what can be reliably extracted from a short,
single-subject clip — not a research system for understanding a full professional match.

> This service is independent from the Jogo chatbot backend and shares no code with it.

---

## 1. Architecture

```
API (FastAPI)
   |
   v
Video Service        — validate, save, extract frames/metadata
   |
   v
Tracking Service      — YOLO detection + ByteTrack, per-frame player observations
   |
   v
Movement Analysis      — turns raw tracking into distance/speed/consistency metrics
   |
   v
Visualizer + Report Generator — trajectory/heatmap/annotated video, key frames, JSON report
   |
   v
Job Store (in-memory) — status + result, polled via GET /analysis/{id}
```

**Why this architecture fits an MVP:**

- **Single responsibility per module.** Detection, tracking, movement analysis, and reporting
  are separate modules with no circular dependencies. Any one of them (e.g. the detector) can be
  swapped — for a football-specific fine-tuned model, a different tracker, a smarter report
  generator — without touching the others.
- **No premature infrastructure.** Analysis runs as a FastAPI `BackgroundTask` against an
  in-memory job store. That's enough for a single-process MVP and is trivial to reason about.
  A queue (Celery/RQ) and persistent store (Postgres/Redis) are natural next steps once this
  needs to scale beyond one process — deliberately not built now.
- **Explainable, not "smart".** Metrics (distance, speed, direction changes...) are simple,
  auditable calculations over tracked positions — not black-box scores. This matches the stated
  scope: movement analysis, not tactical/technical intelligence.
- **Detection + tracking reuse Ultralytics' built-in ByteTrack integration** (`model.track(...)`)
  rather than a hand-rolled tracker, keeping the dependency surface small while staying reliable.

## 2. Repository Structure

```
ai-video-analysis/
├── app/
│   ├── main.py                    FastAPI app, loads YOLO once at startup
│   ├── config.py                  Centralized settings (env-driven)
│   ├── api/
│   │   ├── routes.py              POST /analyze, GET /analysis/{id}, GET /health
│   │   └── schemas.py             API request/response models
│   ├── services/
│   │   ├── video_service.py       Validate, save, extract frames/metadata
│   │   └── analysis_service.py    Orchestrates the full pipeline
│   ├── detection/
│   │   └── detector.py            Standalone YOLO person-detection wrapper
│   ├── tracking/
│   │   └── tracker.py             YOLO + ByteTrack video tracking
│   ├── analysis/
│   │   └── movement_analyzer.py   Metrics computation from track observations
│   ├── reports/
│   │   ├── visualizer.py          Trajectory, heatmap, annotated frames/video
│   │   └── report_generator.py    Builds the structured JSON report
│   ├── models/
│   │   └── schemas.py             Domain models (Report, AnalysisJob, ...)
│   ├── storage/
│   │   └── job_store.py           In-memory thread-safe job store
│   └── utils/
│       ├── logger.py
│       └── file_utils.py
├── tests/                         Unit + API tests (YOLO mocked, no GPU/network needed)
├── data/
│   ├── uploads/                   Saved input videos (gitignored, folder kept)
│   └── outputs/{analysis_id}/     Generated key frames, trajectory, heatmap, annotated video
├── requirements.txt
├── .env.example
└── pytest.ini
```

## 3. Processing Pipeline

```
Upload video → Validate → Save → Extract metadata (fps/duration/resolution)
   → YOLO detection + ByteTrack tracking (per frame)
   → Pick the "main" track (heuristic: most-observed track id)
   → Movement analysis (distance, speed, consistency, direction changes...)
   → Extract key frames (beginning/middle/end/max-movement) + trajectory/heatmap/annotated video
   → Build structured JSON report
   → Store result, pollable via GET /analysis/{id}
```

## 4. Installation

Requires Python 3.10+.

```bash
cd ai-video-analysis
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env             # adjust if needed
```

On first run, Ultralytics automatically downloads the `yolov8n.pt` weights (~6MB) if not already
present locally.

## 5. Running

```bash
uvicorn app.main:app --reload --port 8000
```

- Interactive API docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/health`

## 6. API Documentation

### `POST /analyze`
Accepts a video file and starts analysis in the background.

**Request:** `multipart/form-data`
| Field       | Type | Required | Description                          |
|-------------|------|----------|--------------------------------------|
| `file`      | file | yes      | Video file (`.mp4`, `.mov`, `.avi`, `.mkv`, ≤60s, ≤200MB) |
| `player_id` | str  | no       | Optional client-side player identifier |

**Response `202 Accepted`:**
```json
{
  "analysis_id": "a1b2c3d4e5f6",
  "status": "pending",
  "message": "Video accepted for processing."
}
```

### `GET /analysis/{analysis_id}`
Returns current status and, once complete, the full report.

**Response `200 OK` (completed example):**
```json
{
  "analysis_id": "a1b2c3d4e5f6",
  "status": "completed",
  "report": {
    "analysis_id": "a1b2c3d4e5f6",
    "video_filename": "a1b2c3d4e5f6.mp4",
    "generated_at": "2026-08-07T10:15:00Z",
    "metrics": {
      "video_duration_seconds": 32.4,
      "frames_processed": 972,
      "fps": 30.0,
      "resolution": "1920x1080",
      "player_detected": true,
      "detection_rate": 0.94,
      "average_detection_confidence": 0.86,
      "tracking_duration_seconds": 30.1,
      "estimated_distance_pixels": 8423.5,
      "average_speed_pixels_per_second": 279.9,
      "movement_consistency": 0.62,
      "direction_changes": 7,
      "activity_time_seconds": 21.3,
      "confidence_level": "High"
    },
    "key_frames": [
      {"label": "beginning", "frame_index": 0, "timestamp_seconds": 0.0, "image_path": "data/outputs/a1b2c3d4e5f6/keyframe_beginning.jpg"}
    ],
    "visualizations": {
      "trajectory_image": "data/outputs/a1b2c3d4e5f6/trajectory.jpg",
      "heatmap_image": "data/outputs/a1b2c3d4e5f6/heatmap.jpg",
      "annotated_video": "data/outputs/a1b2c3d4e5f6/annotated.mp4"
    },
    "observations": ["..."],
    "recommendations": ["..."],
    "limitations": ["..."]
  },
  "error": null
}
```

While processing, `status` will be `"pending"` or `"processing"` and `report` will be `null`.
On failure, `status` is `"failed"` and `error` contains a human-readable message.

### `GET /health`
```json
{ "status": "ok", "model_loaded": true }
```

## 7. Output Folder

Each analysis writes to `data/outputs/{analysis_id}/`:
- `keyframe_beginning.jpg`, `keyframe_middle.jpg`, `keyframe_end.jpg`, `keyframe_max_movement.jpg`
- `trajectory.jpg` — 2D path of the player across the clip
- `heatmap.jpg` — blurred occupancy heatmap of visited positions
- `annotated.mp4` — original video with the tracked player's bounding box drawn

Uploaded source videos are saved under `data/uploads/{analysis_id}.{ext}`.

## 8. Testing

```bash
pytest
```

Tests mock `ultralytics.YOLO`, so they run without downloading model weights, a GPU, or network
access. They cover video validation, detection parsing, movement metric calculations, report
generation, and the API contract (including validation errors and the pending → terminal status
lifecycle).

## 9. Limitations

- Distance/speed are **pixel-space approximations** — there is no camera calibration, so they
  are not in real-world units (meters, km/h).
- The "main player" is chosen heuristically (the track id observed in the most frames). If the
  subject leaves frame and re-enters, they may be assigned a new track id and could be missed.
- No passing accuracy, decision-making, tactical understanding, or scouting scores are computed —
  these require specialized datasets and models, out of scope for this MVP.
- Assumes good video quality, limited camera movement, and a single dominant subject in a
  20–60 second clip.

## 10. Future Extensibility

The architecture is designed so new modules can be added alongside the existing ones without
restructuring:

- Ball detection & possession tracking
- Pose estimation (for technique-level metrics)
- Action recognition (pass, shot, sprint detection)
- ML-based performance scoring / an AI coach layer
- Persistent job storage (Postgres) + task queue (Celery/RQ) for multi-worker scaling
- Re-identification to handle players leaving/re-entering frame

Each would plug in as its own service module (mirroring `detection/`, `tracking/`,
`analysis/`) and feed into `report_generator.py`, without changing the pipeline's shape.
