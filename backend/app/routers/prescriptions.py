"""
routers/prescriptions.py

POST /api/prescriptions/analyze

Full pipeline:
  1. Receive image upload from authenticated user
  2. Upload to Cloudinary (permanent URL, per-user folder)
  3. Send URL to Gemini Vision for prescription detection + extraction
  4. Return structured result to frontend
"""

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from pydantic import BaseModel
from typing import Optional

from app.middleware.auth0 import verify_token
from app.services.cloudinary_service import upload_prescription
from app.services.gemini_service import analyze_prescription

router = APIRouter(prefix="/api/prescriptions", tags=["prescriptions"])

# ── Response Models ────────────────────────────────────────────────────────────

class CloudinaryMeta(BaseModel):
    url: str
    public_id: str
    width: Optional[int]
    height: Optional[int]


class PrescriptionAnalysis(BaseModel):
    is_prescription: bool
    confidence: str                        # "high" | "medium" | "low"
    rejection_reason: Optional[str]
    drug_name: Optional[str]
    brand_name: Optional[str]
    generic_name: Optional[str]
    dosage: Optional[str]
    dosage_form: Optional[str]
    frequency: Optional[str]
    quantity: Optional[str]
    refills: Optional[str]
    prescriber: Optional[str]
    patient_name: Optional[str]
    pharmacy: Optional[str]
    rx_number: Optional[str]
    fill_date: Optional[str]
    expiry_date: Optional[str]
    warnings: list[str]
    raw_text: str


class AnalyzeResponse(BaseModel):
    image: CloudinaryMeta
    analysis: PrescriptionAnalysis


# ── Endpoint ──────────────────────────────────────────────────────────────────

ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp", "image/heic"}
MAX_FILE_SIZE_MB = 10


@router.post(
    "/analyze",
    response_model=AnalyzeResponse,
    status_code=status.HTTP_200_OK,
    summary="Upload a prescription image and extract medication details",
)
async def analyze_prescription_image(
    file: UploadFile = File(..., description="Prescription image (JPEG, PNG, WEBP)"),
    user: dict = Depends(verify_token),
):
    # ── 1. Validate file ───────────────────────────────────────────────────────
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported file type: {file.content_type}. Use JPEG, PNG, or WEBP.",
        )

    image_bytes = await file.read()

    if len(image_bytes) > MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds {MAX_FILE_SIZE_MB} MB limit.",
        )

    user_id = user["sub"].replace("|", "_")   # Auth0 user ID (sanitize for Cloudinary folder)

    # ── 2. Upload to Cloudinary ────────────────────────────────────────────────
    try:
        cloudinary_result = upload_prescription(
            image_bytes=image_bytes,
            user_id=user_id,
            filename=file.filename or "prescription",
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Image upload failed: {str(exc)}",
        )

    # ── 3. Analyze with Gemini ─────────────────────────────────────────────────
    try:
        analysis_raw = analyze_prescription(cloudinary_result["url"])
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Analysis parsing failed: {str(exc)}",
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Vision analysis failed: {str(exc)}",
        )

    # ── 4. Return structured response ─────────────────────────────────────────
    return AnalyzeResponse(
        image=CloudinaryMeta(**cloudinary_result),
        analysis=PrescriptionAnalysis(
            warnings=analysis_raw.get("warnings", []),
            raw_text=analysis_raw.get("raw_text", ""),
            **{
                k: analysis_raw.get(k)
                for k in PrescriptionAnalysis.model_fields
                if k not in ("warnings", "raw_text")
            },
        ),
    )