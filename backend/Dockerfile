FROM python:3.11-slim

WORKDIR /workspace

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY backend/requirements.txt /workspace/backend/requirements.txt
RUN pip install --no-cache-dir -r /workspace/backend/requirements.txt

# Download NLTK data
RUN python -c "import nltk; nltk.download('vader_lexicon', quiet=True)"

# Copy backend & AI engine code
COPY backend /workspace/backend
COPY ai_engine /workspace/ai_engine

ENV PYTHONPATH=/workspace
EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
