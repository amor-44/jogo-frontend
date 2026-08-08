#!/usr/bin/env python3
import sys
import json
import time

from core.pipeline import analyze_video


def main():
    if len(sys.argv) != 2:
        print("Usage: python cli.py <video_path>")
        sys.exit(1)

    video_path = sys.argv[1]
    t0 = time.time()
    report = analyze_video(video_path)
    elapsed = time.time() - t0

    print(json.dumps(report.to_dict(), indent=2, default=str))
    print(f"\n# analyzed in {elapsed:.1f}s", file=sys.stderr)


if __name__ == "__main__":
    main()
