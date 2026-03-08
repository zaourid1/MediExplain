"""
routers/translation.py

POST /api/translate/prescription  — translate a full analysis dict
POST /api/translate/text          — translate a single string
GET  /api/translate/languages     — list supported languages
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Any

from app.middleware.auth0 import verify_token
from app.services.translator import (
    translate_prescription,
    translate_text,
    SUPPORTED_LANGUAGES,
)

router = APIRouter(prefix="/api/translate", tags=["translation"])


# ── Request / Response models ─────────────────────────────────────────────────

class PrescriptionTranslateRequest(BaseModel):
    analysis: dict[str, Any]   # Full analysis object from /api/prescriptions/analyze
    language: str              # BCP-47 code e.g. "es"


class TextTranslateRequest(BaseModel):
    text: str
    language: str


class TranslatedPrescriptionResponse(BaseModel):
    language: str
    analysis: dict[str, Any]


class TranslatedTextResponse(BaseModel):
    language: str
    text: str


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("/languages", summary="List all supported languages")
def get_languages():
    return {
        "languages": [
            {"code": code, "name": name}
            for code, name in SUPPORTED_LANGUAGES.items()
        ]
    }


@router.post(
    "/prescription",
    response_model=TranslatedPrescriptionResponse,
    summary="Translate a prescription analysis dict into a target language",
)
async def translate_prescription_endpoint(
    body: PrescriptionTranslateRequest,
    user: dict = Depends(verify_token),
):
    if body.language not in SUPPORTED_LANGUAGES and len(body.language) > 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported language code: {body.language}",
        )

    try:
        translated = translate_prescription(body.analysis, body.language)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Translation failed: {str(exc)}",
        )

    return TranslatedPrescriptionResponse(language=body.language, analysis=translated)


@router.post(
    "/text",
    response_model=TranslatedTextResponse,
    summary="Translate a plain string into a target language",
)
async def translate_text_endpoint(
    body: TextTranslateRequest,
    user: dict = Depends(verify_token),
):
    try:
        translated = translate_text(body.text, body.language)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Translation failed: {str(exc)}",
        )

    return TranslatedTextResponse(language=body.language, text=translated)