"""FastAPI application for Pipecat sandbox: /api/start and /api/offer."""

import uuid
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import BackgroundTasks, HTTPException, Query, Request
from fastapi.applications import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from loguru import logger
from pipecat.transports.smallwebrtc.request_handler import (
    IceCandidate,
    SmallWebRTCRequest,
    SmallWebRTCRequestHandler,
    SmallWebRTCPatchRequest,
)

from config import create_session, get_backend_base_url, get_session_config

# Import bot runner - will be implemented in bot.py
# from bot import run_bot

load_dotenv(override=True)

app = FastAPI(title="Pipecat Sandbox API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

small_webrtc_handler = SmallWebRTCRequestHandler()


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Ensure CORS headers on unhandled exceptions."""
    from fastapi import HTTPException as FastAPIHTTPException
    if isinstance(exc, FastAPIHTTPException):
        raise exc
    logger.exception(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"error": str(exc), "detail": "Internal server error"},
        headers={"Access-Control-Allow-Origin": "*"},
    )


@app.post("/api/start")
async def start(request: Request):
    """
    Start a bot session. Accepts system_prompt, activity_prompt, mode, and model selections.
    Returns webrtcUrl for the client to connect via SmallWebRTC.
    """
    body = await request.json()
    session_id = str(uuid.uuid4())
    base_url = get_backend_base_url()
    webrtc_url = f"{base_url}/api/offer?session_id={session_id}"

    # Accept both snake_case and camelCase from client
    config = {
        "system_prompt": body.get("system_prompt") or body.get("systemPrompt") or "",
        "activity_prompt": body.get("activity_prompt") or body.get("activityPrompt") or "",
        "mode": body.get("mode", "three_tier"),
        "stt_provider": body.get("stt_provider") or body.get("sttProvider") or "deepgram",
        "llm_provider": body.get("llm_provider") or body.get("llmProvider") or "openai",
        "tts_provider": body.get("tts_provider") or body.get("ttsProvider") or "cartesia",
        "s2s_provider": body.get("s2s_provider") or body.get("s2sProvider") or "openai_realtime",
    }

    create_session(session_id, config)
    logger.info(f"Created session {session_id} with config: {config}")

    # Use webrtcRequestParams (webrtcUrl is deprecated)
    return {
        "webrtcRequestParams": {
            "endpoint": webrtc_url,
        },
    }


@app.post("/api/offer")
async def offer(
    request: Request,
    background_tasks: BackgroundTasks,
    session_id: str | None = Query(None, alias="session_id"),
):
    """
    Handle WebRTC offer. Looks up session config by session_id and runs the bot.
    """
    config = None
    if session_id:
        config = get_session_config(session_id)
        if not config:
            logger.warning(f"No config found for session_id={session_id}")

    # Default config if none found
    if not config:
        config = {
            "system_prompt": "You are a friendly voice assistant.",
            "activity_prompt": "",
            "mode": "three_tier",
            "stt_provider": "deepgram",
            "llm_provider": "openai",
            "tts_provider": "cartesia",
            "s2s_provider": "openai_realtime",
        }

    async def webrtc_connection_callback(connection):
        from bot import run_bot

        background_tasks.add_task(run_bot, connection, config)

    body = await request.json()
    webrtc_request = SmallWebRTCRequest.from_dict(body)
    answer = await small_webrtc_handler.handle_web_request(
        request=webrtc_request,
        webrtc_connection_callback=webrtc_connection_callback,
    )
    return answer


@app.patch("/api/offer")
async def offer_patch(request: Request):
    """Handle WebRTC ICE candidate patch requests."""
    try:
        body = await request.json()
        pc_id = body.get("pc_id")
        candidates_raw = body.get("candidates", [])
        if not pc_id:
            return JSONResponse(
                status_code=400,
                content={"error": "pc_id is required"},
                headers={"Access-Control-Allow-Origin": "*"},
            )
        # Convert candidate dicts to IceCandidate (support both snake_case and camelCase)
        candidates = [
            IceCandidate(
                candidate=c.get("candidate", ""),
                sdp_mid=c.get("sdp_mid") or c.get("sdpMid", ""),
                sdp_mline_index=int(c.get("sdp_mline_index", c.get("sdpMLineIndex", 0))),
            )
            for c in candidates_raw
        ]
        patch_request = SmallWebRTCPatchRequest(pc_id=pc_id, candidates=candidates)
        await small_webrtc_handler.handle_patch_request(patch_request)
        return {"status": "success"}
    except Exception as e:
        logger.exception(f"PATCH /api/offer failed: {e}")
        return JSONResponse(
            status_code=500,
            content={"error": str(e), "detail": "ICE candidate patch failed"},
            headers={"Access-Control-Allow-Origin": "*"},
        )


@app.get("/health")
async def health():
    return {"status": "ok"}


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    await small_webrtc_handler.close()


# Note: Wire lifespan via FastAPI(lifespan=lifespan) if needed
