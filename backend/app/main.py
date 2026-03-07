"""
MediExplain - Main FastAPI Application
Entry Point: starts the server and registers all routes
"""

#FastApi is a tool that will let us build APIs faster.
#CORS = Cross origin resource sharing, allows frontend to take our backend
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import explain

#Main APP
app = FastAPI(
    title="MediExplain API",
    description="Upload a medical image, get plain-language explanation + optional audio.",
    version="1.0.0",
)

# Allow all origins during development/hackathon demo.
# Lock this down to your frontend URL in production.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(explain.router, prefix="/api", tags=["Explain"])


@app.get("/health", tags=["Health"])
def health_check():
    """Quick ping to verify the server is running."""
    return {"status": "ok", "service": "MediExplain"}
