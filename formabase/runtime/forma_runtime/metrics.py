"""Prometheus metrics for Forma Runtime."""

from typing import Callable
import time

from prometheus_client import Counter, Histogram, Gauge, Info, REGISTRY, generate_latest
from fastapi import FastAPI, Request, Response
from starlette.middleware.base import BaseHTTPMiddleware


# Application info
app_info = Info("forma_runtime", "Forma Runtime application information")

# Request metrics
http_requests_total = Counter(
    "http_requests_total",
    "Total number of HTTP requests",
    ["method", "path", "status_code"],
)

http_request_duration_seconds = Histogram(
    "http_request_duration_seconds",
    "HTTP request duration in seconds",
    ["method", "path"],
    buckets=(0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10),
)

http_requests_in_progress = Gauge(
    "http_requests_in_progress",
    "Number of HTTP requests currently in progress",
    ["method", "path"],
)

# Database metrics
db_queries_total = Counter(
    "db_queries_total",
    "Total number of database queries",
    ["collection", "operation"],
)

db_query_duration_seconds = Histogram(
    "db_query_duration_seconds",
    "Database query duration in seconds",
    ["collection", "operation"],
    buckets=(0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1),
)

# Authentication metrics
auth_attempts_total = Counter(
    "auth_attempts_total",
    "Total number of authentication attempts",
    ["type", "success"],
)

# Multi-tenant metrics
registered_projects = Gauge(
    "registered_projects_total",
    "Number of registered projects (multi-tenant mode)",
)


class PrometheusMiddleware(BaseHTTPMiddleware):
    """Middleware to collect HTTP request metrics."""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        method = request.method
        path = self._normalize_path(request.url.path)

        # Track in-progress requests
        http_requests_in_progress.labels(method=method, path=path).inc()

        start_time = time.perf_counter()
        try:
            response = await call_next(request)
            status_code = response.status_code
        except Exception:
            status_code = 500
            raise
        finally:
            duration = time.perf_counter() - start_time

            # Record metrics
            http_requests_total.labels(
                method=method,
                path=path,
                status_code=status_code,
            ).inc()

            http_request_duration_seconds.labels(
                method=method,
                path=path,
            ).observe(duration)

            http_requests_in_progress.labels(method=method, path=path).dec()

        return response

    def _normalize_path(self, path: str) -> str:
        """Normalize path to reduce cardinality."""
        # Replace numeric IDs with placeholder
        import re
        path = re.sub(r"/\d+", "/{id}", path)
        # Replace UUIDs with placeholder
        path = re.sub(r"/[a-f0-9-]{36}", "/{uuid}", path)
        return path


def setup_metrics(app: FastAPI, version: str = "0.1.0") -> None:
    """
    Set up Prometheus metrics for a FastAPI application.

    Args:
        app: FastAPI application instance
        version: Application version
    """
    # Set application info
    app_info.info({
        "version": version,
        "name": "forma-runtime",
    })

    # Add metrics middleware
    app.add_middleware(PrometheusMiddleware)

    # Add metrics endpoint
    @app.get("/metrics", include_in_schema=False)
    async def metrics():
        return Response(
            content=generate_latest(REGISTRY),
            media_type="text/plain; version=0.0.4; charset=utf-8",
        )


def track_db_query(collection: str, operation: str):
    """
    Context manager to track database query metrics.

    Usage:
        with track_db_query("user", "select"):
            result = await session.execute(query)
    """
    class QueryTracker:
        def __init__(self):
            self.start_time = None

        def __enter__(self):
            self.start_time = time.perf_counter()
            return self

        def __exit__(self, exc_type, exc_val, exc_tb):
            duration = time.perf_counter() - self.start_time
            db_queries_total.labels(collection=collection, operation=operation).inc()
            db_query_duration_seconds.labels(
                collection=collection, operation=operation
            ).observe(duration)

    return QueryTracker()


def track_auth_attempt(auth_type: str, success: bool) -> None:
    """
    Track an authentication attempt.

    Args:
        auth_type: Type of auth (login, register, oauth, refresh)
        success: Whether the attempt was successful
    """
    auth_attempts_total.labels(
        type=auth_type,
        success=str(success).lower(),
    ).inc()


def set_registered_projects(count: int) -> None:
    """
    Set the number of registered projects.

    Args:
        count: Number of registered projects
    """
    registered_projects.set(count)
