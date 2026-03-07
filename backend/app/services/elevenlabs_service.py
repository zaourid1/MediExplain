"""
services/elevenlabs_service.py

Step 3 of the pipeline: Convert the explanation to voice using ElevenLabs.

Returns base64-encoded MP3 — no file storage needed.
Frontend plays it with: new Audio(`data:audio/mp3;base64,${audio_b64}`)

Language support:
  ElevenLabs automatically handles pronunciation for different languages
  when the text is already in that language (Gemini already translated it).
  For best results with non-English, use a multilingual model.
"""

import base64
import httpx
from app.config import settings

# eleven_multilingual_v2 handles 29 languages with natural pronunciation
MULTILINGUAL_MODEL = "eleven_multilingual_v2"
ENGLISH_MODEL      = "eleven_monolingual_v1"   # Faster + higher quality for English only


def generate_voice(text: str, language_code: str = "en") -> str:
    """
    Convert text to speech using ElevenLabs.

    Args:
        text:          The explanation text to speak aloud.
        language_code: ISO language code — used to pick the right model.

    Returns:
        Base64-encoded MP3 string.

    Raises:
        httpx.HTTPStatusError if ElevenLabs API call fails.
    """
    # Use multilingual model for non-English languages
    model_id = ENGLISH_MODEL if language_code == "en" else MULTILINGUAL_MODEL

    url = f"https://api.elevenlabs.io/v1/text-to-speech/{settings.ELEVENLABS_VOICE_ID}"

    headers = {
        "xi-api-key": settings.ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
    }

    payload = {
        "text": text,
        "model_id": model_id,
        "voice_settings": {
            "stability":        0.55,   # Higher = more consistent, less expressive
            "similarity_boost": 0.75,   # Higher = closer to original voice
            "style":            0.2,    # Slight warmth for a reassuring medical voice
            "use_speaker_boost": True,
        },
    }

    response = httpx.post(url, json=payload, headers=headers, timeout=45.0)
    response.raise_for_status()

    return base64.b64encode(response.content).decode("utf-8")


def build_voice_script(analysis: dict) -> str:
    """
    Build a natural-sounding spoken script from the Gemini analysis.

    Uses the pre-written summary + key instructions — avoids reading
    the full raw_text which may contain confusing codes or abbreviations.
    """
    parts = []

    summary = analysis.get("summary", "")
    if summary:
        parts.append(summary)

    instructions = analysis.get("instructions", [])
    if instructions:
        parts.append("Here is what you need to do.")
        parts.extend(instructions)

    warnings = analysis.get("warnings", [])
    if warnings:
        parts.append("Important things to be aware of.")
        parts.extend(warnings)

    return " ".join(parts)
