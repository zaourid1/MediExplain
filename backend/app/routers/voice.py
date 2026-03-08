from fastapi import APIRouter
from pydantic import BaseModel
from app.services.elevenlabs_service import generate_voice

router = APIRouter(prefix="/api/voice")


class SpeakRequest(BaseModel):
    text: str
    language_code: str = "en"


@router.post("/speak")
async def speak(body: SpeakRequest):
    audio_b64 = generate_voice(body.text, language_code=body.language_code)
    return {"audio_b64": audio_b64}
