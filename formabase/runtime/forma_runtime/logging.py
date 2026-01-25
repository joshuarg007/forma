"""Structured logging configuration for Forma Runtime."""

import logging
import sys
from typing import Any

import structlog
from structlog.processors import JSONRenderer, TimeStamper, add_log_level

from .config import settings


def setup_logging() -> None:
    """Configure structured logging for the application."""

    # Determine log level from settings
    log_level = logging.DEBUG if settings.debug else logging.INFO

    # Configure standard library logging
    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=log_level,
    )

    # Processors for structlog
    processors: list[Any] = [
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
    ]

    # Use JSON in production, colored output in development
    if settings.debug:
        processors.append(structlog.dev.ConsoleRenderer(colors=True))
    else:
        processors.append(JSONRenderer())

    structlog.configure(
        processors=processors,
        wrapper_class=structlog.stdlib.BoundLogger,
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        cache_logger_on_first_use=True,
    )


def get_logger(name: str | None = None) -> structlog.stdlib.BoundLogger:
    """
    Get a structured logger instance.

    Args:
        name: Logger name (defaults to calling module)

    Returns:
        Configured structlog logger

    Usage:
        from forma_runtime.logging import get_logger

        logger = get_logger(__name__)
        logger.info("user_created", user_id=123, email="test@example.com")
    """
    return structlog.get_logger(name)


class RequestLogger:
    """FastAPI middleware for request logging."""

    def __init__(self, logger: structlog.stdlib.BoundLogger | None = None):
        self.logger = logger or get_logger("forma_runtime.requests")

    async def log_request(
        self,
        method: str,
        path: str,
        status_code: int,
        duration_ms: float,
        user_id: int | None = None,
        project_id: str | None = None,
        **extra: Any,
    ) -> None:
        """Log an HTTP request with structured data."""
        log_data = {
            "method": method,
            "path": path,
            "status_code": status_code,
            "duration_ms": round(duration_ms, 2),
        }

        if user_id:
            log_data["user_id"] = user_id
        if project_id:
            log_data["project_id"] = project_id

        log_data.update(extra)

        if status_code >= 500:
            self.logger.error("request_error", **log_data)
        elif status_code >= 400:
            self.logger.warning("request_client_error", **log_data)
        else:
            self.logger.info("request_completed", **log_data)


class AuditLogger:
    """Logger for audit events (authentication, data changes)."""

    def __init__(self, logger: structlog.stdlib.BoundLogger | None = None):
        self.logger = logger or get_logger("forma_runtime.audit")

    def log_auth_event(
        self,
        event: str,
        user_id: int | None = None,
        email: str | None = None,
        success: bool = True,
        reason: str | None = None,
        ip_address: str | None = None,
    ) -> None:
        """Log authentication events."""
        log_data = {
            "event": event,
            "success": success,
        }
        if user_id:
            log_data["user_id"] = user_id
        if email:
            log_data["email"] = email
        if reason:
            log_data["reason"] = reason
        if ip_address:
            log_data["ip_address"] = ip_address

        if success:
            self.logger.info("auth_event", **log_data)
        else:
            self.logger.warning("auth_event", **log_data)

    def log_data_change(
        self,
        action: str,
        collection: str,
        record_id: int | None = None,
        user_id: int | None = None,
        changes: dict[str, Any] | None = None,
    ) -> None:
        """Log data modification events."""
        log_data = {
            "action": action,
            "collection": collection,
        }
        if record_id:
            log_data["record_id"] = record_id
        if user_id:
            log_data["user_id"] = user_id
        if changes:
            # Don't log sensitive field values
            safe_changes = {
                k: "***" if any(s in k.lower() for s in ["password", "secret", "token"]) else v
                for k, v in changes.items()
            }
            log_data["changes"] = safe_changes

        self.logger.info("data_change", **log_data)


# Initialize logging when module is imported
setup_logging()

# Export convenience loggers
request_logger = RequestLogger()
audit_logger = AuditLogger()
