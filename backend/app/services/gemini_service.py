"""
services/gemini_service.py

Step 2 of the pipeline: Analyze the prescription using Gemini Vision.

We do OCR + interpretation in a single Gemini call:
  - Extract the raw text from the image
  - Identify medication names, dosages, instructions
  - Simplify everything into patient-friendly language
  - Return structured JSON

Using gemini-1.5-flash: fast, cheap, handles images well.
"""

import base64
import json
import google.generativeai as genai
from app.config import settings

genai.configure(api_key=settings.GEMINI_API_KEY)

# Supported languages for the explanation output
SUPPORTED_LANGUAGES = {
    "en": "English",
    "es": "Spanish",
    "fr": "French",
    "de": "German",
    "hi": "Hindi",
    "zh": "Chinese (Simplified)",
    "ar": "Arabic",
    "pt": "Portuguese",
}


def analyze_prescription(image_bytes: bytes, mime_type: str, language_code: str = "en") -> dict:
    """
    Send prescription image to Gemini for full analysis.

    Args:
        image_bytes:   Raw bytes of the prescription image.
        mime_type:     e.g. "image/jpeg", "image/png"
        language_code: Output language code (default: "en" for English)

    Returns:
        Structured dict with:
          - raw_text:      Exact text extracted from the image
          - medications:   List of { name, dosage, frequency, purpose }
          - instructions:  Plain-language list of what the patient should do
          - warnings:      Side effects and cautions to be aware of
          - summary:       One paragraph overview for ElevenLabs to read aloud
          - terms:         Medical jargon with plain-English definitions
    """
    model = genai.GenerativeModel("gemini-1.5-flash")

    target_language = SUPPORTED_LANGUAGES.get(language_code, "English")

    image_part = {
        "inline_data": {
            "mime_type": mime_type,
            "data": base64.b64encode(image_bytes).decode("utf-8"),
        }
    }

    prompt = f"""
You are MediExplain, an AI healthcare assistant helping patients understand their prescriptions.
Your response must be in {target_language}.

Analyze this prescription image and respond ONLY with a valid JSON object.
No markdown, no code fences, no extra text — just the raw JSON.

Return this exact structure:
{{
  "raw_text": "Exact text as it appears in the image",
  "medications": [
    {{
      "name": "Medication name",
      "dosage": "e.g. 500mg",
      "frequency": "e.g. twice daily",
      "purpose": "Plain English: what this medicine does"
    }}
  ],
  "instructions": [
    "Step-by-step instruction in plain, simple language"
  ],
  "warnings": [
    "Side effects or important cautions"
  ],
  "summary": "A warm, reassuring 2-3 sentence paragraph that a patient can listen to. Cover what was prescribed and the most important instructions.",
  "terms": [
    {{ "term": "Medical term", "definition": "Simple definition" }}
  ]
}}

Rules:
- Use simple words — aim for a Grade 6 reading level
- Be warm and reassuring, not clinical or alarming
- All text output must be in {target_language}
- If the image is not a prescription, set raw_text to "Not a prescription" and leave all arrays empty
- Never invent medications or instructions not visible in the image
"""

    response = model.generate_content([prompt, image_part])
    raw = response.text.strip()

    # Strip accidental markdown fences
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.strip()

    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        # Fallback if Gemini returns unexpected format
        return {
            "raw_text": raw,
            "medications": [],
            "instructions": [],
            "warnings": [],
            "summary": raw,
            "terms": [],
        }
 