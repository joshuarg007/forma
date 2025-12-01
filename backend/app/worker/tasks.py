"""Celery Background Tasks"""
import logging
from datetime import datetime, timedelta
from typing import Optional

from celery import shared_task

from app.worker.celery_app import celery_app
from app.db.database import SessionLocal
from app.db.models import (
    User, Project, ProjectInvite, GitHubSync,
    InviteStatus
)

logger = logging.getLogger(__name__)


def get_db():
    """Get database session for tasks."""
    db = SessionLocal()
    try:
        return db
    finally:
        pass  # Don't close here, caller will close


@celery_app.task(bind=True, max_retries=3)
def send_email_task(
    self,
    email_type: str,
    to_email: str,
    **kwargs
):
    """Send email asynchronously."""
    from app.services.email import email_service
    import asyncio

    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

        if email_type == "invite":
            result = loop.run_until_complete(
                email_service.send_invite_email(
                    to_email=to_email,
                    inviter_name=kwargs.get("inviter_name", "Someone"),
                    project_name=kwargs.get("project_name", "A project"),
                    invite_token=kwargs.get("invite_token", ""),
                    role=kwargs.get("role", "editor"),
                    message=kwargs.get("message")
                )
            )
        elif email_type == "welcome":
            result = loop.run_until_complete(
                email_service.send_welcome_email(
                    to_email=to_email,
                    name=kwargs.get("name")
                )
            )
        elif email_type == "password_reset":
            result = loop.run_until_complete(
                email_service.send_password_reset_email(
                    to_email=to_email,
                    reset_token=kwargs.get("reset_token", ""),
                    name=kwargs.get("name")
                )
            )
        elif email_type == "subscription":
            result = loop.run_until_complete(
                email_service.send_subscription_confirmation(
                    to_email=to_email,
                    plan=kwargs.get("plan", "starter"),
                    name=kwargs.get("name")
                )
            )
        else:
            logger.error(f"Unknown email type: {email_type}")
            return False

        loop.close()
        return result

    except Exception as e:
        logger.error(f"Email task failed: {e}")
        raise self.retry(exc=e, countdown=60 * (self.request.retries + 1))


@celery_app.task(bind=True, max_retries=3)
def export_project_task(
    self,
    project_id: str,
    user_id: str,
    export_format: str = "nextjs"
):
    """Export project to downloadable bundle."""
    from app.services.export import export_service

    db = get_db()
    try:
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            logger.error(f"Project not found: {project_id}")
            return None

        # Generate export
        if export_format == "nextjs":
            result = export_service.export_nextjs(project, db)
        elif export_format == "vite":
            result = export_service.export_vite(project, db)
        else:
            logger.error(f"Unknown export format: {export_format}")
            return None

        # TODO: Store result and notify user
        return result

    except Exception as e:
        logger.error(f"Export task failed: {e}")
        raise self.retry(exc=e, countdown=60)
    finally:
        db.close()


@celery_app.task(bind=True, max_retries=2)
def sync_github_task(
    self,
    project_id: str,
    direction: str = "push"
):
    """Sync project with GitHub."""
    from app.services.github_sync import (
        GitHubSyncService,
        sync_project_to_github,
        sync_github_to_project
    )
    import asyncio

    db = get_db()
    try:
        sync_config = db.query(GitHubSync).filter(
            GitHubSync.project_id == project_id
        ).first()

        if not sync_config:
            logger.error(f"No sync config for project: {project_id}")
            return None

        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            logger.error(f"Project not found: {project_id}")
            return None

        access_token = sync_config.access_token_encrypted
        if not access_token:
            logger.error(f"No access token for sync config: {sync_config.id}")
            return None

        github_service = GitHubSyncService(access_token)

        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

        if direction == "push":
            result = loop.run_until_complete(
                sync_project_to_github(db, project, sync_config, github_service)
            )
        else:
            result = loop.run_until_complete(
                sync_github_to_project(db, project, sync_config, github_service)
            )

        loop.close()
        return result

    except Exception as e:
        logger.error(f"GitHub sync task failed: {e}")
        raise self.retry(exc=e, countdown=120)
    finally:
        db.close()


@celery_app.task
def cleanup_expired_invites():
    """Clean up expired project invitations."""
    db = get_db()
    try:
        expired = db.query(ProjectInvite).filter(
            ProjectInvite.status == InviteStatus.PENDING,
            ProjectInvite.expires_at < datetime.utcnow()
        ).all()

        count = 0
        for invite in expired:
            invite.status = InviteStatus.EXPIRED
            count += 1

        db.commit()
        logger.info(f"Marked {count} invites as expired")
        return count

    except Exception as e:
        logger.error(f"Cleanup task failed: {e}")
        db.rollback()
        return 0
    finally:
        db.close()


@celery_app.task
def auto_sync_github():
    """Auto-sync projects with GitHub that have auto_sync enabled."""
    db = get_db()
    try:
        # Find all sync configs with auto_sync enabled
        sync_configs = db.query(GitHubSync).filter(
            GitHubSync.auto_sync == True
        ).all()

        synced = 0
        for config in sync_configs:
            # Check if last sync was more than 5 minutes ago
            if config.last_synced_at:
                time_since_sync = datetime.utcnow() - config.last_synced_at
                if time_since_sync < timedelta(minutes=5):
                    continue

            # Queue sync task
            sync_github_task.delay(
                project_id=str(config.project_id),
                direction="push"
            )
            synced += 1

        logger.info(f"Queued {synced} auto-sync tasks")
        return synced

    except Exception as e:
        logger.error(f"Auto-sync task failed: {e}")
        return 0
    finally:
        db.close()


@celery_app.task
def generate_component_preview(component_id: str):
    """Generate preview image for a component (placeholder for future implementation)."""
    # This would use a headless browser to render the component
    # and capture a screenshot
    logger.info(f"Would generate preview for component: {component_id}")
    return None


@celery_app.task
def process_marketplace_purchase(purchase_id: str):
    """Process a marketplace purchase (Stripe payment)."""
    # This is a placeholder - actual Stripe processing would go here
    logger.info(f"Would process purchase: {purchase_id}")
    return None
