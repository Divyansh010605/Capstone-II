FROM python:3.11-slim

WORKDIR /workspace

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY ai_engine/requirements.txt /workspace/ai_engine/requirements.txt
RUN pip install --no-cache-dir -r /workspace/ai_engine/requirements.txt

COPY ai_engine /workspace/ai_engine

ENV PYTHONPATH=/workspace
EXPOSE 8001

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8001/health || exit 1

CMD ["uvicorn", "ai_engine.api:app", "--host", "0.0.0.0", "--port", "8001"]
