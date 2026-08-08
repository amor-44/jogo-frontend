
import cv2
import numpy as np
import math
import sys

W, H = 960, 540
FPS = 25
DURATION_SEC = 8
OUT_PATH = sys.argv[1] if len(sys.argv) > 1 else "/home/claude/football_performance/test/synthetic_match.mp4"


def main():
    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    writer = cv2.VideoWriter(OUT_PATH, fourcc, FPS, (W, H))

    n_frames = FPS * DURATION_SEC
    p1_start, p1_end = (150, 300), (420, 300)
    p2_start, p2_end = (750, 300), (520, 300)

    for i in range(n_frames):
        t = i / n_frames
        frame = np.zeros((H, W, 3), dtype=np.uint8)
        frame[:] = (40, 130, 40)  # green pitch
        for y in range(0, H, 40):
            cv2.line(frame, (0, y), (W, y), (35, 120, 35), 1)

        # players walk toward each other then the pass happens ~40% through
        p1x = int(p1_start[0] + (p1_end[0] - p1_start[0]) * min(t / 0.5, 1.0))
        p2x = int(p2_start[0] + (p2_end[0] - p2_start[0]) * min(t / 0.5, 1.0))
        p1y, p2y = p1_start[1], p2_start[1]

        cv2.rectangle(frame, (p1x - 18, p1y - 55), (p1x + 18, p1y + 55), (20, 20, 160), -1)
        cv2.rectangle(frame, (p2x - 18, p2y - 55), (p2x + 18, p2y + 55), (160, 160, 20), -1)

        # ball: sits at player 1 until t=0.5, then flies to player 2 by t=0.65, then sits
        if t < 0.5:
            bx, by = p1x, p1y + 55
        elif t < 0.65:
            frac = (t - 0.5) / 0.15
            bx = int(p1x + (p2x - p1x) * frac)
            by = int((p1y + 55) + ((p2y + 55) - (p1y + 55)) * frac) - int(40 * math.sin(frac * math.pi))
        else:
            bx, by = p2x, p2y + 55

        cv2.circle(frame, (bx, by), 8, (245, 245, 245), -1)
        cv2.circle(frame, (bx, by), 8, (30, 30, 30), 1)

        writer.write(frame)

    writer.release()
    print(f"Wrote {n_frames} frames ({DURATION_SEC}s @ {FPS}fps) to {OUT_PATH}")


if __name__ == "__main__":
    main()
