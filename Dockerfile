# ── MediExplain v2 — Dockerfile ──────────────────────────────────────────
# Optimized for Vultr VPS / Vultr Kubernetes deployment

FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system deps (minimal)
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies first
# (Docker layer caching: only re-runs if requirements.txt changes)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY app/ ./app/

# Create a non-root user for security
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Expose the port Uvicorn will listen on
EXPOSE 8000

# Health check — Vultr load balancer uses this
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Start the server
# workers=2 is safe for a 1-2 vCPU Vultr instance
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
