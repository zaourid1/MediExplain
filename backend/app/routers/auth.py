"""
routers/auth.py

Auth-related endpoints.

The actual login flow happens on the FRONTEND using Auth0's SDK.
This backend only:
  1. Verifies tokens (middleware/auth0.py)
  2. Exposes a /me endpoint to return the current user's profile
"""

from fastapi import APIRouter, Depends
from app.middleware.auth0 import verify_token

router = APIRouter()


@router.get("/me", summary="Get current user profile")
def get_current_user(user: dict = Depends(verify_token)):
    """
    Returns the decoded Auth0 JWT payload for the authenticated user.

    Frontend usage:
      const res = await fetch('/api/me', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

    The "sub" field is the Auth0 user ID: e.g. "auth0|64abc123..."
    """
    return {
        "user_id":    user.get("sub"),
        "email":      user.get("email"),
        "name":       user.get("name"),
        "picture":    user.get("picture"),
        "auth_time":  user.get("iat"),
        "expires_at": user.get("exp"),
    }
