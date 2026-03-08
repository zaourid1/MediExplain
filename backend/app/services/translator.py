"""
services/translator.py

Translate prescription/medicine text using Gemini.

Why Gemini for translation?
  - Already in the stack (no extra API keys)
  - Handles medical terminology better than generic translators
  - Can translate structured dicts in one shot (no per-field round trips)
"""

import json
import re
import google.generativeai as genai
from app.config import settings

genai.configure(api_key=settings.GEMINI_API_KEY)

# Use same model as gemini_service for consistency
_model = genai.GenerativeModel(settings.GEMINI_MODEL)

# ── Supported languages ───────────────────────────────────────────────────────

SUPPORTED_LANGUAGES = {
    "en": "English",
    "ar": "Arabic",
    "fr": "French",
    "es": "Spanish",
    "zh": "Mandarin (Simplified)",
    "hi": "Hindi",
}

# ── Core translator ───────────────────────────────────────────────────────────

def _build_prompt(target_language: str, content: dict | str) -> str:
    content_block = (
        json.dumps(content, ensure_ascii=False, indent=2)
        if isinstance(content, dict)
        else content
    )
    return f"""
You are a medical translation assistant. Translate the following content into {target_language}.

RULES:
1. Preserve ALL JSON keys exactly as-is — only translate the values.
2. Keep drug names, Rx numbers, dates, and numeric dosages in their original form.
3. Translate dosage instructions, frequency, warnings, and descriptive text naturally.
4. If a value is null, keep it null.
5. Respond ONLY with valid JSON (or plain text if input was plain text). No markdown, no explanation.

CONTENT TO TRANSLATE:
{content_block}
""".strip()


def _parse_response(text: str, original_was_dict: bool) -> dict | str:
    clean = re.sub(r"^```(?:json)?\s*|\s*```$", "", text.strip())
    if original_was_dict:
        return json.loads(clean)
    return clean


def translate_prescription(analysis: dict, target_language_code: str) -> dict:
    """
    Translate a full prescription analysis dict.

    Translates human-readable fields only:
      - frequency, dosage_form, warnings, raw_text, rejection_reason
    Leaves alone: drug_name, brand_name, rx_number, dates, dosage (numeric).

    Args:
        analysis:              The analysis dict from gemini_service.analyze_prescription()
        target_language_code:  BCP-47 code e.g. "es", "fr", "zh"

    Returns:
        Translated analysis dict (same shape, untranslatable fields unchanged).
    """
    if target_language_code == "en":
        return analysis  # No-op for English

    lang_name = SUPPORTED_LANGUAGES.get(
        target_language_code,
        target_language_code   # fallback: pass code directly to Gemini
    )

    # Only send the fields that benefit from translation
    TRANSLATABLE_FIELDS = {
        "frequency",
        "dosage_form",
        "warnings",
        "raw_text",
        "rejection_reason",
        "prescriber",       # sometimes includes titles/notes
        "pharmacy",
    }

    translatable = {
        k: v for k, v in analysis.items()
        if k in TRANSLATABLE_FIELDS and v is not None
    }

    if not translatable:
        return analysis

    prompt = _build_prompt(lang_name, translatable)

    response = _model.generate_content(
        prompt,
        generation_config=genai.types.GenerationConfig(
            temperature=0.1,
            max_output_tokens=2048,
        ),
    )

    try:
        translated_fields = _parse_response(response.text, original_was_dict=True)
    except json.JSONDecodeError as exc:
        raise ValueError(
            f"Gemini returned non-JSON translation: {response.text[:300]}"
        ) from exc

    # Merge translated fields back into the original (preserving untouched fields)
    return {**analysis, **translated_fields}


def translate_text(text: str, target_language_code: str) -> str:
    """
    Translate a plain string (e.g. a single warning or instruction).

    Args:
        text:                  Raw string to translate.
        target_language_code:  BCP-47 code.

    Returns:
        Translated string.
    """
    if target_language_code == "en":
        return text

    lang_name = SUPPORTED_LANGUAGES.get(target_language_code, target_language_code)
    prompt = _build_prompt(lang_name, text)

    response = _model.generate_content(
        prompt,
        generation_config=genai.types.GenerationConfig(
            temperature=0.1,
            max_output_tokens=1024,
        ),
    )

    return _parse_response(response.text, original_was_dict=False)