"""FORMA - AI-Powered React Builder"""
import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.database import engine, Base
from app.api import auth, projects, components, ai, billing, marketplace, github, templates, teams, uploads, websocket, pages, hosting, forms, analytics, ecommerce, site_auth, blog, webhooks, seo, email, experiments, media, versions, comments, design_system, scheduled, import_export, performance, notifications, activity, localization, snippets, integrations, backups

# Create tables
Base.metadata.create_all(bind=engine)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    # Startup: Start the deployment worker
    from app.services.deployment_worker import deployment_worker

    # Start worker as background task
    worker_task = asyncio.create_task(deployment_worker.run_worker_loop(poll_interval=10))

    yield

    # Shutdown: Stop the worker
    deployment_worker.stop()
    worker_task.cancel()
    try:
        await worker_task
    except asyncio.CancelledError:
        pass


app = FastAPI(
    title="FORMA API",
    description="AI-Powered React Component Builder",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(pages.router)
app.include_router(components.router)
app.include_router(ai.router)
app.include_router(billing.router)
app.include_router(marketplace.router)
app.include_router(github.router)
app.include_router(templates.router)
app.include_router(teams.router)
app.include_router(teams.accept_router)
app.include_router(uploads.router)
app.include_router(websocket.router)
app.include_router(hosting.router)
app.include_router(hosting.subdomain_router)
app.include_router(forms.router)
app.include_router(forms.public_router)
app.include_router(analytics.router)
app.include_router(analytics.tracking_router)
app.include_router(ecommerce.router)
app.include_router(ecommerce.public_router)
app.include_router(site_auth.router)
app.include_router(blog.router)
app.include_router(blog.public_router)
app.include_router(webhooks.router)
app.include_router(webhooks.api_router)
app.include_router(seo.router)
app.include_router(seo.public_router)
app.include_router(email.router)
app.include_router(experiments.router)
app.include_router(experiments.public_router)
app.include_router(media.router)
app.include_router(versions.router)
app.include_router(comments.router)
app.include_router(design_system.router)
app.include_router(scheduled.router)
app.include_router(import_export.router)
app.include_router(performance.router)
app.include_router(performance.public_router)
app.include_router(notifications.router)
app.include_router(activity.router)
app.include_router(activity.user_router)
app.include_router(localization.router)
app.include_router(localization.public_router)
app.include_router(snippets.router)
app.include_router(integrations.router)
app.include_router(backups.router)


@app.get("/")
async def root():
    return {
        "name": "FORMA API",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}
