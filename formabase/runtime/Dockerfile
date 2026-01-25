# Forma Runtime Docker Image
# Multi-stage build for minimal image size

# Build stage
FROM python:3.12-slim as builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Create virtual environment
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install Python dependencies
COPY pyproject.toml .
COPY README.md .
COPY forma_runtime forma_runtime/

RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir . && \
    pip install --no-cache-dir "bcrypt>=4.0.0,<4.1.0"

# Runtime stage
FROM python:3.12-slim as runtime

WORKDIR /app

# Install runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

# Copy virtual environment from builder
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Create non-root user
RUN useradd --create-home --shell /bin/bash forma && \
    chown -R forma:forma /app

USER forma

# Default environment variables
ENV ENVIRONMENT=production \
    HOST=0.0.0.0 \
    PORT=8000 \
    DATABASE_URL=sqlite:///./app.db \
    JWT_SECRET=change-me-in-production \
    DEBUG=false

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import httpx; httpx.get('http://localhost:8000/health').raise_for_status()"

# Default command
CMD ["forma-runtime", "serve", "--host", "0.0.0.0", "--port", "8000"]
