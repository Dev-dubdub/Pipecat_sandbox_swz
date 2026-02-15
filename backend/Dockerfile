FROM python:3.12-slim

WORKDIR /app

# Install system deps: libxcb (required by WebRTC/aiortc), ffmpeg (for audio)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libxcb1 libxcb-shm0 libxcb-xfixes0 libxcb-shape0 libxcb-xkb1 \
    libxkbcommon0 libxkbcommon-x11-0 \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 7860

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
