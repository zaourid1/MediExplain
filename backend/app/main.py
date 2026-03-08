"""
MediExplain v2 - Main Application Entry Point

Full pipeline:
  Upload → Cloudinary → Gemini OCR/Analysis → ElevenLabs voice → Auth0 secured
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import explain, auth, voice

app = FastAPI(
    title="MediExplain API v2",
    description="AI-powered prescription explanation with voice output.",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # Lock to your frontend domain before going live
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(explain.router, prefix="/api", tags=["Explain"])
app.include_router(auth.router,    prefix="/api", tags=["Auth"])
app.include_router(voice.router, tags=["Voice"])


@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok", "service": "MediExplain v2"}
