# ── Backend Dockerfile ────────────────────────────────────────────────────────
# Builds the Flask + ML API container for Smart Irrigation System.
# Uses python:3.11-slim to keep the image small.

FROM python:3.11-slim

# Set working directory inside the container
WORKDIR /app

# Install system packages needed by numpy/pandas/scikit-learn
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy dependency manifest first so Docker caches this layer
# (rebuilds only when requirements.txt changes, not on every code change)
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source code
COPY . .

# Create directory for ML model artifacts
RUN mkdir -p model_artifacts

# Expose the API port
EXPOSE 5000

# Health check — Docker will restart the container if this fails
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:5000/api/health || exit 1

# Start the Flask server using Gunicorn (production WSGI server)
# 2 worker processes, each handling requests concurrently
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "2", "--timeout", "60", "app:app"]
