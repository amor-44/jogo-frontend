"""Pose estimation (PRD Section 5.5).

Extracts body keypoints (head, shoulders, knees, feet) for the locked player per frame,
feeding action recognition (5.7) and movement analysis. Takes a frame crop rather than
the full frame — both faster and more accurate, per PRD 5.5 step 54 — so this module is
independent of whichever tracker (this repo's or `ai-video-analysis/`'s) produces the
locked player's bounding box; it just needs `(frame, bounding_box)`.

Implementation note: the PRD's own instructions (`mp.solutions.pose.Pose(...)`) target
MediaPipe's legacy "solutions" API, which has been removed from current `mediapipe`
releases (verified against 0.10.30-0.10.35 and 1.0.0 — none expose `mp.solutions`
anymore). This uses MediaPipe's current Tasks API (`PoseLandmarker`) instead, which needs
a `.task` model file — downloaded lazily on first use rather than committed to the repo.
"""

import urllib.request
from dataclasses import dataclass
from pathlib import Path

import mediapipe as mp
import numpy as np
from mediapipe.tasks import python as mp_tasks
from mediapipe.tasks.python import vision as mp_vision

VISIBILITY_THRESHOLD = 0.5

MODEL_DIR = Path(__file__).resolve().parent.parent / "models"
MODEL_PATH = MODEL_DIR / "pose_landmarker_lite.task"
MODEL_URL = (
    "https://storage.googleapis.com/mediapipe-models/pose_landmarker/"
    "pose_landmarker_lite/float16/latest/pose_landmarker_lite.task"
)

# BlazePose GHUM 33-keypoint topology — stable across MediaPipe versions; hardcoded here
# since the enum that used to expose this (`mp.solutions.pose.PoseLandmark`) is gone.
LANDMARK_NAMES = [
    "NOSE", "LEFT_EYE_INNER", "LEFT_EYE", "LEFT_EYE_OUTER", "RIGHT_EYE_INNER", "RIGHT_EYE",
    "RIGHT_EYE_OUTER", "LEFT_EAR", "RIGHT_EAR", "MOUTH_LEFT", "MOUTH_RIGHT", "LEFT_SHOULDER",
    "RIGHT_SHOULDER", "LEFT_ELBOW", "RIGHT_ELBOW", "LEFT_WRIST", "RIGHT_WRIST", "LEFT_PINKY",
    "RIGHT_PINKY", "LEFT_INDEX", "RIGHT_INDEX", "LEFT_THUMB", "RIGHT_THUMB", "LEFT_HIP",
    "RIGHT_HIP", "LEFT_KNEE", "RIGHT_KNEE", "LEFT_ANKLE", "RIGHT_ANKLE", "LEFT_HEEL",
    "RIGHT_HEEL", "LEFT_FOOT_INDEX", "RIGHT_FOOT_INDEX",
]


@dataclass
class Keypoint:
    x: float  # pixel coords in the *original* (uncropped) frame
    y: float
    visibility: float


@dataclass
class PoseResult:
    keypoints: list[Keypoint | None]  # 33 entries, index matches LANDMARK_NAMES; None if below threshold
    landmark_names: list[str]


_landmarker: "mp_vision.PoseLandmarker | None" = None


def _ensure_model_downloaded() -> Path:
    if not MODEL_PATH.exists():
        MODEL_DIR.mkdir(parents=True, exist_ok=True)
        urllib.request.urlretrieve(MODEL_URL, MODEL_PATH)
    return MODEL_PATH


def _get_landmarker() -> "mp_vision.PoseLandmarker":
    global _landmarker
    if _landmarker is None:
        model_path = _ensure_model_downloaded()
        options = mp_vision.PoseLandmarkerOptions(
            base_options=mp_tasks.BaseOptions(model_asset_path=str(model_path)),
            running_mode=mp_vision.RunningMode.IMAGE,
            num_poses=1,
        )
        _landmarker = mp_vision.PoseLandmarker.create_from_options(options)
    return _landmarker


def estimate_pose(frame: np.ndarray, bounding_box: tuple[float, float, float, float]) -> PoseResult:
    """Run pose estimation on the locked player's crop (PRD 5.5 steps 53-57).

    `bounding_box` is (x1, y1, x2, y2) in the original frame's pixel coordinates.
    """
    x1, y1, x2, y2 = (int(v) for v in bounding_box)
    x1, y1 = max(0, x1), max(0, y1)
    x2, y2 = min(frame.shape[1], x2), min(frame.shape[0], y2)

    crop = frame[y1:y2, x1:x2]
    if crop.size == 0:
        return PoseResult(keypoints=[None] * len(LANDMARK_NAMES), landmark_names=LANDMARK_NAMES)

    rgb_crop = np.ascontiguousarray(crop[:, :, ::-1])
    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_crop)
    result = _get_landmarker().detect(mp_image)

    if not result.pose_landmarks:
        return PoseResult(keypoints=[None] * len(LANDMARK_NAMES), landmark_names=LANDMARK_NAMES)

    crop_h, crop_w = crop.shape[:2]
    landmarks = result.pose_landmarks[0]  # single pose (num_poses=1)
    keypoints: list[Keypoint | None] = []
    for landmark in landmarks:
        visibility = landmark.visibility if landmark.visibility is not None else 1.0
        if visibility < VISIBILITY_THRESHOLD:
            # Discard low-confidence joints rather than reporting them as fact (PRD 5.5 step 57).
            keypoints.append(None)
            continue
        # Convert crop-normalized coords back to original-frame pixel coords (PRD 5.5 step 56).
        keypoints.append(
            Keypoint(
                x=x1 + landmark.x * crop_w,
                y=y1 + landmark.y * crop_h,
                visibility=visibility,
            )
        )

    return PoseResult(keypoints=keypoints, landmark_names=LANDMARK_NAMES)
