# Football Performance Analysis - Deliverables

## 0. Environment constraint that shaped this build (read this first)

This sandbox has **no internet access** and, at the start, had **no ML
libraries** (`pip install` fails for everything - confirmed by testing
`ultralytics`, `torch`, `fastapi`). Only `opencv-python`, `numpy`, and
`scipy` were pre-installed. There was also **no existing repository** to
inspect/reuse (the spec's section 18/20 instructions to "inspect the
existing repo" and "reuse existing components" - there was nothing there).

So this is a **new, standalone MVP**, and detection uses classical OpenCV
computer vision (HOG pedestrian detector + Hough-circle ball detector)
rather than a trained model like YOLO. This is a real, working baseline -
not a stub - but it is meaningfully weaker than a model trained on
football footage. That tradeoff, and what it means for each metric, is
documented throughout instead of hidden. Section 8 explains the upgrade
path.

---

## 1. Files created

```
football_performance/
  core/
    __init__.py
    models.py                 # dataclasses: VideoProfile, FootballEvent, MetricResult, FootballPerformanceReport
    video_inspector.py        # probes duration/fps/resolution/camera movement/ball & player visibility
    detection.py               # PersonDetector (HOG), BallDetector (Hough circles)
    tracking.py                 # PlayerTracker (IoU), BallTracker (nearest-neighbor + speed gate)
    events.py                    # FootballEventDetector - possession/pass/dribble/shot/loss heuristics
    metrics.py                    # per-metric scoring, each gated by evidence thresholds -> value or null
    scoring.py                     # compute_overall_score - documented weighted combination
    strengths_weaknesses.py        # derive_strengths_weaknesses - threshold + confidence based
    recommendations.py             # generate_recommendations - evidence-specific advice text
    position.py                    # infer_position - returns "Unknown" (see Known limitations)
    pipeline.py                    # analyze_video() - orchestrates the full flow end-to-end
  api.py                         # FastAPI endpoint (POST /analyze/football-performance)
  cli.py                          # python cli.py <video path> -> prints JSON report (used for testing here)
  requirements.txt
  test/
    make_synthetic_video.py     # generates a synthetic clip (not real football) for smoke-testing
    test_logic.py                # drives tracking/events/metrics directly with synthetic detections
    synthetic_match.mp4          # generated test clip
    synthetic_output.json        # actual pipeline output on that clip
  README.md                      # this file
```

## 2. Architecture

```
Video
  -> Video Inspector          (duration, fps, resolution, camera movement,
                                ball/player visibility, pitch context)
  -> Player/Ball Detection     (HOG people detector, Hough-circle ball detector)
  -> Tracking                  (IoU player tracker, nearest-neighbor ball tracker)
  -> Football Event Detection  (possession/reception/release/pass/dribble/shot/loss,
                                 conservative geometric triggers)
  -> Football Metrics          (each metric independently evidence-gated -> value or null)
  -> Performance Scoring       (documented weighted overall_score)
  -> Strengths / Weaknesses    (threshold + confidence based, from real metrics only)
  -> Training Recommendations  (templated on the specific weak metric's own evidence numbers)
  -> FootballPerformanceReport (single JSON-serializable object)
```

Every stage is a separate, independently testable module (`core/*.py`) so
a real detector (e.g. YOLO) can later replace `detection.py` without
touching anything downstream - `tracking.py`, `events.py`, `metrics.py`
etc. only depend on the `Detection` interface, not on how detections were
produced.

## 3. Models used

- **Person detection:** OpenCV `HOGDescriptor` + `getDefaultPeopleDetector()`
  (classical HOG+SVM pedestrian detector, no training data or GPU
  required). No football-specific or learned model is used, per the
  environment constraint in section 0.
- **Ball detection:** `cv2.HoughCircles` on blurred grayscale frames,
  filtered by expected radius and (when no prior position exists) patch
  brightness. Also classical CV, no learned model.
- **Tracking:** hand-written greedy IoU tracker for players; nearest-neighbor
  + max-speed-gate tracker for the ball. No Kalman filter / ByteTrack /
  DeepSORT (would need `supervision`/`torch`, unavailable here).

No LLM or generative model is used anywhere in the scoring path - all
scores are arithmetic over detected geometry/events. Only the
recommendation *text* is templated natural language, filled in with the
real evidence numbers for that report (see `recommendations.py`).

## 4. New dependencies

Core pipeline (tested in this sandbox): `opencv-python`, `numpy`, `scipy`.
API layer only (not installable/testable here - no internet access; the
API code follows standard FastAPI conventions and should run as-is in a
normal environment): `fastapi`, `uvicorn`, `python-multipart`.
See `requirements.txt` for the full list, including the optional future
upgrade path (`ultralytics`, `torch`, `supervision`).

## 5. API endpoint / request format

```
POST /analyze/football-performance
Content-Type: multipart/form-data
  video: <file>   (.mp4/.mov/.avi/.mkv)

-> 200 OK, JSON body: see FootballPerformanceReport.to_dict() in core/models.py
-> 400 if the file extension isn't supported
-> 500 with an error detail if analysis raises
```

This mirrors the structure given in the spec's section 19
(`analysis_id`, `status`, `football_performance.{player,scores,strengths,
weaknesses,recommendations,events,evidence,analysis_quality,limitations}`),
with one addition: `video_profile`, so the caller can see exactly what the
Video Inspector determined about the input before scoring even started.

The core pipeline (`core/pipeline.py:analyze_video`) has zero dependency
on FastAPI, so it's directly callable from `cli.py`, `api.py`, or a
future different web framework unchanged.

## 6. Example generated JSON

Two are included in `test/`, for two different reasons:

**(a) `test/synthetic_output.json`** - the actual output of running the
full pipeline (`cli.py`) on a generated video (green background, two
solid-color rectangles as "players", a white circle as the "ball";
`test/make_synthetic_video.py`). This is **not real football footage**,
and the HOG detector correctly does not recognize plain rectangles as
people - so the pipeline correctly reports `analysis_quality:
"insufficient"` with explicit limitations, rather than fabricating scores
from a video where nothing was actually detected:

```json
{
  "analysis_id": "09ee0e55-...",
  "status": "completed",
  "football_performance": {
    "player": { "position": "Unknown" },
    "scores": { "overall_score": null, "...": null },
    "strengths": [], "weaknesses": [], "recommendations": [],
    "analysis_quality": "insufficient",
    "limitations": [
      "No player could be reliably detected in sampled frames.",
      "Insufficient pitch/field context ...",
      "No player could be reliably detected; the video is not suitable for football performance evaluation."
    ],
    "video_profile": { "ball_visible": true, "ball_visibility_ratio": 1.0,
                        "primary_player_visible": false, "other_players_detected": 0, "...": "..." }
  }
}
```

This is the system working as intended (section 17: "prefer honest
incomplete analysis over fake complete analysis") - it is just being
demonstrated against an unrealistic input, because no real football video
was available to upload in this sandbox.

**(b) `test/test_logic.py` output** - to actually exercise the scoring
logic (which the weak synthetic-video detector never reaches), this test
feeds hand-built `Detection` sequences straight into the tracker/event
detector/metrics engine, simulating two players completing 9 of 11 passes
between them. Result (full detail printed by the test, condensed here):

```json
{
  "scores": {
    "overall_score": 64.0,
    "passing_accuracy": 81.8,
    "ball_control": 81.8,
    "movement_efficiency": 60.0,
    "position_score": null,
    "positioning_score": null,
    "defensive_actions": null,
    "attacking_impact": 36,
    "decision_making": null
  },
  "strengths": ["Passing", "Ball Control"],
  "weaknesses": ["Movement Efficiency"],
  "recommendations": [
    "Movement efficiency scored 60.0/100 (movement smoothness 0.33). Add short interval sprints with direction changes (e.g. 5-10m shuttle runs) to build more purposeful, less erratic off-ball movement, and work on scanning before making a run so movement is directed rather than reactive."
  ],
  "evidence": {
    "passing_accuracy": {"pass_attempts": 11, "completed_passes": 9},
    "ball_control": {"touches": 11, "uncontrolled_losses": 1, "dribbles": 0}
  }
}
```

`passing_accuracy = 81.8` correctly reflects 9/11 completed pass attempts
in the constructed scenario (2 were deliberately made to go astray) - the
event/metrics logic is doing real arithmetic on real event counts, not
returning canned numbers.

## 7. How scores are calculated

- **passing_accuracy** = 100 × completed_passes / pass_attempts. Requires
  >=2 players tracked (to know who received it) and >=3 pass attempts;
  otherwise `null`.
- **ball_control** = 90 × (touches - uncontrolled_losses)/touches, +up to
  10 bonus for sustained dribbling. Requires ball visible and >=3
  possession events; otherwise `null`.
- **movement_efficiency** = 60% movement smoothness (inverse of
  step-distance coefficient-of-variation - penalizes erratic/jittery
  motion) + 40% "purposefulness" (scaled by how many ball-involvement
  events occurred during tracking). Requires >=15 tracked frames and
  static/moderate camera movement (movement can't be trusted against
  a swinging camera without field calibration); otherwise `null`.
- **attacking_impact** = 18×shot_attempt_candidates + 6×dribbles +
  4×completed_passes, capped at 100. Requires at least one qualifying
  event; otherwise `null`. Note: "shot_attempt" is a high-ball-speed
  release proxy, not a confirmed shot on goal (no goal detection exists).
- **positioning_score / position_score** - always `null` in this MVP.
  Computing these honestly needs field calibration (homography from pixel
  coordinates to real pitch coordinates), which was out of scope for an
  MVP with the tools available here. Returning a number without that
  would be exactly the "fake intelligence" the spec forbids.
- **defensive_actions** - always `null` in this MVP. A real
  tackle/interception classifier needs to tell teammate from opponent
  (team/kit classification), which isn't implemented.
- **decision_making** - always `null` in this MVP. The event detector can
  tell *that* a player was on the ball, but not what options (open
  teammates, space, pressure) were actually available at that instant -
  judging the decision without that context would be guessing.
- **overall_score** = weighted average of 4 dimensions (technical 0.35,
  tactical 0.30, physical 0.15, contribution 0.20; see `scoring.py`
  docstring for the full breakdown), renormalized over whichever
  dimensions actually have data. Requires >=2 individual metrics
  available; otherwise `null`.

All thresholds above are named constants in `metrics.py`/`scoring.py`/
`strengths_weaknesses.py`, not buried magic numbers.

## 8. How strengths/weaknesses are selected

Only metrics with `value is not None` AND `confidence >= 0.5` are
eligible. Strengths = eligible metrics >= 75, ranked highest-first, top 3.
Weaknesses = eligible metrics <= 65, ranked lowest-first, top 3. If
nothing clears a threshold, the list is empty - never padded.

## 9. How recommendations are generated

Each weakness label is mapped to a template (`recommendations.py`) that
is filled in with **that report's own evidence numbers** (e.g. "9/11
passes completed", "1 uncontrolled loss out of 11 touches") - two
players with the same weak label but different underlying stats get
differently worded advice, and a metric with `value=None` (unavailable,
not "weak") never generates a recommendation, since it was never eligible
to become a weakness in the first place.

## 10. Test results

- **Full pipeline, real code path, synthetic video** (`test/synthetic_output.json`):
  ran end-to-end in 2.8s on an 8s/200-frame clip, no crashes, correctly
  produced `analysis_quality: "insufficient"` with itemized limitations
  because the classical HOG detector (correctly) did not recognize plain
  rectangles as people.
- **Direct logic test** (`test/test_logic.py`): verified the
  tracking -> event -> metrics -> scoring -> strengths/weaknesses ->
  recommendations chain against a hand-built 11-pass scenario with 2
  deliberately failed passes. Result: `passing_accuracy=81.8` (9/11,
  correct), `overall_score=64.0`, `strengths=["Passing","Ball Control"]`,
  `weaknesses=["Movement Efficiency"]`, with a recommendation citing the
  actual smoothness/score numbers. Assertions pass.
- **Not done:** validation against a real broadcast/training football
  video, because none was available to upload in this sandbox. This is
  the single biggest gap in these test results and should be the first
  thing done before trusting this pipeline's output on real footage.

## 11. Known limitations

- No network access in this sandbox meant no YOLO/torch/fastapi could be
  installed; person/ball detection uses classical CV (HOG, Hough
  circles), which is meaningfully weaker than a trained model, especially
  for: players at broadcast distance, occlusion, dynamic sport poses
  (sprinting/kicking/tackling), and the ball in flight or near the boundary
  lines.
- No field calibration (homography) - so real-world distances/positions
  cannot be computed, which is why `positioning_score`, `position_score`,
  and `decision_making` are always `null`.
- No team/kit classification - so `defensive_actions` (which requires
  distinguishing an opponent from a teammate) is always `null`.
- No goal/frame-of-play detection - so `attacking_impact`'s shot signal is
  a speed proxy, not a confirmed shot on target.
- The event detector is purely rule-based on track geometry; it has no
  learned model and its thresholds (`events.py`) are documented defaults
  that have not been tuned against labeled real match data.
- Never tested against real football footage in this session (see
  section 10).

## 12. What would be required for higher accuracy

1. **A trained detector** (e.g. YOLOv8/YOLOv11 fine-tuned on football
   footage, or an off-the-shelf sports-detection model) in place of
   `detection.py`'s HOG/Hough baseline - this is the highest-leverage
   single change, since almost every metric's confidence is currently
   capped by detection quality.
2. **A proper multi-object tracker** (ByteTrack/DeepSORT via the
   `supervision` package) to keep player identity stable through
   occlusion, replacing the greedy IoU tracker.
3. **Field calibration (homography)** from camera pixels to real pitch
   coordinates - unlocks `positioning_score`, `position_score`, real-world
   distance/speed for `movement_efficiency`, and a real tactical model for
   `decision_making`.
4. **Team/kit classification** (jersey color clustering or a small
   classifier) - unlocks reliable `defensive_actions`.
5. **Pose estimation** (e.g. a lightweight pose model) - would improve
   first-touch/ball-control detection and let `movement_efficiency`
   reflect actual biomechanics (stride, acceleration) instead of the
   current bbox-centroid proxy.
6. **Validation against labeled real match clips** to tune the event
   thresholds in `events.py` and the metric-eligibility thresholds in
   `metrics.py`, which are currently reasonable defaults, not
   empirically fit values.
