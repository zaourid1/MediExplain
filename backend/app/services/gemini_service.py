"""
services/gemini_service.py

Step 2 of the pipeline: Analyze the uploaded image with Gemini Vision.

Responsibilities:
  - Determine if the image is a prescription bottle/label
  - If yes, extract structured fields + all raw text
  - Return a clean, typed response for the API layer
"""

import json
import re
import google.generativeai as genai
import httpx
from app.config import settings

genai.configure(api_key=settings.GEMINI_API_KEY)

# Model with free-tier quota (GEMINI_MODEL in .env to override)
# gemini-2.0-flash has limit: 0 on free tier; 2.5-flash-lite has 1000 RPD
_model = genai.GenerativeModel(settings.GEMINI_MODEL)

SUPPORTED_LANGUAGES = {
    "en": "English",
    "es": "Spanish",
    "fr": "French",
    "de": "German",
    "hi": "Hindi",
    "zh": "Chinese",
    "ar": "Arabic",
    "pt": "Portuguese",
}

# ── Prompt ────────────────────────────────────────────────────────────────────

_SYSTEM_PROMPT = """
You are a medical label extraction assistant. Your job is to analyze images and
determine whether they show a prescription medication bottle or label, then
extract all available information.

RULES:
1. Only flag is_prescription=true if you can clearly see a pharmacy prescription
   label (patient name, Rx number, or dispensing pharmacy details) OR a
   medication bottle/packaging with clinical dosage instructions.
2. Be conservative — a photo of pills without a label is NOT a prescription.
3. Extract EVERY piece of visible text verbatim in raw_text, preserving line breaks.
4. For structured fields, use null if the field is not visible/legible.
5. Respond ONLY with valid JSON — no markdown, no explanation, no code fences.

JSON schema to return:
{
  "is_prescription": boolean,
  "confidence": "high" | "medium" | "low",
  "rejection_reason": string | null,       // why it's not a prescription (if applicable)
  "drug_name": string | null,
  "brand_name": string | null,
  "generic_name": string | null,
  "dosage": string | null,                 // e.g. "10 mg"
  "dosage_form": string | null,            // e.g. "tablet", "capsule", "liquid"
  "frequency": string | null,              // e.g. "Take 1 tablet twice daily"
  "quantity": string | null,               // e.g. "30 tablets"
  "refills": string | null,
  "prescriber": string | null,
  "patient_name": string | null,
  "pharmacy": string | null,
  "rx_number": string | null,
  "fill_date": string | null,
  "expiry_date": string | null,
  "warnings": [string],                    // any warning labels visible
  "raw_text": string                       // ALL visible text, verbatim
}
"""

# ── Helpers ───────────────────────────────────────────────────────────────────

def _fetch_image_bytes(url: str) -> bytes:
    """Download image bytes from a Cloudinary CDN URL."""
    with httpx.Client(timeout=15) as client:
        response = client.get(url)
        response.raise_for_status()
        return response.content


def _parse_gemini_response(text: str) -> dict:
    """
    Safely parse JSON from Gemini's response.
    Strips any accidental markdown fences just in case.
    """
    # Strip ```json ... ``` if present
    clean = re.sub(r"^```(?:json)?\s*|\s*```$", "", text.strip())
    return json.loads(clean)


# ── Public API ────────────────────────────────────────────────────────────────

def analyze_prescription(image_url: str) -> dict:
    """
    Analyze a prescription image hosted on Cloudinary.

    Args:
        image_url: Public HTTPS URL from Cloudinary.

    Returns:
        Parsed dict matching the JSON schema above.

    Raises:
        ValueError: If Gemini returns unparseable output.
        httpx.HTTPError: If the image URL is unreachable.
    """
    # Download image and wrap for Gemini
    image_bytes = _fetch_image_bytes(image_url)
    image_part = {
        "mime_type": "image/jpeg",   # Cloudinary serves JPEG by default
        "data": image_bytes,
    }

    response = _model.generate_content(
        [_SYSTEM_PROMPT, image_part],
        generation_config=genai.types.GenerationConfig(
            temperature=0.1,          # Low temp → deterministic extraction
            max_output_tokens=2048,
        ),
    )

    raw_text = response.text
    try:
        return _parse_gemini_response(raw_text)
    except json.JSONDecodeError as exc:
        raise ValueError(
            f"Gemini returned non-JSON output: {raw_text[:300]}"
        ) from exc