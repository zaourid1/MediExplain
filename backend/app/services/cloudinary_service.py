"""
services/cloudinary_service.py

Step 1 of the pipeline: Upload the prescription image to Cloudinary.

Why Cloudinary first?
  - Gives us a permanent, CDN-hosted URL for the image
  - Frontend can display the original image alongside the explanation
  - Gemini can also analyze directly from URL (no re-uploading)
  - Images are organized per user for easy retrieval
"""

import cloudinary
import cloudinary.uploader
from app.config import settings

# Configure once at import time
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True,
)


def upload_prescription(image_bytes: bytes, user_id: str, filename: str = "prescription") -> dict:
    """
    Upload raw image bytes to Cloudinary.

    Args:
        image_bytes: Raw bytes from the uploaded file.
        user_id:     Auth0 user ID — used to organise uploads per user.
        filename:    Original filename (used as the public_id base).

    Returns:
        Dict with:
          - url:        The public HTTPS URL of the uploaded image
          - public_id:  Cloudinary resource identifier (for future deletion/updates)
          - width:      Image width in pixels
          - height:     Image height in pixels
    """
    # Sanitize filename — remove extension and special chars
    clean_name = filename.rsplit(".", 1)[0].replace(" ", "_")

    # Organize in Cloudinary: mediexplain/{user_id}/{filename}
    public_id = f"mediexplain/{user_id}/{clean_name}"

    result = cloudinary.uploader.upload(
        image_bytes,
        public_id=public_id,
        folder="mediexplain",
        resource_type="image",
        overwrite=True,
        # Auto-optimize for faster loading
        transformation=[
            {"quality": "auto", "fetch_format": "auto"}
        ],
    )

    return {
        "url":       result["secure_url"],
        "public_id": result["public_id"],
        "width":     result.get("width"),
        "height":    result.get("height"),
    }
