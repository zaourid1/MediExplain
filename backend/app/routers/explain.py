"""
routers/explain.py

POST /api/explain  — Full pipeline, Auth0 protected.

Flow:
  1. Validate + read uploaded file
  2. Upload to Cloudinary → get hosted URL
  3. Gemini analyzes prescription → structured explanation
  4. ElevenLabs generates audio → base64 MP3
  5. Return everything as JSON
"""

from fastapi import APIRouter, File, UploadFile, HTTPException, Query, Depends
from fastapi.responses import JSONResponse

from app.services.cloudinary_service   import upload_prescription
from app.services.gemini_service       import analyze_prescription, SUPPORTED_LANGUAGES
from app.services.elevenlabs_service   import generate_voice, build_voice_script
from app.middleware.auth0              import verify_token
from app.config                        import settings

router = APIRouter()

ALLOWED_MIME_TYPES = {
    "image/jpeg", "image/jpg", "image/png",
    "image/webp", "image/gif", "image/tiff",
}


@router.post("/explain")
async def explain_prescription(
    file: UploadFile = File(..., description="Prescription image (JPG, PNG, WEBP)"),
    language: str    = Query(default="en", description="Output language code: en, es, fr, de, hi, zh, ar, pt"),
    user: dict       = Depends(verify_token),   # ← Auth0 JWT required
):
    """
    Full pipeline endpoint. Requires a valid Auth0 Bearer token.

    Returns:
    - image_url:   Cloudinary-hosted URL of the uploaded prescription
    - analysis:    Structured explanation (medications, instructions, warnings, terms)
    - audio_b64:   Base64 MP3 of the spoken explanation
    - language:    Language code used for the explanation
    """

    # ── Validate language ──────────────────────────────────────────────────
    if language not in SUPPORTED_LANGUAGES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported language '{language}'. Supported: {list(SUPPORTED_LANGUAGES.keys())}",
        )

    # ── Validate file type ─────────────────────────────────────────────────
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{file.content_type}'. Upload JPG, PNG, or WEBP.",
        )

    # ── Read file bytes ────────────────────────────────────────────────────
    image_bytes = await file.read()

    max_bytes = settings.MAX_FILE_SIZE_MB * 1024 * 1024
    if len(image_bytes) > max_bytes:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum is {settings.MAX_FILE_SIZE_MB}MB.",
        )

    # ── Auth0 user ID (identifies the user for Cloudinary folder) ─────────
    # Auth0 stores user ID in the "sub" claim: "auth0|abc123"
    user_id = user.get("sub", "anonymous").replace("|", "_")

    # ── STEP 1: Upload to Cloudinary ──────────────────────────────────────
    try:
        cloudinary_result = upload_prescription(
            image_bytes,
            user_id=user_id,
            filename=file.filename or "prescription.jpg",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image upload failed: {str(e)}")

    # ── STEP 2: Gemini prescription analysis ──────────────────────────────
    try:
        analysis = analyze_prescription(
            image_bytes,
            mime_type=file.content_type,
            language_code=language,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prescription analysis failed: {str(e)}")

    if analysis.get("raw_text") == "Not a prescription":
        raise HTTPException(
            status_code=422,
            detail="The uploaded image does not appear to be a prescription. Please try again.",
        )

    # ── STEP 3: ElevenLabs voice generation ───────────────────────────────
    try:
        voice_script = build_voice_script(analysis)
        audio_b64 = generate_voice(voice_script, language_code=language)
    except Exception as e:
        # Voice failure is non-fatal — still return text explanation
        audio_b64 = None
        print(f"[WARN] Audio generation failed: {e}")

    # ── STEP 4: Return full response ──────────────────────────────────────
    return JSONResponse(content={
        "success":   True,
        "image_url": cloudinary_result["url"],
        "analysis":  analysis,
        "audio_b64": audio_b64,
        "language":  language,
        "meta": {
            "user_id":       user_id,
            "filename":      file.filename,
            "file_size_kb":  round(len(image_bytes) / 1024, 1),
            "audio_included": audio_b64 is not None,
            "cloudinary_id": cloudinary_result["public_id"],
        },
    })


@router.get("/languages", summary="List supported languages")
def list_languages():
    """Returns all language codes and names supported by the explanation engine."""
    return {
        "supported_languages": [
            {"code": code, "name": name}
            for code, name in SUPPORTED_LANGUAGES.items()
        ]
    }
