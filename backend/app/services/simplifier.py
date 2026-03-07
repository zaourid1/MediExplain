"""
services/simplifier.py
Takes raw medical text and rewrites it in plain, accessible English using Gemini.
"""

import google.generativeai as genai
from app.config import settings

genai.configure(api_key=settings.GEMINI_API_KEY)


def simplify_medical_text(raw_text: str) -> dict:
    """
    Send raw OCR text to Gemini and get a structured plain-language explanation.

    Args:
        raw_text: The text extracted from the medical document/image.

    Returns:
        Dict with keys:
          - summary:       1-2 sentence overview
          - instructions:  List of plain-language action items (what the patient should do)
          - warnings:      Any warnings or things to watch out for
          - terms:         List of { term, definition } for medical jargon found
    """
    model = genai.GenerativeModel("gemini-1.5-flash")

    prompt = f"""
You are a compassionate medical translator helping patients understand their documents.

Given the following raw medical text, respond ONLY with a valid JSON object — no markdown, no code fences.

Medical text:
\"\"\"
{raw_text}
\"\"\"

Return this exact JSON structure:
{{
  "summary": "1-2 sentence plain English overview of what this document is about",
  "instructions": [
    "Step 1: ...",
    "Step 2: ..."
  ],
  "warnings": [
    "Any side effects or cautions mentioned"
  ],
  "terms": [
    {{ "term": "Medical term", "definition": "Plain English definition" }}
  ]
}}

Rules:
- Use simple words a 10-year-old could understand
- Be warm and reassuring, not clinical
- If a section has no content, return an empty list []
- Do NOT include any text outside the JSON
"""

    response = model.generate_content(prompt)
    text = response.text.strip()

    # Strip markdown code fences if Gemini adds them anyway
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
        text = text.strip()

    import json
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        # Fallback: return raw text wrapped in our structure
        return {
            "summary": text,
            "instructions": [],
            "warnings": [],
            "terms": [],
        }
