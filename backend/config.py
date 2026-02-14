"""Configuration and mode/model mappings for the Pipecat sandbox."""

import os
from typing import Any

# Session config storage (in-memory; for production use Redis or similar)
SESSION_CONFIGS: dict[str, dict[str, Any]] = {}

# Mode options
MODE_THREE_TIER = "three_tier"
MODE_S2S = "s2s"

# 3-tier model options
STT_PROVIDERS = ["deepgram"]
LLM_PROVIDERS = ["openai"]
TTS_PROVIDERS = ["cartesia"]

# S2S model options
S2S_PROVIDERS = ["openai_realtime"]

# Default values
DEFAULT_SYSTEM_PROMPT = "You are a friendly voice assistant for kids. Keep responses short, clear, and age-appropriate."
DEFAULT_ACTIVITY_PROMPT = ""
DEFAULT_MODE = MODE_THREE_TIER


def get_backend_base_url() -> str:
    """Get the backend base URL for webrtcUrl responses."""
    return os.getenv("BACKEND_BASE_URL", "http://localhost:7860").rstrip("/")


def create_session(session_id: str, config: dict[str, Any]) -> None:
    """Store session config for later use when bot starts."""
    SESSION_CONFIGS[session_id] = config


def get_session_config(session_id: str) -> dict[str, Any] | None:
    """Retrieve session config. Removes it after retrieval (one-time use)."""
    return SESSION_CONFIGS.pop(session_id, None)
