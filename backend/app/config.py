"""
config.py — All environment variables loaded from .env
Import `settings` anywhere you need a key.
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):

    # ── Cloudinary (image upload — REQUIRED) ──────────────────────────────
    CLOUDINARY_CLOUD_NAME: str
    CLOUDINARY_API_KEY: str
    CLOUDINARY_API_SECRET: str

    # ── Gemini (prescription analysis — REQUIRED) ─────────────────────────
    GEMINI_API_KEY: str
    GEMINI_MODEL: str = "gemini-2.5-flash-lite"   # Override in .env if needed

    # ── ElevenLabs (voice — REQUIRED) ─────────────────────────────────────
    ELEVENLABS_API_KEY: str
    # Default voice: calm, clear, medically appropriate
    ELEVENLABS_VOICE_ID: str = "xKhbyU7E3bC6T89Kn26c"   # "Adam"

    # ── Auth0 (JWT verification — required for /api/explain and /api/me) ───
    AUTH0_DOMAIN: str = ""      # e.g. your-tenant.us.auth0.com
    AUTH0_AUDIENCE: str = ""    # e.g. https://mediexplain-api

    # ── App ───────────────────────────────────────────────────────────────
    MAX_FILE_SIZE_MB: int = 10

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
