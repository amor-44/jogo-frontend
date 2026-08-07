# Jogo — AI Video Analysis Service (MVP)

A standalone backend service that analyzes short football skill/training clips: it detects and
tracks the main player, computes simple movement metrics, and returns a structured performance
report as JSON.

This is deliberately an **MVP**, scoped to what can be reliably extracted from a short,
single-subject clip — not a research system for understanding a full professional match.

> This service is independent from the Jogo chatbot backend and shares no code with it.

---

## Architecture

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



## Processing Pipeline

```
Upload video → Validate → Save → Extract metadata (fps/duration/resolution)
   → YOLO detection + ByteTrack tracking (per frame)
   → Pick the "main" track (heuristic: most-observed track id)
   → Movement analysis (distance, speed, consistency, direction changes...)
   → Extract key frames (beginning/middle/end/max-movement) + trajectory/heatmap/annotated video
   → Build structured JSON report
   → Store result, pollable via GET /analysis/{id}
```


- Interactive API docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/health`

## API Documentation

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
  "analysis_id": "f119c65bc4e2",
  "status": "completed",
  "report": {
    "analysis_id": "f119c65bc4e2",
    "video_filename": "f119c65bc4e2.mp4",
    "generated_at": "2026-08-07T00:00:20.247924Z",
    "metrics": {
      "video_duration_seconds": 9.03,
      "frames_processed": 271,
      "fps": 30.02,
      "resolution": "1280x720",
      "player_detected": true,
      "detection_rate": 1,
      "average_detection_confidence": 0.914,
      "tracking_duration_seconds": 9,
      "estimated_distance_pixels": 2956.17,
      "average_speed_pixels_per_second": 328.63,
      "movement_consistency": 0.188,
      "direction_changes": 41,
      "activity_time_seconds": 8.93,
      "confidence_level": "High"
    },
    "key_frames": [
      {
        "label": "beginning",
        "frame_index": 0,
        "timestamp_seconds": 0,
        "image_path": "data\\outputs\\f119c65bc4e2\\keyframe_beginning.jpg"
      },
      {
        "label": "middle",
        "frame_index": 135,
        "timestamp_seconds": 4.5,
        "image_path": "data\\outputs\\f119c65bc4e2\\keyframe_middle.jpg"
      },
      {
        "label": "end",
        "frame_index": 270,
        "timestamp_seconds": 9,
        "image_path": "data\\outputs\\f119c65bc4e2\\keyframe_end.jpg"
      },
      {
        "label": "max_movement",
        "frame_index": 163,
        "timestamp_seconds": 5.43,
        "image_path": "data\\outputs\\f119c65bc4e2\\keyframe_max_movement.jpg"
      }
    ],
    "visualizations": {
      "trajectory_image": "data\\outputs\\f119c65bc4e2\\trajectory.jpg",
      "annotated_video": "data\\outputs\\f119c65bc4e2\\annotated.mp4",
      "heatmap_image": "data\\outputs\\f119c65bc4e2\\heatmap.jpg"
    },
    "observations": [
      "The player was tracked for 9.0s out of a 9.03s video (detection rate: 100%).",
      "Estimated movement covered approximately 2956 pixels at an average speed of 329 px/s.",
      "41 notable direction change(s) were detected during tracking."
    ],
    "recommendations": [
      "Movement speed varied significantly across the clip; this may reflect drills with frequent stop-start actions rather than a tracking issue."
    ],
    "limitations": [
      "Distance and speed are pixel-based approximations, not calibrated to real-world units (no camera calibration is performed in this MVP).",
      "Metrics reflect movement only - not passing accuracy, decision-making, tactical understanding, or any form of scouting score.",
      "Analysis assumes a single dominant player subject in a short (<=60s), well-framed clip with limited camera movement."
    ]
  },
  "error": null
}
```

## Running

```bash
uvicorn app.main:app --reload --port 8000
```





