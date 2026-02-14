# Pipecat PM Sandbox – Deployment

## Frontend (Vercel)

1. **Connect repo** to Vercel and set root directory to `frontend/`.

2. **Environment variable** – Add `VITE_API_URL`:
   - **Local/dev**: `http://localhost:7860`
   - **Production**: Your backend URL (e.g. `https://api.your-domain.com`)

3. **Build** – Vercel uses `npm run build` and outputs `dist/` (default for Vite).

4. **Preview/Production** – Ensure `VITE_API_URL` points to the correct backend for each environment.

## Backend (AWS EC2)

### Prerequisites
- Python 3.10+
- `uvicorn`, `fastapi`, and other deps from `requirements.txt`

### Option A: Direct (systemd)

1. **Install deps**:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Configure** – Copy `.env.example` to `.env` and set:
   - `DEEPGRAM_API_KEY`
   - `OPENAI_API_KEY`
   - `CARTESIA_API_KEY`
   - `BACKEND_BASE_URL` = your public backend URL (for `webrtcUrl` in responses)

3. **Run**:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 7860
   ```

4. **Reverse proxy** – Put nginx or Caddy in front for HTTPS.

### Option B: Docker

1. **Build & run**:
   ```bash
   cd backend
   docker build -t pipecat-sandbox .
   docker run -p 7860:7860 --env-file .env pipecat-sandbox
   ```

2. **Env** – Ensure `.env` includes `BACKEND_BASE_URL` and API keys.

### Reverse proxy (HTTPS)

Example Caddy site:

```caddy
api.your-domain.com {
    reverse_proxy localhost:7860
}
```

### CORS

Backend uses `CORSMiddleware` with `allow_origins=["*"]`. For production, restrict `allow_origins` to your Vercel domain(s).
