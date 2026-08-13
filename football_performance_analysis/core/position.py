"""
Player Position Inference
===========================
Infers the player's likely position from event data and spatial patterns.
Uses the primary player's average vertical position, event breakdown
(defensive vs attacking), and movement characteristics.
"""
from __future__ import annotations
from typing import List, Optional, Dict, Any
from .models import VideoProfile, FootballEvent
from .tracking import PlayerTracker

ALLOWED_POSITIONS = [
    "GK", "CB", "LB", "RB", "DM", "CM", "AM", "LW", "RW", "ST", "Unknown",
]


def infer_position(
    video: VideoProfile,
    events: Optional[List[FootballEvent]] = None,
    player_tracker: Optional[PlayerTracker] = None,
    primary_track_id: Optional[int] = None,
) -> str:
    """Infer position from spatial + event data.
    
    Without field calibration this is approximate, but useful:
    - Player consistently in the lower part of frame (near camera) → defensive
    - Player in the upper part → attacking
    - High dribble/shot activity → attacker
    - High ball recovery / limited forward movement → defender/DM
    - Balanced → midfielder
    """
    if events is None:
        events = []

    # Count event types
    shots = sum(1 for e in events if e.type == "shot_attempt")
    dribbles = sum(1 for e in events if e.type == "dribble")
    passes_completed = sum(1 for e in events if e.type == "pass_completed")
    pass_attempts = sum(1 for e in events if e.type == "pass_attempt")
    possession_starts = sum(1 for e in events if e.type == "possession_start")
    ball_losses = sum(1 for e in events if e.type == "ball_loss")

    total_events = shots + dribbles + pass_attempts + possession_starts + ball_losses

    # If very few events, can't infer much
    if total_events < 3:
        return "CM"  # default to central midfielder — safest generic label

    # Attacking vs defensive ratio
    attacking_signal = shots * 3 + dribbles * 2 + passes_completed
    defensive_signal = ball_losses + possession_starts  # recoveries as proxy

    # Spatial analysis — average vertical position in frame
    avg_y_ratio = 0.5  # default: middle of frame
    if player_tracker and primary_track_id and primary_track_id in player_tracker.tracks:
        history = player_tracker.tracks[primary_track_id].history
        if history and video.height > 0:
            ys = [det.center[1] for _, det in history]
            avg_y_ratio = sum(ys) / len(ys) / video.height

        # Lateral analysis — average horizontal position
        if history and video.width > 0:
            xs = [det.center[0] for _, det in history]
            avg_x_ratio = sum(xs) / len(xs) / video.width
        else:
            avg_x_ratio = 0.5
    else:
        avg_x_ratio = 0.5

    # Decision tree for position inference
    if shots >= 2 or (attacking_signal > defensive_signal * 2 and avg_y_ratio < 0.45):
        # Clearly attacking profile
        if avg_x_ratio < 0.35:
            return "LW"
        elif avg_x_ratio > 0.65:
            return "RW"
        else:
            return "ST"

    if attacking_signal > defensive_signal * 1.3:
        # Somewhat attacking
        if dribbles > passes_completed:
            if avg_x_ratio < 0.35:
                return "LW"
            elif avg_x_ratio > 0.65:
                return "RW"
            return "AM"
        return "AM"

    if defensive_signal > attacking_signal * 1.5:
        # Defensive profile
        if avg_y_ratio > 0.6:
            if avg_x_ratio < 0.35:
                return "LB"
            elif avg_x_ratio > 0.65:
                return "RB"
            return "CB"
        return "DM"

    # Balanced — midfielder
    if pass_attempts > dribbles * 2:
        return "CM"  # pass-oriented midfielder

    return "CM"
