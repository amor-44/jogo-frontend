"""
Player Position Inference
===========================
Spec section 13 explicitly forbids confidently assigning a position
without enough tactical context (field calibration, sustained on-field
location relative to goals/thirds). This MVP has no field-calibration
(homography) component, so it always returns "Unknown" - this is
intentional, not a placeholder bug. A future version with homography +
longer-clip tracking could infer a rough zone (e.g. average position in
defensive/middle/attacking third) and map that to a coarse position label.
"""
from __future__ import annotations
from .models import VideoProfile

ALLOWED_POSITIONS = [
    "GK", "CB", "LB", "RB", "DM", "CM", "AM", "LW", "RW", "ST", "Unknown",
]


def infer_position(video: VideoProfile) -> str:
    return "Unknown"
