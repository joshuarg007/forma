"""Deployment Worker - Executes builds and deploys to Cloudflare Pages"""
import asyncio
import logging
from typing import Optional
from datetime import datetime
from uuid import UUID

from sqlalchemy.orm import Session

from app.db.database import SessionLocal
from app.db.models import (
    Deployment, DeploymentStatus,
    BuildLog, BuildLogLevel,
    ProjectHostingConfig, Project
)
from app.services.cloudflare import cloudflare_service
from app.services.site_generator import StaticSiteGenerator
from app.core.config import settings

logger = logging.getLogger(__name__)


class DeploymentWorker:
    """
    Background worker that executes deployments.

    Flow:
    1. Pick up PENDING deployment
    2. Update status to BUILDING
    3. Generate static HTML from pages_snapshot
    4. Create/get Cloudflare Pages project
    5. Upload files to Cloudflare
    6. Wait for deployment to complete
    7. Update status to DEPLOYED or FAILED
    """

    def __init__(self):
        self.running = False

    def _get_db(self) -> Session:
        """Get a database session."""
        return SessionLocal()

    def _log(
        self,
        db: Session,
        deployment_id: UUID,
        message: str,
        step: str,
        level: BuildLogLevel = BuildLogLevel.INFO
    ):
        """Add a build log entry."""
        log = BuildLog(
            deployment_id=deployment_id,
            level=level,
            message=message,
            step=step
        )
        db.add(log)
        db.commit()
        logger.info(f"[{deployment_id}] [{step}] {message}")

    async def process_deployment(self, deployment_id: UUID) -> bool:
        """
        Process a single deployment.

        Args:
            deployment_id: The deployment to process

        Returns:
            True if successful, False otherwise
        """
        db = self._get_db()

        try:
            # Load deployment with related data
            deployment = db.query(Deployment).filter(
                Deployment.id == deployment_id
            ).first()

            if not deployment:
                logger.error(f"Deployment {deployment_id} not found")
                return False

            if deployment.status != DeploymentStatus.PENDING:
                logger.warning(f"Deployment {deployment_id} is not pending (status: {deployment.status})")
                return False

            # Get project and hosting config
            project = db.query(Project).filter(Project.id == deployment.project_id).first()
            if not project or not project.hosting_config:
                self._log(db, deployment_id, "Project or hosting config not found", "init", BuildLogLevel.ERROR)
                deployment.status = DeploymentStatus.FAILED
                db.commit()
                return False

            config = project.hosting_config

            # Update status to BUILDING
            deployment.status = DeploymentStatus.BUILDING
            deployment.build_started_at = datetime.utcnow()
            db.commit()

            self._log(db, deployment_id, "Starting build process", "build")

            # Step 1: Generate static site
            self._log(db, deployment_id, "Generating static HTML from components", "build")

            generator = StaticSiteGenerator(project_name=project.name)
            pages = deployment.pages_snapshot or []

            if not pages:
                self._log(db, deployment_id, "No pages to deploy", "build", BuildLogLevel.ERROR)
                deployment.status = DeploymentStatus.FAILED
                db.commit()
                return False

            try:
                files = generator.generate_site(
                    pages=pages,
                    design_system=deployment.design_system_snapshot
                )
                self._log(db, deployment_id, f"Generated {len(files)} files", "build")
            except Exception as e:
                self._log(db, deployment_id, f"Build failed: {str(e)}", "build", BuildLogLevel.ERROR)
                deployment.status = DeploymentStatus.FAILED
                db.commit()
                return False

            # Step 2: Create or get Cloudflare Pages project
            deployment.status = DeploymentStatus.UPLOADING
            db.commit()

            self._log(db, deployment_id, "Preparing Cloudflare Pages project", "upload")

            cf_project_name = f"forma-{config.subdomain}"

            try:
                # Check if project exists
                existing = await cloudflare_service.get_project(cf_project_name)

                if not existing:
                    self._log(db, deployment_id, f"Creating Cloudflare project: {cf_project_name}", "upload")
                    await cloudflare_service.create_project(cf_project_name, config.subdomain)
                else:
                    self._log(db, deployment_id, f"Using existing Cloudflare project: {cf_project_name}", "upload")

            except Exception as e:
                self._log(db, deployment_id, f"Failed to setup Cloudflare project: {str(e)}", "upload", BuildLogLevel.ERROR)
                deployment.status = DeploymentStatus.FAILED
                db.commit()
                return False

            # Step 3: Upload files to Cloudflare Pages
            self._log(db, deployment_id, f"Uploading {len(files)} files to Cloudflare Pages", "upload")

            try:
                cf_deployment = await cloudflare_service.create_deployment(
                    project_name=cf_project_name,
                    files=files,
                    branch="main" if deployment.is_production else f"preview-{deployment.version}"
                )

                cf_deployment_id = cf_deployment.get("result", {}).get("id")
                cf_deployment_url = cf_deployment.get("result", {}).get("url")

                self._log(db, deployment_id, f"Files uploaded, deployment ID: {cf_deployment_id}", "upload")

                # Store Cloudflare deployment ID
                deployment.cloudflare_deployment_id = cf_deployment_id
                deployment.deploy_started_at = datetime.utcnow()

            except Exception as e:
                self._log(db, deployment_id, f"Upload failed: {str(e)}", "upload", BuildLogLevel.ERROR)
                deployment.status = DeploymentStatus.FAILED
                db.commit()
                return False

            # Step 4: Wait for deployment to complete
            self._log(db, deployment_id, "Waiting for deployment to go live", "deploy")

            try:
                final_status = await cloudflare_service.wait_for_deployment(
                    project_name=cf_project_name,
                    deployment_id=cf_deployment_id,
                    timeout=300,  # 5 minutes
                    poll_interval=5
                )

                deployment_url = final_status.get("result", {}).get("url")
                if deployment_url:
                    deployment.preview_url = deployment_url

            except TimeoutError:
                self._log(db, deployment_id, "Deployment timed out", "deploy", BuildLogLevel.WARN)
                # Don't fail - Cloudflare might still be processing
            except Exception as e:
                self._log(db, deployment_id, f"Deployment monitoring failed: {str(e)}", "deploy", BuildLogLevel.WARN)

            # Step 5: Mark as deployed
            deployment.status = DeploymentStatus.DEPLOYED
            deployment.build_completed_at = datetime.utcnow()
            deployment.deploy_completed_at = datetime.utcnow()
            deployment.production_url = f"https://{config.subdomain}.{settings.forma_domain}"
            db.commit()

            # Update hosting config with current deployment
            config.current_deployment_id = deployment.id
            db.commit()

            self._log(db, deployment_id, f"Deployment complete! Live at {deployment.production_url}", "complete")

            return True

        except Exception as e:
            logger.exception(f"Deployment {deployment_id} failed with unexpected error")
            try:
                deployment = db.query(Deployment).filter(Deployment.id == deployment_id).first()
                if deployment:
                    deployment.status = DeploymentStatus.FAILED
                    self._log(db, deployment_id, f"Unexpected error: {str(e)}", "error", BuildLogLevel.ERROR)
                db.commit()
            except:
                pass
            return False

        finally:
            db.close()

    async def process_pending_deployments(self):
        """Process all pending deployments."""
        db = self._get_db()

        try:
            pending = db.query(Deployment).filter(
                Deployment.status == DeploymentStatus.PENDING
            ).order_by(Deployment.created_at.asc()).all()

            if not pending:
                return

            logger.info(f"Found {len(pending)} pending deployments")

            for deployment in pending:
                await self.process_deployment(deployment.id)

        finally:
            db.close()

    async def run_worker_loop(self, poll_interval: int = 10):
        """
        Run the worker in a continuous loop.

        Args:
            poll_interval: Seconds between checking for new deployments
        """
        self.running = True
        logger.info(f"Deployment worker started, polling every {poll_interval}s")

        while self.running:
            try:
                await self.process_pending_deployments()
            except Exception as e:
                logger.exception("Error in deployment worker loop")

            await asyncio.sleep(poll_interval)

    def stop(self):
        """Stop the worker loop."""
        self.running = False
        logger.info("Deployment worker stopping")


# Singleton instance
deployment_worker = DeploymentWorker()


async def start_deployment_worker():
    """Start the deployment worker as a background task."""
    await deployment_worker.run_worker_loop()


def trigger_deployment(deployment_id: UUID):
    """
    Trigger processing of a specific deployment.

    This can be called synchronously and will queue the deployment
    for async processing.
    """
    asyncio.create_task(deployment_worker.process_deployment(deployment_id))
