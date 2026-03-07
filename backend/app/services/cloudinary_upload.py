"""
services/cloudinary_upload.py
Optional: Upload the image to Cloudinary and return a hosted URL.
Only runs if CLOUDINARY_* keys are set in .env.

Frontend can use this URL to display the original image alongside the explanation.
"""

import cloudinary
import cloudinary.uploader
from app.config import settings


def upload_image(image_bytes: bytes, filename: str = "medical_doc") -> str | None:
    """
    Upload image bytes to Cloudinary.

    Returns:
        Public URL string, or None if Cloudinary is not configured.
    """
    if not settings.CLOUDINARY_CLOUD_NAME:
        return None

    # Configure the SDK
    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET,
        secure=True,
    )

    result = cloudinary.uploader.upload(
        image_bytes,
        public_id=f"mediexplain/{filename}",
        folder="mediexplain",
        resource_type="image",
        overwrite=True,
    )

    return result.get("secure_url")
