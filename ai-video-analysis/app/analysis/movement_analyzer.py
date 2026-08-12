import math
from dataclasses import dataclass, field
from typing import List


from app.tracking.tracker import TrackObservation
from app.utils.logger import get_logger

logger = get_logger(__name__)

# A direction "change" is counted when consecutive movement vectors
# differ by at least this many degrees. Tuned loosely for short skill
# clips; not a validated biomechanical threshold.
DIRECTION_CHANGE_ANGLE_THRESHOLD_DEGREES = 35.0

# Below this instantaneous speed (px/s), the player is considered
# stationary/idle rather than "active", for the activity_time metric.
ACTIVITY_SPEED_THRESHOLD_PIXELS_PER_SECOND = 15.0


@dataclass
class MovementMetrics:
    frames_processed: int
    player_detected: bool
    detection_rate: float
    average_detection_confidence: float
    tracking_duration_seconds: float
    estimated_distance_pixels: float
    average_speed_pixels_per_second: float
    movement_consistency: float
    direction_changes: int
    activity_time_seconds: float
    path: List[tuple] = field(default_factory=list)


class MovementAnalyzer:
    def analyze(self, observations: List[TrackObservation], total_frames: int) -> MovementMetrics:
        if not observations:
            logger.warning("No tracking observations available for movement analysis.")
            return MovementMetrics(
                frames_processed=total_frames,
                player_detected=False,
                detection_rate=0.0,
                average_detection_confidence=0.0,
                tracking_duration_seconds=0.0,
                estimated_distance_pixels=0.0,
                average_speed_pixels_per_second=0.0,
                movement_consistency=0.0,
                direction_changes=0,
                activity_time_seconds=0.0,
                path=[],
            )

        observations = sorted(observations, key=lambda o: o.frame_index)
        path = [obs.center for obs in observations]
        confidences = [obs.confidence for obs in observations]

        distances: List[float] = []
        speeds: List[float] = []
        activity_time = 0.0
        direction_changes = 0
        prev_vector = None

        for prev_obs, curr_obs in zip(observations, observations[1:]):
            dt = curr_obs.timestamp - prev_obs.timestamp
            dx = curr_obs.center[0] - prev_obs.center[0]
            dy = curr_obs.center[1] - prev_obs.center[1]
            dist = math.hypot(dx, dy)
            distances.append(dist)

            if dt > 0:
                speed = dist / dt
                speeds.append(speed)
                if speed >= ACTIVITY_SPEED_THRESHOLD_PIXELS_PER_SECOND:
                    activity_time += dt

            if dist > 1e-6:
                vector = (dx, dy)
                if prev_vector is not None:
                    angle = self._angle_between(prev_vector, vector)
                    if angle >= DIRECTION_CHANGE_ANGLE_THRESHOLD_DEGREES:
                        direction_changes += 1
                prev_vector = vector

        total_distance = sum(distances)
        tracking_duration = observations[-1].timestamp - observations[0].timestamp
        average_speed = (total_distance / tracking_duration) if tracking_duration > 0 else 0.0
        detection_rate = (len(observations) / total_frames) if total_frames else 0.0

        return MovementMetrics(
            frames_processed=total_frames,
            player_detected=True,
            detection_rate=round(min(detection_rate, 1.0), 3),
            average_detection_confidence=round(sum(confidences) / len(confidences), 3),
            tracking_duration_seconds=round(tracking_duration, 2),
            estimated_distance_pixels=round(total_distance, 2),
            average_speed_pixels_per_second=round(average_speed, 2),
            movement_consistency=round(self._movement_consistency(speeds), 3),
            direction_changes=direction_changes,
            activity_time_seconds=round(activity_time, 2),
            path=path,
        )

    @staticmethod
    def _angle_between(v1: tuple, v2: tuple) -> float:
        dot = v1[0] * v2[0] + v1[1] * v2[1]
        mag1 = math.hypot(*v1)
        mag2 = math.hypot(*v2)
        if mag1 == 0 or mag2 == 0:
            return 0.0
        cos_angle = max(-1.0, min(1.0, dot / (mag1 * mag2)))
        return math.degrees(math.acos(cos_angle))

    @staticmethod
    def _movement_consistency(speeds: List[float]) -> float:
        """0-1 score: 1 means very steady speed, 0 means erratic.

        Approximated as 1 minus the coefficient of variation of
        instantaneous speed, capped to [0, 1]. This is a simple
        MVP heuristic, not a validated sports-science measure.
        """
        if not speeds:
            return 0.0
        mean_speed = sum(speeds) / len(speeds)
        if mean_speed == 0:
            return 0.0
        variance = sum((s - mean_speed) ** 2 for s in speeds) / len(speeds)
        std_dev = math.sqrt(variance)
        coefficient_of_variation = std_dev / mean_speed
        return max(0.0, 1.0 - min(coefficient_of_variation, 1.0))
