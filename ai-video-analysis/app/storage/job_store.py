import threading
from datetime import datetime, timezone
from typing import Dict, Optional

from app.models.schemas import AnalysisJob, AnalysisStatus, Report


class JobStore:
    def __init__(self) -> None:
        self._jobs: Dict[str, AnalysisJob] = {}
        self._lock = threading.Lock()

    def create(self, analysis_id: str, video_filename: str, player_id: Optional[str] = None) -> AnalysisJob:
        job = AnalysisJob(
            analysis_id=analysis_id,
            status=AnalysisStatus.PENDING,
            video_filename=video_filename,
            player_id=player_id,
        )
        with self._lock:
            self._jobs[analysis_id] = job
        return job

    def get(self, analysis_id: str) -> Optional[AnalysisJob]:
        with self._lock:
            return self._jobs.get(analysis_id)

    def update_status(self, analysis_id: str, status: AnalysisStatus, error: Optional[str] = None) -> None:
        with self._lock:
            job = self._jobs.get(analysis_id)
            if job is None:
                return
            job.status = status
            job.updated_at = datetime.now(timezone.utc)
            if error is not None:
                job.error = error

    def set_report(self, analysis_id: str, report: Report) -> None:
        with self._lock:
            job = self._jobs.get(analysis_id)
            if job is None:
                return
            job.report = report
            job.status = AnalysisStatus.COMPLETED
            job.updated_at = datetime.now(timezone.utc)


# Single shared instance for the process (MVP scope: one worker).
job_store = JobStore()
