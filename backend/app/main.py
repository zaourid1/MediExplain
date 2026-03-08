"""
MediExplain v2 - Main Application Entry Point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import explain, auth, voice, prescriptions, translation

# ✅ Define app FIRST
app = FastAPI(
    title="MediExplain API v2",
    description="AI-powered prescription explanation with voice output.",
    version="2.0.0",
)

# ✅ Then add middleware ONCE
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # lock to your frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Then include routers
app.include_router(explain.router,        prefix="/api", tags=["Explain"])
app.include_router(auth.router,           prefix="/api", tags=["Auth"])
app.include_router(voice.router,                         tags=["Voice"])
app.include_router(prescriptions.router,                 tags=["Prescriptions"])
app.include_router(translation.router, tags=["Translation"])


@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok", "service": "MediExplain v2"}