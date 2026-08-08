from __future__ import annotations
from dataclasses import dataclass
from typing import Dict, List, Optional, Tuple     

from .models import FootballEvent
from .detection import Detection


@dataclass
class _PossessionState:
    track_id: Optional[int] = None
    frames_held: int = 0
    start_ts: Optional[float] = None
    start_pos: Optional[Tuple[float, float]] = None


class FootballEventDetector:
    def __init__(
        self,
        possession_radius_factor: float = 0.55,
        min_possession_frames: int = 2,
        pass_window_sec: float = 2.5,
        pass_speed_threshold: float = 350.0,   # px/sec, release counted as deliberate pass
        shot_speed_threshold: float = 900.0,   # px/sec, release counted as candidate shot
        dribble_move_threshold: float = 18.0,  # px/frame while retaining possession
    ):
        self.possession_radius_factor = possession_radius_factor
        self.min_possession_frames = min_possession_frames
        self.pass_window_sec = pass_window_sec
        self.pass_speed_threshold = pass_speed_threshold
        self.shot_speed_threshold = shot_speed_threshold
        self.dribble_move_threshold = dribble_move_threshold

        self._state = _PossessionState()
        self._pending_release: Optional[Dict] = None  # awaiting pass/ball_loss resolution
        self.events: List[FootballEvent] = []

    def _nearest_holder(
        self, ball: Detection, players: Dict[int, Detection]
    ) -> Optional[Tuple[int, float]]:
        best_tid, best_dist, best_radius = None, None, None
        for tid, det in players.items():
            fx, fy = det.foot_point
            bx, by = ball.center
            dist = ((fx - bx) ** 2 + (fy - by) ** 2) ** 0.5
            radius = det.bbox[3] * self.possession_radius_factor
            if dist <= radius and (best_dist is None or dist < best_dist):
                best_tid, best_dist, best_radius = tid, dist, radius
        if best_tid is None:
            return None
        return best_tid, best_dist

    def process_frame(
        self,
        ts: float,
        players: Dict[int, Detection],
        ball: Optional[Detection],
        ball_speed: Optional[float],
    ):
        holder = self._nearest_holder(ball, players) if ball is not None else None
        holder_tid = holder[0] if holder else None

        # resolve any pending pass/ball_loss decision once the window elapses
        if self._pending_release is not None:
            pr = self._pending_release
            if holder_tid is not None and holder_tid != pr["from_track"]:
                self.events.append(FootballEvent(
                    timestamp=ts, type="pass_completed", confidence=0.55,
                    details={"from_track": pr["from_track"], "to_track": holder_tid,
                             "release_speed_px_s": pr["speed"]},
                ))
                self._pending_release = None
            elif ts - pr["ts"] > self.pass_window_sec:
                event_type = "shot_attempt" if pr["is_shot_candidate"] else "ball_loss"
                conf = 0.35 if event_type == "shot_attempt" else 0.5
                self.events.append(FootballEvent(
                    timestamp=pr["ts"], type=event_type, confidence=conf,
                    details={"from_track": pr["from_track"], "release_speed_px_s": pr["speed"]},
                ))
                self._pending_release = None

        if holder_tid is None:
            # possession ended (or was never held) this frame
            if self._state.track_id is not None and self._state.frames_held >= self.min_possession_frames:
                # a genuine possession just ended -> classify the release
                speed = ball_speed if ball_speed is not None else 0.0
                is_pass_speed = speed >= self.pass_speed_threshold
                is_shot_speed = speed >= self.shot_speed_threshold
                if is_pass_speed:
                    self.events.append(FootballEvent(
                        timestamp=ts, type="pass_attempt", confidence=0.6,
                        details={"from_track": self._state.track_id, "release_speed_px_s": speed},
                    ))
                    self._pending_release = {
                        "from_track": self._state.track_id, "ts": ts,
                        "speed": speed, "is_shot_candidate": is_shot_speed,
                    }
                else:
                    self.events.append(FootballEvent(
                        timestamp=ts, type="ball_loss", confidence=0.45,
                        details={"from_track": self._state.track_id, "release_speed_px_s": speed},
                    ))
            self._state = _PossessionState()
            return

        if self._state.track_id != holder_tid:
            # possession is (re)starting for this track
            self._state = _PossessionState(
                track_id=holder_tid, frames_held=1, start_ts=ts,
                start_pos=players[holder_tid].foot_point,
            )
            return

        # possession continues for the same track
        self._state.frames_held += 1
        if self._state.frames_held == self.min_possession_frames:
            self.events.append(FootballEvent(
                timestamp=self._state.start_ts, type="possession_start",
                confidence=0.7, details={"track_id": holder_tid},
            ))
            self.events.append(FootballEvent(
                timestamp=self._state.start_ts, type="ball_reception",
                confidence=0.5, details={"track_id": holder_tid},
            ))
        elif self._state.frames_held > self.min_possession_frames:
            cur = players[holder_tid].foot_point
            if self._state.start_pos is not None:
                moved = ((cur[0] - self._state.start_pos[0]) ** 2 +
                         (cur[1] - self._state.start_pos[1]) ** 2) ** 0.5
                if moved >= self.dribble_move_threshold:
                    self.events.append(FootballEvent(
                        timestamp=ts, type="dribble", confidence=0.4,
                        details={"track_id": holder_tid, "distance_px": moved},
                    ))
                    self._state.start_pos = cur

    def finalize(self):
        if self._pending_release is not None:
            pr = self._pending_release
            event_type = "shot_attempt" if pr["is_shot_candidate"] else "ball_loss"
            self.events.append(FootballEvent(
                timestamp=pr["ts"], type=event_type, confidence=0.35 if event_type == "shot_attempt" else 0.45,
                details={"from_track": pr["from_track"], "release_speed_px_s": pr["speed"]},
            ))
            self._pending_release = None
