"""Celery Application Configuration"""
from celery import Celery

from app.core.config import settings

# Create Celery app
celery_app = Celery(
    "forma",
    broker=settings.redis_url,
    backend=settings.redis_url,
    include=[
        "app.worker.tasks"
    ]
)

# Celery configuration
celery_app.conf.update(
    # Task settings
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,

    # Task routing
    task_routes={
        "app.worker.tasks.send_email_task": {"queue": "email"},
        "app.worker.tasks.export_project_task": {"queue": "export"},
        "app.worker.tasks.sync_github_task": {"queue": "github"},
        "app.worker.tasks.*": {"queue": "default"},
    },

    # Rate limiting
    task_annotations={
        "app.worker.tasks.send_email_task": {"rate_limit": "30/m"},
        "app.worker.tasks.sync_github_task": {"rate_limit": "10/m"},
    },

    # Result backend settings
    result_expires=3600,  # Results expire after 1 hour

    # Worker settings
    worker_prefetch_multiplier=4,
    worker_concurrency=4,

    # Beat schedule for periodic tasks
    beat_schedule={
        "cleanup-expired-invites": {
            "task": "app.worker.tasks.cleanup_expired_invites",
            "schedule": 3600.0,  # Every hour
        },
        "sync-auto-github-projects": {
            "task": "app.worker.tasks.auto_sync_github",
            "schedule": 300.0,  # Every 5 minutes
        },
    },
)
