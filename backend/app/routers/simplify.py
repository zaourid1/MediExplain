"""
simplify.py

Simplifies complex text into language understandable by a young child
(default: 5-year-old) using Google Gemini.
"""

from typing import Optional
import time
import logging
from google import genai
import os

# Configure Gemini
# Public API
__all__ = ["simplify_text"]

# Configuration
DEFAULT_MODEL = "gemini-2.0-flash"
DEFAULT_TARGET_AGE = 5
MAX_RETRIES = 3
INITIAL_BACKOFF = 0.5

logger = logging.getLogger(__name__)


class GeminiError(RuntimeError):
    pass


def _build_simplify_prompt(text: str, target_age: int = DEFAULT_TARGET_AGE) -> str:
    return (
        f"You are a helpful assistant that explains things to children.\n"
        f"Simplify the following text so a {target_age}-year-old can understand it.\n"
        f"Use very short sentences and simple words.\n\n"
        f"Text:\n{text.strip()}\n\n"
        f"Explain it simply:"
    )


def _call_gemini(prompt: str, model: str = DEFAULT_MODEL) -> str:
    try:
        client = genai.Client(api_key="YOUR_API_KEY")

        response = client.models.generate_content(
            model=model,
            contents=prompt,
        )

        return response.text

    except Exception as e:
        raise GeminiError(f"Gemini API failed: {e}")


def simplify_text(text: str, target_age: int = DEFAULT_TARGET_AGE, model: str = DEFAULT_MODEL) -> str:
    if not isinstance(text, str) or not text.strip():
        raise ValueError("`text` must be a non-empty string.")

    if not isinstance(target_age, int) or target_age <= 0:
        raise ValueError("`target_age` must be a positive integer.")

    prompt = _build_simplify_prompt(text, target_age)

    backoff = INITIAL_BACKOFF
    last_exc: Optional[Exception] = None

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            logger.debug("Calling Gemini (attempt %d)", attempt)

            result = _call_gemini(prompt, model)

            if not result.strip():
                raise GeminiError("Empty response from Gemini")

            return result.strip()

        except Exception as exc:
            last_exc = exc
            logger.warning("Gemini call failed on attempt %d: %s", attempt, exc)

            if attempt < MAX_RETRIES:
                time.sleep(backoff)
                backoff *= 2

    raise GeminiError(f"Failed to get a valid response from Gemini: {last_exc}")


if __name__ == "__main__":
    complex_text = input("Enter complex text:\n")

    result = simplify_text(complex_text)

    print("\nSimplified version:\n")
    print(result)