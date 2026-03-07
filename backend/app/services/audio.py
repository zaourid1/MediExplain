"""
services/audio.py
Converts plain-language text to audio using ElevenLabs TTS.
Returns base64-encoded MP3 so the frontend can play it without a file server.
"""

import base64
import httpx
from app.config import settings


def generate_audio(text: str) -> str | None:
    """
    Call ElevenLabs TTS and return the audio as a base64-encoded string.

    Args:
        text: The plain-language text to convert to speech.
              Keep this to the summary + instructions for best results.

    Returns:
        Base64 string of the MP3 audio, or None if ElevenLabs is not configured.
    """
    # If no API key is set, silently skip audio generation
    if not settings.ELEVENLABS_API_KEY:
        return None

    url = f"https://api.elevenlabs.io/v1/text-to-speech/{settings.ELEVENLABS_VOICE_ID}"

    headers = {
        "xi-api-key": settings.ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
    }

    payload = {
        "text": text,
        "model_id": "eleven_monolingual_v1",   # Fast + good quality
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.75,
        },
    }

    # Use httpx for a clean sync request (no async complexity needed here)
    response = httpx.post(url, json=payload, headers=headers, timeout=30.0)
    response.raise_for_status()  # Raises if 4xx/5xx

    audio_bytes = response.content
    return base64.b64encode(audio_bytes).decode("utf-8")


def build_speakable_text(simplified: dict) -> str:
    """
    Builds a natural-sounding script from the structured simplified response.
    This is what gets sent to ElevenLabs.
    """
    parts = []

    if simplified.get("summary"):
        parts.append(simplified["summary"])

    instructions = simplified.get("instructions", [])
    if instructions:
        parts.append("Here is what you need to do.")
        parts.extend(instructions)

    warnings = simplified.get("warnings", [])
    if warnings:
        parts.append("Important things to watch out for.")
        parts.extend(warnings)

    return " ".join(parts)
