FROM python:3.12-slim

# Install Node.js 20
RUN apt-get update && \
    apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Python dependencies (own layer for cache)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Frontend dependencies (own layer for cache)
COPY frontend/package.json ./frontend/
RUN cd frontend && npm install --legacy-peer-deps

# Build frontend
COPY frontend/ ./frontend/
RUN cd frontend && npm run build

# Copy backend
COPY app/ ./app/
COPY pytest.ini .

EXPOSE 8000

CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 1
