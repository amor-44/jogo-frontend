
from __future__ import annotations
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple
from .detection import Detection


def _iou(a: Tuple[int, int, int, int], b: Tuple[int, int, int, int]) -> float:
    ax, ay, aw, ah = a
    bx, by, bw, bh = b
    ax2, ay2 = ax + aw, ay + ah
    bx2, by2 = bx + bw, by + bh
    ix1, iy1 = max(ax, bx), max(ay, by)
    ix2, iy2 = min(ax2, bx2), min(ay2, by2)
    iw, ih = max(0, ix2 - ix1), max(0, iy2 - iy1)
    inter = iw * ih
    union = aw * ah + bw * bh - inter
    return inter / union if union > 0 else 0.0


@dataclass
class Track:
    track_id: int
    history: List[Tuple[float, Detection]] = field(default_factory=list)  # (timestamp, detection)
    last_seen_ts: float = -1.0

    def append(self, ts: float, det: Detection):
        self.history.append((ts, det))
        self.last_seen_ts = ts


class PlayerTracker:
    def __init__(self, iou_threshold: float = 0.3, max_missed_sec: float = 1.0):
        self.iou_threshold = iou_threshold
        self.max_missed_sec = max_missed_sec
        self.tracks: Dict[int, Track] = {}
        self._next_id = 0

    def update(self, ts: float, detections: List[Detection]) -> Dict[int, Detection]:
        active = {
            tid: tr for tid, tr in self.tracks.items()
            if ts - tr.last_seen_ts <= self.max_missed_sec
        }
        unmatched = list(range(len(detections)))
        assignment: Dict[int, Detection] = {}

        for tid, tr in active.items():
            if not tr.history:
                continue
            last_det = tr.history[-1][1]
            best_idx, best_iou = None, 0.0
            for i in unmatched:
                score = _iou(last_det.bbox, detections[i].bbox)
                if score > best_iou:
                    best_iou, best_idx = score, i
            if best_idx is not None and best_iou >= self.iou_threshold:
                self.tracks[tid].append(ts, detections[best_idx])
                assignment[tid] = detections[best_idx]
                unmatched.remove(best_idx)

        for i in unmatched:
            tid = self._next_id
            self._next_id += 1
            tr = Track(track_id=tid)
            tr.append(ts, detections[i])
            self.tracks[tid] = tr
            assignment[tid] = detections[i]

        return assignment

    def primary_track_id(self) -> Optional[int]:
        """Longest-lived track = assumed primary analyzed player."""
        if not self.tracks:
            return None
        return max(self.tracks, key=lambda tid: len(self.tracks[tid].history))


class BallTracker:
    def __init__(self, max_speed_px_per_sec: float = 2500.0, max_gap_sec: float = 1.0):
        self.max_speed = max_speed_px_per_sec
        self.max_gap = max_gap_sec
        self.history: List[Tuple[float, Detection]] = []

    def update(self, ts: float, det: Optional[Detection]) -> Optional[Detection]:
        if det is None:
            return None
        if self.history:
            last_ts, last_det = self.history[-1]
            dt = ts - last_ts
            if dt > 0 and dt <= self.max_gap:
                dist = ((det.center[0] - last_det.center[0]) ** 2 +
                        (det.center[1] - last_det.center[1]) ** 2) ** 0.5
                speed = dist / dt
                if speed > self.max_speed:
                    return None  # implausible jump; likely a false-positive ball detection
        self.history.append((ts, det))
        return det

    def speed_at(self, idx: int) -> Optional[float]:
        if idx <= 0 or idx >= len(self.history):
            return None
        (t0, d0), (t1, d1) = self.history[idx - 1], self.history[idx]
        dt = t1 - t0
        if dt <= 0:
            return None
        dist = ((d1.center[0] - d0.center[0]) ** 2 + (d1.center[1] - d0.center[1]) ** 2) ** 0.5
        return dist / dt
