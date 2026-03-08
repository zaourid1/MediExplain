from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.elevenlabs_service import generate_voice

router = APIRouter(prefix="/api/voice")


class SpeakRequest(BaseModel):
    text: str
    language_code: str = "en"


@router.post("/speak")
async def speak(body: SpeakRequest):
    try:
        audio_b64 = generate_voice(body.text, language_code=body.language_code)
        return {"audio_b64": audio_b64}
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Voice generation failed: {str(e)}. Check ELEVENLABS_API_KEY in backend .env",
        )
