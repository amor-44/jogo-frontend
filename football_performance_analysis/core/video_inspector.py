
from __future__ import annotations
import cv2
import numpy as np
from typing import List

from .models import VideoProfile
from .detection import PersonDetector, BallDetector

SAMPLE_FRAMES = 24  # number of frames sampled across the video for the profile


def _sample_frame_indices(frame_count: int, n: int) -> List[int]:
    if frame_count <= 0:
        return []
    n = min(n, frame_count)
    return sorted(set(int(i) for i in np.linspace(0, frame_count - 1, n)))


def inspect_video(path: str) -> VideoProfile:
    cap = cv2.VideoCapture(path)
    if not cap.isOpened():
        raise ValueError(f"Could not open video file: {path}")

    fps = cap.get(cv2.CAP_PROP_FPS) or 0.0
    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH) or 0)
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT) or 0)
    duration = frame_count / fps if fps > 0 else 0.0

    notes: List[str] = []

    indices = _sample_frame_indices(frame_count, SAMPLE_FRAMES)
    frames = []
    for idx in indices:
        cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
        ok, frame = cap.read()
        if ok:
            frames.append(frame)
    cap.release()

    if not frames:
        notes.append("Could not decode any frames from the video.")
        return VideoProfile(
            path=path, duration_sec=duration, width=width, height=height,
            fps=fps, frame_count=frame_count, camera_movement="unknown",
            camera_movement_score=None, ball_visible=False,
            ball_visibility_ratio=0.0, primary_player_visible=False,
            other_players_detected=0, pitch_context_available=False,
            notes=notes,
        )

    # --- Camera movement: mean optical flow magnitude between consecutive sampled frames ---
    flow_mags = []
    prev_gray = None
    for f in frames:
        small = cv2.resize(f, (320, int(320 * f.shape[0] / f.shape[1])))
        gray = cv2.cvtColor(small, cv2.COLOR_BGR2GRAY)
        if prev_gray is not None:
            flow = cv2.calcOpticalFlowFarneback(
                prev_gray, gray, None, 0.5, 2, 15, 2, 5, 1.2, 0
            )
            mag, _ = cv2.cartToPolar(flow[..., 0], flow[..., 1])
            flow_mags.append(float(np.mean(mag)))
        prev_gray = gray

    camera_movement_score = float(np.mean(flow_mags)) if flow_mags else None
    if camera_movement_score is None:
        camera_movement = "unknown"
    elif camera_movement_score < 0.5:
        camera_movement = "static"
    elif camera_movement_score < 2.0:
        camera_movement = "moderate"
    else:
        camera_movement = "high"

    # --- Player / ball visibility via detectors, sampled ---
    person_detector = PersonDetector()
    ball_detector = BallDetector()

    ball_hits = 0
    max_persons_seen = 0
    any_person_seen = False
    green_ratios = []

    for f in frames:
        persons = person_detector.detect(f)
        if persons:
            any_person_seen = True
            max_persons_seen = max(max_persons_seen, len(persons))
        ball = ball_detector.detect(f)
        if ball is not None:
            ball_hits += 1

        hsv = cv2.cvtColor(f, cv2.COLOR_BGR2HSV)
        # rough pitch/grass mask
        mask = cv2.inRange(hsv, (35, 40, 40), (85, 255, 255))
        green_ratios.append(float(np.mean(mask > 0)))

    ball_visibility_ratio = ball_hits / len(frames)
    ball_visible = ball_visibility_ratio >= 0.15

    mean_green_ratio = float(np.mean(green_ratios)) if green_ratios else 0.0
    # Pitch context: needs a decent amount of visible field AND more than one
    # player detected at some point (otherwise it's a tight crop on one player).
    pitch_context_available = mean_green_ratio > 0.25 and max_persons_seen >= 2

    if not any_person_seen:
        notes.append("No player could be reliably detected in sampled frames.")
    if not ball_visible:
        notes.append(
            f"Ball detected in only {ball_visibility_ratio:.0%} of sampled frames; "
            "ball-dependent metrics (passing, ball control, attacking) will be limited."
        )
    if not pitch_context_available:
        notes.append(
            "Insufficient pitch/field context (either the camera is tightly cropped "
            "around one player, or fewer than 2 players are ever visible together). "
            "Positioning, tactical, and decision-making analysis will be marked limited/unavailable."
        )
    if camera_movement == "high":
        notes.append(
            "High camera movement detected; movement-efficiency measurements will be "
            "less reliable since they cannot be fully separated from camera motion."
        )

    return VideoProfile(
        path=path,
        duration_sec=round(duration, 2),
        width=width,
        height=height,
        fps=round(fps, 2),
        frame_count=frame_count,
        camera_movement=camera_movement,
        camera_movement_score=round(camera_movement_score, 4) if camera_movement_score is not None else None,
        ball_visible=ball_visible,
        ball_visibility_ratio=round(ball_visibility_ratio, 3),
        primary_player_visible=any_person_seen,
        other_players_detected=max_persons_seen,
        pitch_context_available=pitch_context_available,
        notes=notes,
    )
