"""Sprint 1 deliverable: benchmark YOLOv8 player detection on sample videos (PRD Section 14, Sprint 1)."""

import argparse
import sys
import time
from pathlib import Path

import cv2

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "src"))
from detection import detect_players  # noqa: E402


def benchmark_video(video_path: Path) -> None:
    capture = cv2.VideoCapture(str(video_path))
    if not capture.isOpened():
        print(f"  could not open {video_path.name}")
        return

    frame_count = 0
    detection_counts: list[int] = []
    start = time.perf_counter()

    while True:
        ok, frame = capture.read()
        if not ok:
            break
        frame_count += 1
        detection_counts.append(len(detect_players(frame)))

    capture.release()
    elapsed = time.perf_counter() - start

    if frame_count == 0:
        print(f"  {video_path.name}: no frames read")
        return

    avg_detections = sum(detection_counts) / frame_count
    fps = frame_count / elapsed if elapsed > 0 else 0.0
    print(
        f"  {video_path.name}: {frame_count} frames, "
        f"{avg_detections:.1f} avg detections/frame, "
        f"{fps:.1f} fps processed"
    )


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "video_dir",
        type=Path,
        help="Directory of sample match videos to benchmark",
    )
    args = parser.parse_args()

    videos = sorted(
        p for p in args.video_dir.iterdir() if p.suffix.lower() in {".mp4", ".mov", ".avi"}
    )
    if not videos:
        print(f"no videos found in {args.video_dir}")
        return

    print(f"benchmarking {len(videos)} video(s):")
    for video_path in videos:
        benchmark_video(video_path)


if __name__ == "__main__":
    main()
