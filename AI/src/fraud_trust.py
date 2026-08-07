"""Fraud detection & trust score (PRD Section 5.2).

Flags likely-manipulated or reused videos before they consume GPU time or influence a
scout's decision. Combines three explainable signals into `trustScore` (0-1), matching
the `trustScore` field of the backend<->AI contract (PRD Section 11.2). Deliberately a
documented weighted average, not a black-box model, so the score stays explainable.

Deepfake-specific detection (a trained classifier) is out of MVP scope per the PRD —
documented here as a Production V1 backlog item, not implemented.
"""

import json
import subprocess
from dataclasses import dataclass, field
from typing import Protocol

import cv2
import numpy as np

# Weights are intentionally simple and adjustable by the team, not learned.
WEIGHT_ENCODING = 0.3
WEIGHT_FRAME_TIMING = 0.3
WEIGHT_DUPLICATE = 0.4

FRAME_INTERVAL_STD_THRESHOLD_MS = 15.0  # deviation from expected interval that looks manipulated
DUPLICATE_HASH_DISTANCE_THRESHOLD = 8  # imagehash Hamming distance below which we call it a duplicate
SAMPLE_FRAME_COUNT = 5


class HashIndex(Protocol):
    """Storage of previously-processed videos' perceptual hashes.

    The MVP implementation is a Postgres table per PRD 5.2 step 40; this Protocol lets
    the fraud check be tested/used without a DB wired up yet — pass any object with a
    matching `find_closest` method (e.g. a Postgres-backed repository).
    """

    def find_closest(self, phash: "object") -> int | None:
        """Return the Hamming distance to the closest previously-stored hash, or None if empty."""
        ...


class InMemoryHashIndex:
    """Default HashIndex for local testing — not durable, just unblocks development."""

    def __init__(self) -> None:
        self._hashes: list[object] = []

    def find_closest(self, phash: object) -> int | None:
        if not self._hashes:
            return None
        return min(phash - stored for stored in self._hashes)

    def add(self, phash: object) -> None:
        self._hashes.append(phash)


@dataclass
class TrustAssessment:
    trust_score: float  # 0-1, feeds `trustScore` in the AI->backend contract
    encoding_signal: float  # 0-1, 1 = clean
    frame_timing_signal: float  # 0-1, 1 = clean
    duplicate_signal: float  # 0-1, 1 = clean (no close match found)
    notes: list[str] = field(default_factory=list)


def _probe_encoding_signal(video_path: str) -> tuple[float, list[str]]:
    """PRD 5.2 step 38: parse ffprobe output for re-encoding signatures."""
    notes: list[str] = []
    try:
        result = subprocess.run(
            ["ffprobe", "-v", "quiet", "-print_format", "json", "-show_format", "-show_streams", video_path],
            capture_output=True,
            text=True,
            timeout=30,
            check=True,
        )
    except (subprocess.CalledProcessError, FileNotFoundError, subprocess.TimeoutExpired) as exc:
        notes.append(f"ffprobe unavailable/failed ({exc}) — encoding signal skipped")
        return 1.0, notes

    data = json.loads(result.stdout)
    video_streams = [s for s in data.get("streams", []) if s.get("codec_type") == "video"]

    encoder_tags = {s.get("tags", {}).get("encoder") for s in video_streams if s.get("tags", {}).get("encoder")}
    signal = 1.0
    if len(encoder_tags) > 1:
        signal -= 0.5
        notes.append(f"multiple encoder tags found across streams: {encoder_tags}")
    if len(video_streams) > 1:
        signal -= 0.3
        notes.append(f"{len(video_streams)} video streams present (expected 1)")
    return max(0.0, signal), notes


def _frame_timing_signal(video_path: str) -> tuple[float, list[str]]:
    """PRD 5.2 step 39: standard deviation of frame intervals vs. declared FPS."""
    capture = cv2.VideoCapture(video_path)
    if not capture.isOpened():
        return 1.0, ["could not open video for frame-timing check"]

    declared_fps = capture.get(cv2.CAP_PROP_FPS) or 0.0
    timestamps: list[float] = []
    while True:
        ok, _ = capture.read()
        if not ok:
            break
        timestamps.append(capture.get(cv2.CAP_PROP_POS_MSEC))
    capture.release()

    if len(timestamps) < 3 or declared_fps <= 0:
        return 1.0, ["insufficient frames/fps metadata for frame-timing check"]

    intervals = np.diff(timestamps)
    expected_interval_ms = 1000.0 / declared_fps
    deviation = float(np.std(intervals - expected_interval_ms))

    notes: list[str] = []
    signal = 1.0
    if deviation > FRAME_INTERVAL_STD_THRESHOLD_MS:
        signal = max(0.0, 1.0 - (deviation / (FRAME_INTERVAL_STD_THRESHOLD_MS * 4)))
        notes.append(f"frame interval std dev {deviation:.1f}ms suggests possible speed manipulation")
    return signal, notes


def _duplicate_signal(video_path: str, hash_index: HashIndex) -> tuple[float, list[str], object | None]:
    """PRD 5.2 step 40: perceptual hash against previously-processed videos."""
    try:
        import imagehash
        from PIL import Image
    except ImportError:
        return 1.0, ["imagehash/Pillow not installed — duplicate check skipped"], None

    capture = cv2.VideoCapture(video_path)
    if not capture.isOpened():
        return 1.0, ["could not open video for duplicate check"], None

    frame_count = int(capture.get(cv2.CAP_PROP_FRAME_COUNT))
    hashes = []
    if frame_count > 0:
        for i in range(SAMPLE_FRAME_COUNT):
            capture.set(cv2.CAP_PROP_POS_FRAMES, int(i * frame_count / SAMPLE_FRAME_COUNT))
            ok, frame = capture.read()
            if ok:
                rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                hashes.append(imagehash.phash(Image.fromarray(rgb)))
    capture.release()

    if not hashes:
        return 1.0, ["no frames sampled for duplicate check"], None

    # Combine sampled per-frame hashes into one representative hash for storage/lookup.
    representative = hashes[len(hashes) // 2]
    closest_distance = hash_index.find_closest(representative)

    notes: list[str] = []
    if closest_distance is None:
        return 1.0, notes, representative

    signal = 1.0
    if closest_distance <= DUPLICATE_HASH_DISTANCE_THRESHOLD:
        signal = max(0.0, closest_distance / DUPLICATE_HASH_DISTANCE_THRESHOLD)
        notes.append(f"closest known hash at distance {closest_distance} (threshold {DUPLICATE_HASH_DISTANCE_THRESHOLD})")
    return signal, notes, representative


def assess_trust(video_path: str, hash_index: HashIndex | None = None) -> TrustAssessment:
    """Compute an explainable trustScore for an uploaded video (PRD 5.2 step 41)."""
    hash_index = hash_index or InMemoryHashIndex()

    encoding_signal, encoding_notes = _probe_encoding_signal(video_path)
    timing_signal, timing_notes = _frame_timing_signal(video_path)
    duplicate_signal, duplicate_notes, representative_hash = _duplicate_signal(video_path, hash_index)

    trust_score = (
        WEIGHT_ENCODING * encoding_signal
        + WEIGHT_FRAME_TIMING * timing_signal
        + WEIGHT_DUPLICATE * duplicate_signal
    )

    if representative_hash is not None and isinstance(hash_index, InMemoryHashIndex):
        hash_index.add(representative_hash)

    return TrustAssessment(
        trust_score=round(trust_score, 4),
        encoding_signal=encoding_signal,
        frame_timing_signal=timing_signal,
        duplicate_signal=duplicate_signal,
        notes=[*encoding_notes, *timing_notes, *duplicate_notes],
    )
