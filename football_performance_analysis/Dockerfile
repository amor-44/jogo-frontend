FROM python:3.11-slim-bookworm
ENV PIP_DEFAULT_TIMEOUT=300

# System deps for opencv-python-headless (the pip package in
# requirements.txt). Previously this also apt-installed python3-opencv and
# libgl1 — a second, conflicting cv2 install on a different Python
# interpreter than the one pip/uvicorn use, and unnecessary GUI libs the
# headless wheel doesn't need. Dropped both.
RUN apt-get update && apt-get install -y --no-install-recommends \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "api:app", "--host", "0.0.0.0", "--port", "8000"]
