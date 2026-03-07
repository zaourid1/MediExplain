"""
routers/explain.py
The core endpoint: POST /api/explain

Accepts an image, runs OCR → Simplification → (optional) Audio → returns JSON.
"""

from fastapi import APIRouter, File, UploadFile, HTTPException, Query
from fastapi.responses import JSONResponse

from app.services.ocr import extract_text_from_image
from app.services.simplifier import simplify_medical_text
from app.services.audio import generate_audio, build_speakable_text
from app.services.cloudinary_upload import upload_image
from app.config import settings

router = APIRouter()

# Allowed image types for security
ALLOWED_MIME_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/tiff",
}


@router.post("/explain")
async def explain_medical_image(
    file: UploadFile = File(..., description="Medical image file (JPG, PNG, WEBP)"),
    include_audio: bool = Query(default=False, description="Set true to get base64 audio"),
):
    """
    Main endpoint. Upload a medical image and receive:
    - raw_text:    Extracted text from the image
    - simplified:  Plain-language breakdown (summary, instructions, warnings, terms)
    - audio_b64:   (optional) Base64 MP3 audio of the explanation
    - image_url:   (optional) Cloudinary URL of the uploaded image
    """

    # --- 1. Validate file type ---
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {file.content_type}. Upload JPG, PNG, or WEBP.",
        )

    # --- 2. Read file bytes ---
    image_bytes = await file.read()

    # Guard against huge files
    max_bytes = settings.MAX_FILE_SIZE_MB * 1024 * 1024
    if len(image_bytes) > max_bytes:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Max size is {settings.MAX_FILE_SIZE_MB}MB.",
        )

    # --- 3. OCR: extract raw text from image ---
    try:
        raw_text = extract_text_from_image(image_bytes, mime_type=file.content_type)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OCR failed: {str(e)}")

    if not raw_text:
        raise HTTPException(
            status_code=422,
            detail="No text could be extracted from the image. Try a clearer photo.",
        )

    # --- 4. Simplify the extracted text with Gemini ---
    try:
        simplified = simplify_medical_text(raw_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simplification failed: {str(e)}")

    # --- 5. Optional: Generate audio with ElevenLabs ---
    audio_b64 = None
    if include_audio:
        try:
            speakable = build_speakable_text(simplified)
            audio_b64 = generate_audio(speakable)
        except Exception as e:
            # Audio failure is non-fatal — still return the text response
            audio_b64 = None
            print(f"[WARN] Audio generation failed: {e}")

    # --- 6. Optional: Upload image to Cloudinary ---
    image_url = None
    try:
        image_url = upload_image(image_bytes, filename=file.filename or "upload")
    except Exception as e:
        print(f"[WARN] Cloudinary upload failed: {e}")

    # --- 7. Return structured response ---
    return JSONResponse(
        content={
            "success": True,
            "raw_text": raw_text,
            "simplified": simplified,
            "audio_b64": audio_b64,      # None if not requested or ElevenLabs not configured
            "image_url": image_url,      # None if Cloudinary not configured
            "meta": {
                "filename": file.filename,
                "file_size_kb": round(len(image_bytes) / 1024, 1),
                "audio_included": audio_b64 is not None,
            },
        }
    )


@router.post("/explain/text")
async def explain_raw_text(body: dict):
    """
    Bonus endpoint: Send raw text directly (skip OCR).
    Useful if your frontend already has the text.

    Body: { "text": "your medical text here", "include_audio": false }
    """
    raw_text = body.get("text", "").strip()
    include_audio = body.get("include_audio", False)

    if not raw_text:
        raise HTTPException(status_code=400, detail="Field 'text' is required and cannot be empty.")

    try:
        simplified = simplify_medical_text(raw_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simplification failed: {str(e)}")

    audio_b64 = None
    if include_audio:
        try:
            speakable = build_speakable_text(simplified)
            audio_b64 = generate_audio(speakable)
        except Exception as e:
            print(f"[WARN] Audio generation failed: {e}")

    return JSONResponse(
        content={
            "success": True,
            "raw_text": raw_text,
            "simplified": simplified,
            "audio_b64": audio_b64,
        }
    )
