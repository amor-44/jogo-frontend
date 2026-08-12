"""Player tracking with Re-ID re-acquisition (PRD Section 5.4).

Keeps following the same locked player for the whole match, including after they're
temporarily hidden or leave frame. This is the module the PRD calls out as the core of
the AI track (3-4 weeks alone) — specifically because of the Re-ID re-acquisition half,
which is what's genuinely missing from the team's other tracker implementation
(`ai-video-analysis/app/tracking/tracker.py`, which tracks a single "most observed"
track for a whole clip but explicitly does not attempt re-identification after a track
is lost — see its own docstring). This module is meant to either replace that tracker or
donate its re-acquisition logic into it once the team consolidates the two AI folders.

`supervision` (ByteTrack) and `torchreid` (OSNet Re-ID embeddings) are imported lazily so
this module can at least be read/type-checked without the heavier deps installed.
"""

from dataclasses import dataclass

import numpy as np

from detection import BoundingBox, _get_model

REACQUISITION_FRAME_GAP = 15  # PRD 5.4 step 51: re-attempt Re-ID after this many missed frames
REACQUISITION_SIMILARITY_THRESHOLD = 0.75  # PRD 5.4 step 52


@dataclass
class TrackedFrame:
    frame_index: int
    bounding_box: BoundingBox | None  # None when the player is not visible this frame
    was_reacquired: bool = False


def _iou(a: BoundingBox, b: tuple[float, float, float, float]) -> float:
    ax1, ay1, ax2, ay2 = a.x1, a.y1, a.x2, a.y2
    bx1, by1, bx2, by2 = b
    inter_x1, inter_y1 = max(ax1, bx1), max(ay1, by1)
    inter_x2, inter_y2 = min(ax2, bx2), min(ay2, by2)
    inter_area = max(0.0, inter_x2 - inter_x1) * max(0.0, inter_y2 - inter_y1)
    union_area = a.area + max(0.0, bx2 - bx1) * max(0.0, by2 - by1) - inter_area
    return inter_area / union_area if union_area > 0 else 0.0


class PlayerTracker:
    """Wraps ByteTrack + OSNet Re-ID to follow a single user-selected player across a video.

    Usage mirrors PRD 5.4's step-by-step:
        tracker = PlayerTracker()
        tracker.lock_onto(first_frame, tapped_box)
        for frame in remaining_frames:
            result = tracker.update(frame)
    """

    def __init__(self) -> None:
        self._byte_tracker = self._make_byte_tracker()
        self._reid_model = self._make_reid_model()
        self._locked_track_id: int | None = None
        self._signature_embedding: np.ndarray | None = None
        self._missed_frames = 0
        self._frame_index = 0

    @staticmethod
    def _make_byte_tracker():
        try:
            import supervision as sv
        except ImportError:
            return None
        return sv.ByteTrack()

    @staticmethod
    def _make_reid_model():
        try:
            import torchreid
        except ImportError:
            return None
        return torchreid.utils.FeatureExtractor(model_name="osnet_x1_0", model_path="", device="cpu")

    def _detect(self, frame: np.ndarray):
        """Run YOLOv8 + ByteTrack, returning supervision Detections with track_id set."""
        import supervision as sv

        model = _get_model()
        results = model.predict(frame, classes=[0], verbose=False)[0]
        detections = sv.Detections.from_ultralytics(results)
        return self._byte_tracker.update_with_detections(detections)

    def _embed(self, frame: np.ndarray, box: BoundingBox) -> np.ndarray | None:
        if self._reid_model is None:
            return None
        x1, y1, x2, y2 = (int(v) for v in (box.x1, box.y1, box.x2, box.y2))
        crop = frame[max(0, y1):y2, max(0, x1):x2]
        if crop.size == 0:
            return None
        features = self._reid_model([crop])
        return np.asarray(features[0])

    def lock_onto(self, frame: np.ndarray, tapped_box: tuple[float, float, float, float]) -> TrackedFrame:
        """PRD 5.4 step 49: record which track ID corresponds to the box the user tapped."""
        if self._byte_tracker is None:
            raise RuntimeError("supervision is not installed — install it to use PlayerTracker")

        detections = self._detect(frame)
        best_iou, best_index = 0.0, None
        for i, xyxy in enumerate(detections.xyxy):
            box = BoundingBox(*xyxy, confidence=float(detections.confidence[i]))
            iou = _iou(box, tapped_box)
            if iou > best_iou:
                best_iou, best_index = iou, i

        if best_index is None:
            self._frame_index += 1
            return TrackedFrame(self._frame_index - 1, None)

        self._locked_track_id = int(detections.tracker_id[best_index])
        box = BoundingBox(*detections.xyxy[best_index], confidence=float(detections.confidence[best_index]))
        self._signature_embedding = self._embed(frame, box)
        self._frame_index += 1
        return TrackedFrame(self._frame_index - 1, box)

    def update(self, frame: np.ndarray) -> TrackedFrame:
        """PRD 5.4 steps 50-52: keep the locked track, or attempt Re-ID re-acquisition."""
        detections = self._detect(frame)
        frame_index = self._frame_index
        self._frame_index += 1

        for i, track_id in enumerate(detections.tracker_id):
            if int(track_id) == self._locked_track_id:
                self._missed_frames = 0
                box = BoundingBox(*detections.xyxy[i], confidence=float(detections.confidence[i]))
                return TrackedFrame(frame_index, box)

        self._missed_frames += 1
        if self._missed_frames <= REACQUISITION_FRAME_GAP or self._signature_embedding is None:
            return TrackedFrame(frame_index, None)

        # PRD 5.4 steps 51-52: candidate re-acquisition via Re-ID embedding similarity.
        best_similarity, best_index = 0.0, None
        for i, xyxy in enumerate(detections.xyxy):
            box = BoundingBox(*xyxy, confidence=float(detections.confidence[i]))
            embedding = self._embed(frame, box)
            if embedding is None:
                continue
            similarity = float(
                np.dot(embedding, self._signature_embedding)
                / (np.linalg.norm(embedding) * np.linalg.norm(self._signature_embedding) + 1e-8)
            )
            if similarity > best_similarity:
                best_similarity, best_index = similarity, i

        if best_index is not None and best_similarity > REACQUISITION_SIMILARITY_THRESHOLD:
            self._locked_track_id = int(detections.tracker_id[best_index])
            self._missed_frames = 0
            box = BoundingBox(*detections.xyxy[best_index], confidence=float(detections.confidence[best_index]))
            return TrackedFrame(frame_index, box, was_reacquired=True)

        # No qualifying candidate — mark the segment as "player not visible" rather than guessing.
        return TrackedFrame(frame_index, None)
