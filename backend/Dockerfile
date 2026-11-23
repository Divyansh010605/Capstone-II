FROM python:3.11-slim

WORKDIR /workspace

# Install only curl for container healthcheck and purge apt cache
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/* /var/cache/apt/archives/*

# Install dependencies using CPU PyTorch wheels (avoids ~8GB of unused CUDA binaries)
COPY backend/requirements.txt /workspace/backend/requirements.txt
RUN pip install --no-cache-dir --extra-index-url https://download.pytorch.org/whl/cpu -r /workspace/backend/requirements.txt

# Download NLTK sentiment lexicon
RUN python -c "import nltk; nltk.download('vader_lexicon', quiet=True)"

# Copy application source code
COPY backend /workspace/backend
COPY ai_engine /workspace/ai_engine

ENV PYTHONPATH=/workspace
EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
