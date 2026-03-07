"""
config.py - Central place for all environment variables.
Import `settings` anywhere you need a key.
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # --- Gemini ---
    GEMINI_API_KEY: str

    # --- ElevenLabs ---
    ELEVENLABS_API_KEY: str = ""           # Optional - leave blank to skip audio
    ELEVENLABS_VOICE_ID: str = "EXAVITQu4vr4xnSDxMaL"  # Default: "Bella" voice

    # --- Cloudinary (optional image hosting) ---
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""

    # --- App ---
    MAX_FILE_SIZE_MB: int = 10

    class Config:
        env_file = ".env"
        extra = "ignore"


# Singleton — import this everywhere
settings = Settings()
