"""
middleware/auth0.py

Verifies Auth0 JWT tokens on every protected endpoint.

How it works:
  1. Client logs in via Auth0 (on frontend)
  2. Auth0 returns an access_token (JWT)
  3. Frontend sends: Authorization: Bearer <token>
  4. This middleware fetches Auth0's public keys and verifies the signature
  5. If valid → request continues; if invalid → 401

No session storage needed — JWTs are stateless.
"""

import httpx
from functools import lru_cache
from jose import jwt, JWTError                   # python-jose
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.config import settings

# HTTPBearer extracts the token from the "Authorization: Bearer <token>" header
bearer_scheme = HTTPBearer()


@lru_cache(maxsize=1)
def get_jwks() -> dict:
    """
    Fetch Auth0's JSON Web Key Set (public keys used to verify tokens).
    Cached so we don't hit Auth0 on every single request.
    """
    url = f"https://{settings.AUTH0_DOMAIN}/.well-known/jwks.json"
    response = httpx.get(url, timeout=10.0)
    response.raise_for_status()
    return response.json()


def verify_token(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)) -> dict:
    """
    FastAPI dependency — add to any endpoint to require authentication.

    Usage:
        @router.get("/protected")
        def protected_route(user: dict = Depends(verify_token)):
            return {"user_id": user["sub"]}

    Returns the decoded JWT payload (contains user ID as "sub").
    Raises HTTP 401 if token is missing, expired, or invalid.
    """
    token = credentials.credentials

    try:
        # Get the key ID from the token header so we can find the right public key
        unverified_header = jwt.get_unverified_header(token)
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token header.",
        )

    # Find the matching public key from Auth0's JWKS
    jwks = get_jwks()
    rsa_key = {}
    for key in jwks["keys"]:
        if key["kid"] == unverified_header.get("kid"):
            rsa_key = {
                "kty": key["kty"],
                "kid": key["kid"],
                "use": key["use"],
                "n":   key["n"],
                "e":   key["e"],
            }
            break

    if not rsa_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unable to find matching public key.",
        )

    try:
        payload = jwt.decode(
            token,
            rsa_key,
            algorithms=["RS256"],
            audience=settings.AUTH0_AUDIENCE,
            issuer=f"https://{settings.AUTH0_DOMAIN}/",
        )
        return payload

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired. Please log in again.",
        )
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token validation failed: {str(e)}",
        )
