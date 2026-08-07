"""Pose estimation (PRD Section 5.5).

Extracts body keypoints (head, shoulders, knees, feet) for the locked player per frame,
feeding action recognition (5.7) and movement analysis. Takes a frame crop rather than
the full frame — both faster and more accurate, per PRD 5.5 step 54 — so this module is
independent of whichever tracker (this repo's or `ai-video-analysis/`'s) produces the
locked player's bounding box; it just needs `(frame, bounding_box)`.
"""

from dataclasses import dataclass

import mediapipe as mp
import numpy as np

VISIBILITY_THRESHOLD = 0.5

_mp_pose = mp.solutions.pose


@dataclass
class Keypoint:
    x: float  # pixel coords in the *original* (uncropped) frame
    y: float
    visibility: float


@dataclass
class PoseResult:
    keypoints: list[Keypoint | None]  # 33 entries, index = MediaPipe landmark id; None if below threshold
    landmark_names: list[str]


_LANDMARK_NAMES = [landmark.name for landmark in _mp_pose.PoseLandmark]

_pose_estimator: "mp.solutions.pose.Pose | None" = None


def _get_estimator() -> "mp.solutions.pose.Pose":
    global _pose_estimator
    if _pose_estimator is None:
        _pose_estimator = _mp_pose.Pose(model_complexity=1)
    return _pose_estimator


def estimate_pose(frame: np.ndarray, bounding_box: tuple[float, float, float, float]) -> PoseResult:
    """Run pose estimation on the locked player's crop (PRD 5.5 steps 53-57).

    `bounding_box` is (x1, y1, x2, y2) in the original frame's pixel coordinates.
    """
    x1, y1, x2, y2 = (int(v) for v in bounding_box)
    x1, y1 = max(0, x1), max(0, y1)
    x2, y2 = min(frame.shape[1], x2), min(frame.shape[0], y2)

    crop = frame[y1:y2, x1:x2]
    if crop.size == 0:
        return PoseResult(keypoints=[None] * len(_LANDMARK_NAMES), landmark_names=_LANDMARK_NAMES)

    rgb_crop = crop[:, :, ::-1]
    result = _get_estimator().process(rgb_crop)

    if result.pose_landmarks is None:
        return PoseResult(keypoints=[None] * len(_LANDMARK_NAMES), landmark_names=_LANDMARK_NAMES)

    crop_h, crop_w = crop.shape[:2]
    keypoints: list[Keypoint | None] = []
    for landmark in result.pose_landmarks.landmark:
        if landmark.visibility < VISIBILITY_THRESHOLD:
            # Discard low-confidence joints rather than reporting them as fact (PRD 5.5 step 57).
            keypoints.append(None)
            continue
        # Convert crop-normalized coords back to original-frame pixel coords (PRD 5.5 step 56).
        keypoints.append(
            Keypoint(
                x=x1 + landmark.x * crop_w,
                y=y1 + landmark.y * crop_h,
                visibility=landmark.visibility,
            )
        )

    return PoseResult(keypoints=keypoints, landmark_names=_LANDMARK_NAMES)
