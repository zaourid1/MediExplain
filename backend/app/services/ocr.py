"""
services/ocr.py
Extracts raw medical text from an image using Gemini Vision.

WHY Gemini for OCR?
- No Tesseract install needed (zero system deps)
- Handles handwriting, poor scan quality, and medical jargon better than Tesseract
- One API key covers both OCR and simplification
"""

import base64
import google.generativeai as genai
from app.config import settings

# Configure the Gemini client once at import time
genai.configure(api_key=settings.GEMINI_API_KEY)


def extract_text_from_image(image_bytes: bytes, mime_type: str = "image/jpeg") -> str:
    """
    Send image bytes to Gemini Vision and return the extracted text.

    Args:
        image_bytes: Raw bytes of the uploaded image file.
        mime_type:   MIME type e.g. "image/jpeg", "image/png", "image/webp".

    Returns:
        String of extracted text. Empty string if nothing found.
    """
    model = genai.GenerativeModel("gemini-1.5-flash")

    # Gemini accepts inline image data via the Part API
    image_part = {
        "inline_data": {
            "mime_type": mime_type,
            "data": base64.b64encode(image_bytes).decode("utf-8"),
        }
    }

    prompt = (
        "You are a medical document OCR system. "
        "Extract ALL text from this image exactly as it appears. "
        "Preserve line breaks and formatting. "
        "Do not summarize, interpret, or add anything. "
        "Just output the raw text from the image."
    )

    response = model.generate_content([prompt, image_part])
    return response.text.strip()
