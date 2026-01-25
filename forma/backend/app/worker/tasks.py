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


# =============================================================================
# HOSTING & DEPLOYMENT TASKS
# =============================================================================

@celery_app.task(bind=True, max_retries=2)
def deploy_project_task(
    self,
    project_id: str,
    user_id: str,
    deployment_id: str
):
    """
    Full deployment pipeline for Forma Hosting.

    Pipeline:
    1. Export project to static files
    2. Create/get Cloudflare Pages project
    3. Upload files to Cloudflare
    4. Wait for deployment to complete
    5. Update deployment status
    """
    from app.services.static_export import static_export_service
    from app.services.cloudflare import cloudflare_service
    from app.db.models import (
        Deployment, DeploymentStatus, BuildLog, BuildLogLevel,
        Project, ProjectHostingConfig
    )
    import asyncio

    db = get_db()
    try:
        # Get deployment record
        deployment = db.query(Deployment).filter(
            Deployment.id == deployment_id
        ).first()

        if not deployment:
            logger.error(f"Deployment not found: {deployment_id}")
            return None

        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            logger.error(f"Project not found: {project_id}")
            _update_deployment_status(db, deployment, DeploymentStatus.FAILED, "Project not found")
            return None

        hosting_config = db.query(ProjectHostingConfig).filter(
            ProjectHostingConfig.project_id == project_id
        ).first()

        if not hosting_config:
            _update_deployment_status(db, deployment, DeploymentStatus.FAILED, "Hosting not configured")
            return None

        # Update status to building
        deployment.status = DeploymentStatus.BUILDING
        deployment.build_started_at = datetime.utcnow()
        db.commit()

        _add_build_log(db, deployment_id, "info", "Starting build...", "init")

        # Step 1: Generate static files
        _add_build_log(db, deployment_id, "info", "Exporting project files...", "export")

        pages = list(project.pages)
        files = static_export_service.generate_files(
            project=project,
            pages=pages,
            design_system=deployment.design_system_snapshot
        )

        _add_build_log(db, deployment_id, "info", f"Generated {len(files)} files", "export")

        # Step 2: Update to uploading status
        deployment.status = DeploymentStatus.UPLOADING
        deployment.build_completed_at = datetime.utcnow()
        deployment.deploy_started_at = datetime.utcnow()
        db.commit()

        _add_build_log(db, deployment_id, "info", "Uploading to Cloudflare Pages...", "upload")

        # Step 3: Upload to Cloudflare
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

        try:
            # Ensure project exists
            cf_project_name = f"forma-{hosting_config.subdomain}"

            # Check if project exists, create if not
            existing_project = loop.run_until_complete(
                cloudflare_service.get_project(cf_project_name)
            )

            if not existing_project:
                _add_build_log(db, deployment_id, "info", f"Creating Cloudflare project: {cf_project_name}", "upload")
                loop.run_until_complete(
                    cloudflare_service.create_project(cf_project_name, hosting_config.subdomain)
                )

            # Upload deployment
            cf_deployment = loop.run_until_complete(
                cloudflare_service.create_deployment(
                    project_name=cf_project_name,
                    files=files,
                    branch="main"
                )
            )

            cf_deployment_id = cf_deployment.get("result", {}).get("id")
            deployment.cloudflare_deployment_id = cf_deployment_id
            deployment.cloudflare_project_name = cf_project_name
            db.commit()

            _add_build_log(db, deployment_id, "info", "Waiting for deployment to go live...", "upload")

            # Wait for deployment
            final_status = loop.run_until_complete(
                cloudflare_service.wait_for_deployment(
                    project_name=cf_project_name,
                    deployment_id=cf_deployment_id,
                    timeout=300
                )
            )

            # Update deployment URL from Cloudflare
            cf_url = final_status.get("result", {}).get("url")
            if cf_url:
                deployment.production_url = cf_url

        except Exception as cf_error:
            logger.error(f"Cloudflare deployment failed: {cf_error}")
            _update_deployment_status(db, deployment, DeploymentStatus.FAILED, str(cf_error))
            _add_build_log(db, deployment_id, "error", f"Cloudflare error: {cf_error}", "upload")
            raise

        finally:
            loop.close()

        # Step 4: Mark as deployed
        deployment.status = DeploymentStatus.DEPLOYED
        deployment.deploy_completed_at = datetime.utcnow()
        deployment.is_production = True
        db.commit()

        # Update hosting config current deployment
        hosting_config.current_deployment_id = deployment.id
        db.commit()

        _add_build_log(
            db, deployment_id, "info",
            f"Deployment successful! Live at {deployment.production_url}",
            "complete"
        )

        logger.info(f"Deployment {deployment_id} completed: {deployment.production_url}")
        return {"status": "success", "url": deployment.production_url}

    except Exception as e:
        logger.error(f"Deploy task failed: {e}")
        if deployment:
            _update_deployment_status(db, deployment, DeploymentStatus.FAILED, str(e))
        raise self.retry(exc=e, countdown=60)
    finally:
        db.close()


@celery_app.task(bind=True, max_retries=5)
def verify_domain_task(self, domain_id: str):
    """
    Verify DNS records for a custom domain.

    Retries every 2 minutes up to 5 times (10 minutes total).
    """
    from app.services.cloudflare import cloudflare_service
    from app.db.models import CustomDomain, CustomDomainStatus
    import asyncio

    db = get_db()
    try:
        domain = db.query(CustomDomain).filter(CustomDomain.id == domain_id).first()

        if not domain:
            logger.error(f"Domain not found: {domain_id}")
            return None

        # Perform DNS verification
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

        try:
            result = loop.run_until_complete(
                cloudflare_service.verify_domain_dns(domain.domain)
            )

            if result.get("verified"):
                domain.status = CustomDomainStatus.ACTIVE
                domain.dns_verified_at = datetime.utcnow()
                db.commit()

                # Trigger SSL provisioning
                provision_ssl_task.delay(domain_id)

                logger.info(f"Domain {domain.domain} verified successfully")
                return {"verified": True}
            else:
                # Still pending, will retry
                logger.info(f"Domain {domain.domain} not yet verified, retrying...")
                raise Exception("DNS not verified yet")

        finally:
            loop.close()

    except Exception as e:
        logger.error(f"Domain verification failed: {e}")
        raise self.retry(exc=e, countdown=120)
    finally:
        db.close()


@celery_app.task(bind=True, max_retries=3)
def provision_ssl_task(self, domain_id: str):
    """Provision SSL certificate for a verified custom domain."""
    from app.db.models import CustomDomain

    db = get_db()
    try:
        domain = db.query(CustomDomain).filter(CustomDomain.id == domain_id).first()

        if not domain:
            logger.error(f"Domain not found: {domain_id}")
            return None

        # SSL is automatically provisioned by Cloudflare
        # Just update the status
        domain.ssl_status = "active"
        domain.ssl_expires_at = datetime.utcnow() + timedelta(days=90)
        db.commit()

        logger.info(f"SSL provisioned for {domain.domain}")
        return {"ssl_status": "active"}

    except Exception as e:
        logger.error(f"SSL provisioning failed: {e}")
        raise self.retry(exc=e, countdown=60)
    finally:
        db.close()


@celery_app.task
def cleanup_old_deployments():
    """
    Clean up old deployment records.

    Keeps the last 10 deployments per project, deletes older ones.
    """
    from app.db.models import Deployment, BuildLog

    db = get_db()
    try:
        # Get all projects with deployments
        from sqlalchemy import func
        project_ids = db.query(Deployment.project_id).distinct().all()

        deleted_count = 0
        for (project_id,) in project_ids:
            # Get all deployments for project, ordered by newest first
            deployments = db.query(Deployment).filter(
                Deployment.project_id == project_id
            ).order_by(Deployment.created_at.desc()).all()

            # Keep first 10, delete rest
            for deployment in deployments[10:]:
                # Delete build logs first
                db.query(BuildLog).filter(
                    BuildLog.deployment_id == deployment.id
                ).delete()
                db.delete(deployment)
                deleted_count += 1

        db.commit()
        logger.info(f"Cleaned up {deleted_count} old deployments")
        return deleted_count

    except Exception as e:
        logger.error(f"Deployment cleanup failed: {e}")
        db.rollback()
        return 0
    finally:
        db.close()


def _add_build_log(db, deployment_id: str, level: str, message: str, step: str):
    """Helper to add a build log entry."""
    from app.db.models import BuildLog, BuildLogLevel

    level_map = {
        "info": BuildLogLevel.INFO,
        "warn": BuildLogLevel.WARN,
        "error": BuildLogLevel.ERROR,
        "debug": BuildLogLevel.DEBUG
    }

    log = BuildLog(
        deployment_id=deployment_id,
        level=level_map.get(level, BuildLogLevel.INFO),
        message=message,
        step=step
    )
    db.add(log)
    db.commit()


def _update_deployment_status(db, deployment, status, error_message=None):
    """Helper to update deployment status."""
    deployment.status = status
    if error_message:
        deployment.error_message = error_message
    db.commit()
