"""Email Templates API - Transactional email management"""
import re
import smtplib
from datetime import datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional, List, Dict, Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import (
    Project, User, EmailTemplate, EmailSettings, EmailLog,
    EmailTemplateType, EmailProviderType, EmailLogStatus
)
from app.core.security import get_current_user_required as get_current_user


router = APIRouter(prefix="/api/projects/{project_id}/email", tags=["email"])


# =============================================================================
# SCHEMAS
# =============================================================================

class EmailTemplateCreate(BaseModel):
    """Create an email template."""
    name: str
    slug: str
    template_type: str
    description: Optional[str] = None
    subject: str
    html_body: str
    text_body: Optional[str] = None
    from_name: Optional[str] = None
    from_email: Optional[str] = None
    reply_to: Optional[str] = None


class EmailTemplateUpdate(BaseModel):
    """Update an email template."""
    name: Optional[str] = None
    subject: Optional[str] = None
    html_body: Optional[str] = None
    text_body: Optional[str] = None
    from_name: Optional[str] = None
    from_email: Optional[str] = None
    reply_to: Optional[str] = None
    is_active: Optional[bool] = None


class EmailSettingsUpdate(BaseModel):
    """Update email settings."""
    provider: Optional[str] = None
    smtp_host: Optional[str] = None
    smtp_port: Optional[int] = None
    smtp_username: Optional[str] = None
    smtp_password: Optional[str] = None
    smtp_use_tls: Optional[bool] = None
    api_key: Optional[str] = None
    api_domain: Optional[str] = None
    default_from_name: Optional[str] = None
    default_from_email: Optional[str] = None
    default_reply_to: Optional[str] = None


class SendEmailRequest(BaseModel):
    """Send an email using a template."""
    to_email: EmailStr
    to_name: Optional[str] = None
    template_slug: Optional[str] = None
    template_type: Optional[str] = None
    context: Dict[str, Any] = {}
    # Override template values
    subject: Optional[str] = None
    from_name: Optional[str] = None
    from_email: Optional[str] = None


class SendRawEmailRequest(BaseModel):
    """Send a raw email without template."""
    to_email: EmailStr
    to_name: Optional[str] = None
    subject: str
    html_body: str
    text_body: Optional[str] = None
    from_name: Optional[str] = None
    from_email: Optional[str] = None
    reply_to: Optional[str] = None


# =============================================================================
# HELPERS
# =============================================================================

def render_template(template: str, context: Dict[str, Any]) -> str:
    """
    Render a template with context variables.
    Supports {{variable}} and {{variable|default}} syntax.
    """
    def replace_var(match):
        var_name = match.group(1).strip()
        # Check for default value
        if '|' in var_name:
            parts = var_name.split('|', 1)
            var_name = parts[0].strip()
            default = parts[1].strip().strip('"\'')
        else:
            default = ''

        # Get nested value
        value = context
        for key in var_name.split('.'):
            if isinstance(value, dict):
                value = value.get(key, default)
            else:
                value = default
                break

        return str(value) if value is not None else default

    # Replace {{variable}} patterns
    pattern = r'\{\{([^}]+)\}\}'
    return re.sub(pattern, replace_var, template)


def get_or_create_email_settings(db: Session, project_id: UUID) -> EmailSettings:
    """Get or create email settings for a project."""
    settings = db.query(EmailSettings).filter(
        EmailSettings.project_id == project_id
    ).first()

    if not settings:
        settings = EmailSettings(project_id=project_id)
        db.add(settings)
        db.commit()
        db.refresh(settings)

    return settings


async def send_email_smtp(
    settings: EmailSettings,
    to_email: str,
    to_name: str,
    from_email: str,
    from_name: str,
    reply_to: str,
    subject: str,
    html_body: str,
    text_body: str
) -> tuple[bool, str]:
    """Send email via SMTP."""
    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = f"{from_name} <{from_email}>" if from_name else from_email
        msg['To'] = f"{to_name} <{to_email}>" if to_name else to_email
        if reply_to:
            msg['Reply-To'] = reply_to

        if text_body:
            msg.attach(MIMEText(text_body, 'plain'))
        msg.attach(MIMEText(html_body, 'html'))

        if settings.smtp_use_tls:
            server = smtplib.SMTP(settings.smtp_host, settings.smtp_port)
            server.starttls()
        else:
            server = smtplib.SMTP(settings.smtp_host, settings.smtp_port)

        if settings.smtp_username and settings.smtp_password:
            server.login(settings.smtp_username, settings.smtp_password)

        server.send_message(msg)
        server.quit()

        return True, "Email sent successfully"
    except Exception as e:
        return False, str(e)


async def send_email_sendgrid(
    settings: EmailSettings,
    to_email: str,
    to_name: str,
    from_email: str,
    from_name: str,
    reply_to: str,
    subject: str,
    html_body: str,
    text_body: str
) -> tuple[bool, str]:
    """Send email via SendGrid."""
    import httpx

    try:
        headers = {
            "Authorization": f"Bearer {settings.api_key}",
            "Content-Type": "application/json"
        }

        data = {
            "personalizations": [{
                "to": [{"email": to_email, "name": to_name}] if to_name else [{"email": to_email}]
            }],
            "from": {"email": from_email, "name": from_name} if from_name else {"email": from_email},
            "subject": subject,
            "content": [
                {"type": "text/html", "value": html_body}
            ]
        }

        if text_body:
            data["content"].insert(0, {"type": "text/plain", "value": text_body})

        if reply_to:
            data["reply_to"] = {"email": reply_to}

        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.sendgrid.com/v3/mail/send",
                headers=headers,
                json=data
            )

        if response.status_code in [200, 202]:
            return True, response.headers.get("X-Message-Id", "sent")
        else:
            return False, response.text

    except Exception as e:
        return False, str(e)


async def send_email_resend(
    settings: EmailSettings,
    to_email: str,
    to_name: str,
    from_email: str,
    from_name: str,
    reply_to: str,
    subject: str,
    html_body: str,
    text_body: str
) -> tuple[bool, str]:
    """Send email via Resend."""
    import httpx

    try:
        headers = {
            "Authorization": f"Bearer {settings.api_key}",
            "Content-Type": "application/json"
        }

        data = {
            "from": f"{from_name} <{from_email}>" if from_name else from_email,
            "to": [f"{to_name} <{to_email}>" if to_name else to_email],
            "subject": subject,
            "html": html_body
        }

        if text_body:
            data["text"] = text_body

        if reply_to:
            data["reply_to"] = reply_to

        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.resend.com/emails",
                headers=headers,
                json=data
            )

        result = response.json()
        if response.status_code == 200:
            return True, result.get("id", "sent")
        else:
            return False, result.get("message", str(response.status_code))

    except Exception as e:
        return False, str(e)


# =============================================================================
# TEMPLATE ENDPOINTS
# =============================================================================

@router.get("/templates")
async def list_templates(
    project_id: UUID,
    template_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all email templates for a project."""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    query = db.query(EmailTemplate).filter(EmailTemplate.project_id == project_id)

    if template_type:
        try:
            query = query.filter(EmailTemplate.template_type == EmailTemplateType(template_type))
        except ValueError:
            pass

    templates = query.order_by(EmailTemplate.name).all()

    return {
        "templates": [
            {
                "id": str(t.id),
                "name": t.name,
                "slug": t.slug,
                "template_type": t.template_type.value,
                "description": t.description,
                "subject": t.subject,
                "is_active": t.is_active,
                "is_default": t.is_default,
                "created_at": t.created_at.isoformat()
            }
            for t in templates
        ]
    }


@router.post("/templates")
async def create_template(
    project_id: UUID,
    data: EmailTemplateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new email template."""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Check slug uniqueness
    existing = db.query(EmailTemplate).filter(
        EmailTemplate.project_id == project_id,
        EmailTemplate.slug == data.slug
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Template slug already exists")

    # Validate template type
    try:
        template_type = EmailTemplateType(data.template_type)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid template type: {data.template_type}")

    template = EmailTemplate(
        project_id=project_id,
        name=data.name,
        slug=data.slug,
        template_type=template_type,
        description=data.description,
        subject=data.subject,
        html_body=data.html_body,
        text_body=data.text_body,
        from_name=data.from_name,
        from_email=data.from_email,
        reply_to=data.reply_to
    )

    db.add(template)
    db.commit()
    db.refresh(template)

    return {
        "id": str(template.id),
        "name": template.name,
        "slug": template.slug,
        "template_type": template.template_type.value
    }


@router.get("/templates/{template_id}")
async def get_template(
    project_id: UUID,
    template_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific email template."""
    template = db.query(EmailTemplate).filter(
        EmailTemplate.id == template_id,
        EmailTemplate.project_id == project_id
    ).first()

    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    return {
        "id": str(template.id),
        "name": template.name,
        "slug": template.slug,
        "template_type": template.template_type.value,
        "description": template.description,
        "subject": template.subject,
        "html_body": template.html_body,
        "text_body": template.text_body,
        "from_name": template.from_name,
        "from_email": template.from_email,
        "reply_to": template.reply_to,
        "is_active": template.is_active,
        "is_default": template.is_default,
        "created_at": template.created_at.isoformat(),
        "updated_at": template.updated_at.isoformat()
    }


@router.put("/templates/{template_id}")
async def update_template(
    project_id: UUID,
    template_id: UUID,
    data: EmailTemplateUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update an email template."""
    template = db.query(EmailTemplate).filter(
        EmailTemplate.id == template_id,
        EmailTemplate.project_id == project_id
    ).first()

    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(template, key, value)

    db.commit()

    return {"success": True, "message": "Template updated"}


@router.delete("/templates/{template_id}")
async def delete_template(
    project_id: UUID,
    template_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete an email template."""
    template = db.query(EmailTemplate).filter(
        EmailTemplate.id == template_id,
        EmailTemplate.project_id == project_id
    ).first()

    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    db.delete(template)
    db.commit()

    return {"success": True, "message": "Template deleted"}


@router.post("/templates/{template_id}/preview")
async def preview_template(
    project_id: UUID,
    template_id: UUID,
    context: Dict[str, Any] = {},
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Preview a rendered template with sample data."""
    template = db.query(EmailTemplate).filter(
        EmailTemplate.id == template_id,
        EmailTemplate.project_id == project_id
    ).first()

    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    # Add default context
    default_context = {
        "site_name": "Your Site",
        "site_url": "https://example.com",
        "user_name": "John Doe",
        "user_email": "john@example.com",
        "current_year": datetime.now().year
    }
    full_context = {**default_context, **context}

    rendered_subject = render_template(template.subject, full_context)
    rendered_html = render_template(template.html_body, full_context)
    rendered_text = render_template(template.text_body or "", full_context) if template.text_body else None

    return {
        "subject": rendered_subject,
        "html_body": rendered_html,
        "text_body": rendered_text
    }


# =============================================================================
# SETTINGS ENDPOINTS
# =============================================================================

@router.get("/settings")
async def get_email_settings(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get email provider settings."""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    settings = get_or_create_email_settings(db, project_id)

    return {
        "provider": settings.provider.value if settings.provider else None,
        "smtp_host": settings.smtp_host,
        "smtp_port": settings.smtp_port,
        "smtp_username": settings.smtp_username,
        "smtp_use_tls": settings.smtp_use_tls,
        "api_domain": settings.api_domain,
        "default_from_name": settings.default_from_name,
        "default_from_email": settings.default_from_email,
        "default_reply_to": settings.default_reply_to,
        "is_configured": settings.is_configured,
        "is_verified": settings.is_verified,
        # Don't return sensitive fields like passwords/api_keys
        "has_api_key": bool(settings.api_key),
        "has_smtp_password": bool(settings.smtp_password)
    }


@router.put("/settings")
async def update_email_settings(
    project_id: UUID,
    data: EmailSettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update email provider settings."""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    settings = get_or_create_email_settings(db, project_id)

    update_data = data.model_dump(exclude_unset=True)

    # Handle provider enum
    if 'provider' in update_data:
        try:
            update_data['provider'] = EmailProviderType(update_data['provider'])
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid provider")

    for key, value in update_data.items():
        setattr(settings, key, value)

    # Check if configured
    settings.is_configured = bool(
        (settings.provider == EmailProviderType.SMTP and settings.smtp_host) or
        (settings.provider in [EmailProviderType.SENDGRID, EmailProviderType.RESEND] and settings.api_key)
    )

    settings.is_verified = False  # Re-verify after changes

    db.commit()

    return {"success": True, "message": "Settings updated"}


@router.post("/settings/test")
async def test_email_settings(
    project_id: UUID,
    to_email: EmailStr,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Send a test email to verify settings."""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    settings = get_or_create_email_settings(db, project_id)

    if not settings.is_configured:
        raise HTTPException(status_code=400, detail="Email not configured")

    from_email = settings.default_from_email or "noreply@example.com"
    from_name = settings.default_from_name or project.name

    # Send test email
    if settings.provider == EmailProviderType.SMTP:
        success, message = await send_email_smtp(
            settings, to_email, "", from_email, from_name, "",
            "Test Email from Forma",
            "<h1>Test Email</h1><p>Your email settings are working correctly!</p>",
            "Test Email\n\nYour email settings are working correctly!"
        )
    elif settings.provider == EmailProviderType.SENDGRID:
        success, message = await send_email_sendgrid(
            settings, to_email, "", from_email, from_name, "",
            "Test Email from Forma",
            "<h1>Test Email</h1><p>Your email settings are working correctly!</p>",
            "Test Email\n\nYour email settings are working correctly!"
        )
    elif settings.provider == EmailProviderType.RESEND:
        success, message = await send_email_resend(
            settings, to_email, "", from_email, from_name, "",
            "Test Email from Forma",
            "<h1>Test Email</h1><p>Your email settings are working correctly!</p>",
            "Test Email\n\nYour email settings are working correctly!"
        )
    else:
        raise HTTPException(status_code=400, detail=f"Provider {settings.provider} not supported")

    if success:
        settings.is_verified = True
        db.commit()
        return {"success": True, "message": "Test email sent successfully"}
    else:
        return {"success": False, "error": message}


# =============================================================================
# SEND EMAIL ENDPOINTS
# =============================================================================

@router.post("/send")
async def send_email(
    project_id: UUID,
    data: SendEmailRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Send an email using a template."""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    settings = get_or_create_email_settings(db, project_id)

    if not settings.is_configured:
        raise HTTPException(status_code=400, detail="Email not configured")

    # Find template
    template = None
    if data.template_slug:
        template = db.query(EmailTemplate).filter(
            EmailTemplate.project_id == project_id,
            EmailTemplate.slug == data.template_slug,
            EmailTemplate.is_active == True
        ).first()
    elif data.template_type:
        try:
            template_type = EmailTemplateType(data.template_type)
            template = db.query(EmailTemplate).filter(
                EmailTemplate.project_id == project_id,
                EmailTemplate.template_type == template_type,
                EmailTemplate.is_active == True,
                EmailTemplate.is_default == True
            ).first()
        except ValueError:
            pass

    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    # Render template
    context = {
        "site_name": project.name,
        "current_year": datetime.now().year,
        **data.context
    }

    subject = data.subject or render_template(template.subject, context)
    html_body = render_template(template.html_body, context)
    text_body = render_template(template.text_body or "", context) if template.text_body else None

    from_email = data.from_email or template.from_email or settings.default_from_email
    from_name = data.from_name or template.from_name or settings.default_from_name or project.name
    reply_to = template.reply_to or settings.default_reply_to

    # Create log entry
    log = EmailLog(
        project_id=project_id,
        template_id=template.id,
        to_email=data.to_email,
        to_name=data.to_name,
        from_email=from_email,
        from_name=from_name,
        reply_to=reply_to,
        subject=subject,
        html_body=html_body,
        text_body=text_body,
        template_type=template.template_type.value,
        context_data=data.context,
        status=EmailLogStatus.PENDING
    )
    db.add(log)
    db.commit()
    db.refresh(log)

    # Queue email sending
    background_tasks.add_task(
        _send_email_task,
        log_id=log.id,
        settings_id=settings.id,
        db_url=str(db.get_bind().url)
    )

    return {"success": True, "log_id": str(log.id), "message": "Email queued"}


@router.post("/send-raw")
async def send_raw_email(
    project_id: UUID,
    data: SendRawEmailRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Send a raw email without using a template."""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    settings = get_or_create_email_settings(db, project_id)

    if not settings.is_configured:
        raise HTTPException(status_code=400, detail="Email not configured")

    from_email = data.from_email or settings.default_from_email
    from_name = data.from_name or settings.default_from_name or project.name
    reply_to = data.reply_to or settings.default_reply_to

    # Create log entry
    log = EmailLog(
        project_id=project_id,
        to_email=data.to_email,
        to_name=data.to_name,
        from_email=from_email,
        from_name=from_name,
        reply_to=reply_to,
        subject=data.subject,
        html_body=data.html_body,
        text_body=data.text_body,
        status=EmailLogStatus.PENDING
    )
    db.add(log)
    db.commit()
    db.refresh(log)

    # Queue email sending
    background_tasks.add_task(
        _send_email_task,
        log_id=log.id,
        settings_id=settings.id,
        db_url=str(db.get_bind().url)
    )

    return {"success": True, "log_id": str(log.id), "message": "Email queued"}


# =============================================================================
# LOGS ENDPOINTS
# =============================================================================

@router.get("/logs")
async def list_email_logs(
    project_id: UUID,
    status: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List email logs."""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    query = db.query(EmailLog).filter(EmailLog.project_id == project_id)

    if status:
        try:
            query = query.filter(EmailLog.status == EmailLogStatus(status))
        except ValueError:
            pass

    total = query.count()
    logs = query.order_by(EmailLog.created_at.desc()).offset(offset).limit(limit).all()

    return {
        "logs": [
            {
                "id": str(l.id),
                "to_email": l.to_email,
                "subject": l.subject,
                "status": l.status.value,
                "template_type": l.template_type,
                "error_message": l.error_message,
                "sent_at": l.sent_at.isoformat() if l.sent_at else None,
                "created_at": l.created_at.isoformat()
            }
            for l in logs
        ],
        "total": total
    }


@router.get("/logs/{log_id}")
async def get_email_log(
    project_id: UUID,
    log_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get details of an email log entry."""
    log = db.query(EmailLog).filter(
        EmailLog.id == log_id,
        EmailLog.project_id == project_id
    ).first()

    if not log:
        raise HTTPException(status_code=404, detail="Log not found")

    return {
        "id": str(log.id),
        "to_email": log.to_email,
        "to_name": log.to_name,
        "from_email": log.from_email,
        "from_name": log.from_name,
        "reply_to": log.reply_to,
        "subject": log.subject,
        "html_body": log.html_body,
        "text_body": log.text_body,
        "status": log.status.value,
        "error_message": log.error_message,
        "provider_message_id": log.provider_message_id,
        "template_type": log.template_type,
        "context_data": log.context_data,
        "sent_at": log.sent_at.isoformat() if log.sent_at else None,
        "delivered_at": log.delivered_at.isoformat() if log.delivered_at else None,
        "opened_at": log.opened_at.isoformat() if log.opened_at else None,
        "created_at": log.created_at.isoformat()
    }


# =============================================================================
# BACKGROUND TASK
# =============================================================================

async def _send_email_task(log_id: UUID, settings_id: UUID, db_url: str):
    """Background task to send email."""
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker

    engine = create_engine(db_url)
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()

    try:
        log = db.query(EmailLog).filter(EmailLog.id == log_id).first()
        settings = db.query(EmailSettings).filter(EmailSettings.id == settings_id).first()

        if not log or not settings:
            return

        # Send based on provider
        if settings.provider == EmailProviderType.SMTP:
            success, message = await send_email_smtp(
                settings, log.to_email, log.to_name or "",
                log.from_email, log.from_name or "",
                log.reply_to or "", log.subject,
                log.html_body, log.text_body or ""
            )
        elif settings.provider == EmailProviderType.SENDGRID:
            success, message = await send_email_sendgrid(
                settings, log.to_email, log.to_name or "",
                log.from_email, log.from_name or "",
                log.reply_to or "", log.subject,
                log.html_body, log.text_body or ""
            )
        elif settings.provider == EmailProviderType.RESEND:
            success, message = await send_email_resend(
                settings, log.to_email, log.to_name or "",
                log.from_email, log.from_name or "",
                log.reply_to or "", log.subject,
                log.html_body, log.text_body or ""
            )
        else:
            success, message = False, f"Unsupported provider: {settings.provider}"

        # Update log
        if success:
            log.status = EmailLogStatus.SENT
            log.sent_at = datetime.utcnow()
            log.provider_message_id = message if message != "Email sent successfully" else None
        else:
            log.status = EmailLogStatus.FAILED
            log.error_message = message

        db.commit()

    finally:
        db.close()


# =============================================================================
# DEFAULT TEMPLATES
# =============================================================================

DEFAULT_TEMPLATES = {
    "welcome": {
        "name": "Welcome Email",
        "slug": "welcome",
        "template_type": EmailTemplateType.WELCOME,
        "subject": "Welcome to {{site_name}}!",
        "html_body": """<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; padding: 20px 0; }
    .content { padding: 20px 0; }
    .button { display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 8px; }
    .footer { text-align: center; padding: 20px 0; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to {{site_name}}!</h1>
    </div>
    <div class="content">
      <p>Hi {{user_name|there}},</p>
      <p>Thank you for signing up! We're excited to have you on board.</p>
      <p>Get started by exploring your dashboard:</p>
      <p style="text-align: center;">
        <a href="{{site_url}}/dashboard" class="button">Go to Dashboard</a>
      </p>
    </div>
    <div class="footer">
      <p>&copy; {{current_year}} {{site_name}}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>""",
        "text_body": """Welcome to {{site_name}}!

Hi {{user_name|there}},

Thank you for signing up! We're excited to have you on board.

Get started by visiting: {{site_url}}/dashboard

(c) {{current_year}} {{site_name}}"""
    },
    "password_reset": {
        "name": "Password Reset",
        "slug": "password-reset",
        "template_type": EmailTemplateType.PASSWORD_RESET,
        "subject": "Reset your {{site_name}} password",
        "html_body": """<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .content { padding: 20px 0; }
    .button { display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 8px; }
    .footer { text-align: center; padding: 20px 0; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="content">
      <h2>Reset Your Password</h2>
      <p>Hi {{user_name|there}},</p>
      <p>We received a request to reset your password. Click the button below to create a new password:</p>
      <p style="text-align: center;">
        <a href="{{reset_url}}" class="button">Reset Password</a>
      </p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, you can safely ignore this email.</p>
    </div>
    <div class="footer">
      <p>&copy; {{current_year}} {{site_name}}</p>
    </div>
  </div>
</body>
</html>""",
        "text_body": """Reset Your Password

Hi {{user_name|there}},

We received a request to reset your password. Visit the link below to create a new password:

{{reset_url}}

This link will expire in 1 hour.

If you didn't request this, you can safely ignore this email.

(c) {{current_year}} {{site_name}}"""
    },
    "order_confirmation": {
        "name": "Order Confirmation",
        "slug": "order-confirmation",
        "template_type": EmailTemplateType.ORDER_CONFIRMATION,
        "subject": "Order Confirmed - #{{order_number}}",
        "html_body": """<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
    .order-item { display: flex; padding: 15px 0; border-bottom: 1px solid #eee; }
    .total { font-size: 18px; font-weight: bold; margin-top: 20px; }
    .footer { text-align: center; padding: 20px 0; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Thanks for your order!</h2>
      <p>Order #{{order_number}} confirmed</p>
    </div>
    <div class="content">
      <p>Hi {{customer_name}},</p>
      <p>We've received your order and will process it shortly.</p>
      <h3>Order Summary</h3>
      {{order_items}}
      <p class="total">Total: {{order_total}}</p>
    </div>
    <div class="footer">
      <p>&copy; {{current_year}} {{site_name}}</p>
    </div>
  </div>
</body>
</html>""",
        "text_body": """Thanks for your order!

Order #{{order_number}} confirmed

Hi {{customer_name}},

We've received your order and will process it shortly.

{{order_summary}}

Total: {{order_total}}

(c) {{current_year}} {{site_name}}"""
    }
}


@router.post("/templates/create-defaults")
async def create_default_templates(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create default email templates for a project."""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    created = []

    for key, data in DEFAULT_TEMPLATES.items():
        # Check if exists
        existing = db.query(EmailTemplate).filter(
            EmailTemplate.project_id == project_id,
            EmailTemplate.slug == data["slug"]
        ).first()

        if not existing:
            template = EmailTemplate(
                project_id=project_id,
                name=data["name"],
                slug=data["slug"],
                template_type=data["template_type"],
                subject=data["subject"],
                html_body=data["html_body"],
                text_body=data.get("text_body"),
                is_default=True
            )
            db.add(template)
            created.append(data["slug"])

    db.commit()

    return {"success": True, "created": created}
