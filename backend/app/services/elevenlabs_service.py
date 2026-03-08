"""
services/elevenlabs_service.py

Converts the prescription explanation to speech using ElevenLabs TTS.

Supported languages: English, French, Spanish, Arabic, Mandarin Chinese.
Users can pick their language — each gets a curated default voice.
Voice can also be overridden with any valid ElevenLabs voice_id.

Returns base64 MP3 — frontend plays it instantly:
    const audio = new Audio(`data:audio/mp3;base64,${audio_b64}`);
    audio.play();
"""

import base64
import httpx
from app.config import settings

# eleven_multilingual_v2: best quality for non-English languages
MULTILINGUAL_MODEL = "eleven_multilingual_v2"
# eleven_monolingual_v1: English only, slightly faster
ENGLISH_MODEL = "eleven_monolingual_v1"

# ── Language → Voice catalog ──────────────────────────────────────────────────
# Voices selected for: clear diction, calm tone, natural pacing.
# All voice IDs are from ElevenLabs' free shared voice library.

LANGUAGE_VOICE_CATALOG: dict[str, dict] = {
    "en": {
        "voice_id":   "xKhbyU7E3bC6T89Kn26c",
        "voice_name": "Adam",
        "gender":     "male",
        "language":   "English",
        "note":       "Warm, clear — ideal for medical instructions",
    },
    "fr": {
        "voice_id":   "HuLbOdhRlvQQN8oPP0AJ",
        "voice_name": "Claire",
        "gender":     "female",
        "language":   "French",
        "note":       "Clear Parisian French, calm cadence",
    },
    "es": {
        "voice_id":   "y6WtESLj18d0diFRruBs",
        "voice_name": "David",
        "gender":     "male",
        "language":   "Spanish",
        "note":       "Natural Spanish pronunciation",
    },
    "ar": {
        "voice_id":   "qi4PkV9c01kb869Vh7Su",
        "voice_name": "Asmaa",
        "gender":     "female",
        "language":   "Arabic",
        "note":       "Modern Standard Arabic, clear enunciation",
    },
    "hi": {
        "voice_id":   "0UZ29F1kNDvmelKG8QCM",
        "voice_name": "Raqib",
        "gender":     "male",
        "language":   "Hindi",
        "note":       "Standard Arabic, clear",
    },
    "zh": {
        "voice_id":   "DowyQ68vDpgFYdWVGjc3",
        "voice_name": "Jason",
        "gender":     "male",
        "language":   "Mandarin Chinese",
        "note":       "Standard Mandarin pronunciation",
    },
}

DEFAULT_VOICE_ID = "xKhbyU7E3bC6T89Kn26c"  # Adam — English fallback


def get_voice_for_language(language_code: str, voice_id_override: str | None = None) -> str:
    """
    Resolve the voice ID to use.

    Priority:
      1. voice_id_override — user picked a specific voice
      2. Catalog default for the language
      3. Fallback to Bella if somehow not found
    """
    if voice_id_override:
        return voice_id_override
    entry = LANGUAGE_VOICE_CATALOG.get(language_code)
    return entry["voice_id"] if entry else DEFAULT_VOICE_ID


def generate_voice(
    text: str,
    language_code: str = "en",
    voice_id_override: str | None = None,
) -> str:
    """
    Convert explanation text to speech.

    Args:
        text:              Plain-language explanation to speak.
        language_code:     One of: en, fr, es, ar, zh, hi
        voice_id_override: Optional ElevenLabs voice_id to use instead of default.

    Returns:
        Base64-encoded MP3 string.
    """
    voice_id = get_voice_for_language(language_code, voice_id_override)
    model_id = ENGLISH_MODEL if language_code == "en" else MULTILINGUAL_MODEL

    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"

    headers = {
        "xi-api-key": settings.ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
    }

    payload = {
        "text": text,
        "model_id": model_id,
        "voice_settings": {
            "stability":         0.55,
            "similarity_boost":  0.75,
            "style":             0.20,
            "use_speaker_boost": True,
        },
    }

    response = httpx.post(url, json=payload, headers=headers, timeout=45.0)
    response.raise_for_status()

    return base64.b64encode(response.content).decode("utf-8")


def build_voice_script(analysis: dict) -> str:
    """
    Build a spoken script from Gemini's analysis.
    Reads summary → instructions → warnings. Skips raw_text and terms.
    """
    parts = []

    if analysis.get("summary"):
        parts.append(analysis["summary"])

    instructions = analysis.get("instructions", [])
    if instructions:
        parts.append("Here is what you need to do.")
        parts.extend(instructions)

    warnings = analysis.get("warnings", [])
    if warnings:
        parts.append("Important things to be aware of.")
        parts.extend(warnings)

    return " ".join(parts)


def list_voices() -> list[dict]:
    """Returns the voice catalog for the frontend language/voice picker."""
    return [
        {
            "language_code": code,
            "language":      entry["language"],
            "voice_id":      entry["voice_id"],
            "voice_name":    entry["voice_name"],
            "gender":        entry["gender"],
            "note":          entry["note"],
        }
        for code, entry in LANGUAGE_VOICE_CATALOG.items()
    ]