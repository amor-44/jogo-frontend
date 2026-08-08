"""Video quality assessment (PRD Section 5.1).

Estimates how usable a video is before running expensive models on it, and applies
cheap fixes (stabilization / upscaling) when they clearly help. The output feeds the
`qualityScore` field of the backend<->AI analysis contract (PRD Section 11.2).

Heavier optional dependencies (pyiqa for BRISQUE, vidstab for stabilization,
Real-ESRGAN for upscaling) are imported lazily so the cheap checks (blur, resolution,
shakiness) still work in environments where they aren't installed yet.
"""

from dataclasses import dataclass, field

import cv2
import numpy as np

BLUR_VARIANCE_THRESHOLD = 100.0  # below this, a sampled frame is considered blurry
LOW_RESOLUTION_HEIGHT = 480
SHAKINESS_DISPLACEMENT_THRESHOLD = 8.0  # px, mean optical-flow magnitude between samples
SAMPLE_FRAME_COUNT = 10


@dataclass
class QualityAssessment:
    quality_score: float  # 0-1, feeds `qualityScore` in the AI->backend contract
    average_blur_variance: float
    brisque_score: float | None  # 0-100, lower is better; None if pyiqa unavailable
    is_low_resolution: bool
    is_shaky: bool
    notes: list[str] = field(default_factory=list)


def _sample_frame_indices(frame_count: int, n: int = SAMPLE_FRAME_COUNT) -> list[int]:
    if frame_count <= 0:
        return []
    n = min(n, frame_count)
    return [int(i * frame_count / n) for i in range(n)]


def _blur_variance(frame: np.ndarray) -> float:
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    return float(cv2.Laplacian(gray, cv2.CV_64F).var())


def _brisque_score(frames: list[np.ndarray]) -> float | None:
    try:
        import pyiqa
        import torch
    except ImportError:
        return None

    metric = pyiqa.create_metric("brisque")
    scores = []
    for frame in frames:
        tensor = torch.from_numpy(frame[:, :, ::-1].copy()).permute(2, 0, 1).unsqueeze(0).float() / 255.0
        scores.append(float(metric(tensor).item()))
    return sum(scores) / len(scores) if scores else None


def _optical_flow_displacement(frames: list[np.ndarray]) -> float:
    if len(frames) < 2:
        return 0.0
    displacements = []
    prev_gray = cv2.cvtColor(frames[0], cv2.COLOR_BGR2GRAY)
    for frame in frames[1:]:
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        flow = cv2.calcOpticalFlowFarneback(prev_gray, gray, None, 0.5, 3, 15, 3, 5, 1.2, 0)
        magnitude = np.sqrt(flow[..., 0] ** 2 + flow[..., 1] ** 2)
        displacements.append(float(magnitude.mean()))
        prev_gray = gray
    return sum(displacements) / len(displacements)


def assess_video_quality(video_path: str) -> QualityAssessment:
    """Sample frames across the video and score how usable it is for the AI pipeline."""
    capture = cv2.VideoCapture(video_path)
    if not capture.isOpened():
        return QualityAssessment(
            quality_score=0.0,
            average_blur_variance=0.0,
            brisque_score=None,
            is_low_resolution=True,
            is_shaky=False,
            notes=["could not open video"],
        )

    frame_count = int(capture.get(cv2.CAP_PROP_FRAME_COUNT))
    height = int(capture.get(cv2.CAP_PROP_FRAME_HEIGHT))
    indices = set(_sample_frame_indices(frame_count))

    sampled_frames: list[np.ndarray] = []
    blur_scores: list[float] = []
    current_index = 0
    while True:
        ok, frame = capture.read()
        if not ok:
            break
        if current_index in indices:
            sampled_frames.append(frame)
            blur_scores.append(_blur_variance(frame))
        current_index += 1
    capture.release()

    notes: list[str] = []
    avg_blur = sum(blur_scores) / len(blur_scores) if blur_scores else 0.0
    is_low_res = height < LOW_RESOLUTION_HEIGHT
    is_shaky = _optical_flow_displacement(sampled_frames) > SHAKINESS_DISPLACEMENT_THRESHOLD
    brisque = _brisque_score(sampled_frames)

    if brisque is None:
        notes.append("pyiqa not installed — BRISQUE score unavailable, falling back to blur/resolution only")

    # Simple, explainable combination — not a black-box score (mirrors the trust-score
    # approach in Section 5.2): start at 1.0 and subtract for each detected issue.
    score = 1.0
    if avg_blur < BLUR_VARIANCE_THRESHOLD:
        score -= 0.3
        notes.append(f"blurry frames detected (avg Laplacian variance {avg_blur:.1f})")
    if is_low_res:
        score -= 0.2
        notes.append(f"low resolution input ({height}p)")
    if is_shaky:
        score -= 0.2
        notes.append("shaky footage detected via optical flow")
    if brisque is not None and brisque > 50:
        score -= 0.2
        notes.append(f"poor BRISQUE score ({brisque:.1f}/100, lower is better)")

    return QualityAssessment(
        quality_score=max(0.0, min(1.0, score)),
        average_blur_variance=avg_blur,
        brisque_score=brisque,
        is_low_resolution=is_low_res,
        is_shaky=is_shaky,
        notes=notes,
    )
