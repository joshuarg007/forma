"""Form Builder Routes - CRUD for forms and submissions inbox"""
from datetime import datetime
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, Request
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.db.database import get_db
from app.db.models import User, Project, Form, FormSubmission, FormStatus, FormSubmissionStatus
from app.core.security import get_current_user_required

router = APIRouter(prefix="/api/forms", tags=["forms"])


# =============================================================================
# PYDANTIC SCHEMAS
# =============================================================================

class FormFieldSchema(BaseModel):
    """Schema for a form field definition."""
    name: str
    label: str
    type: str = "text"  # text, email, phone, textarea, select, checkbox, radio, file, date
    required: bool = False
    placeholder: Optional[str] = None
    options: Optional[List[str]] = None  # For select/radio
    validation: Optional[dict] = None  # Custom validation rules


class FormSettingsSchema(BaseModel):
    """Form settings."""
    submit_button_text: str = "Submit"
    show_labels: bool = True
    inline_labels: bool = False
    show_required_asterisk: bool = True


class FormCreate(BaseModel):
    """Create form request."""
    name: str
    slug: str
    description: Optional[str] = None
    fields: List[FormFieldSchema] = []
    settings: Optional[FormSettingsSchema] = None
    success_message: Optional[str] = "Thank you for your submission!"
    redirect_url: Optional[str] = None
    notify_email: Optional[str] = None
    notify_enabled: bool = True
    recaptcha_enabled: bool = False


class FormUpdate(BaseModel):
    """Update form request."""
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    fields: Optional[List[FormFieldSchema]] = None
    settings: Optional[FormSettingsSchema] = None
    status: Optional[FormStatus] = None
    success_message: Optional[str] = None
    redirect_url: Optional[str] = None
    notify_email: Optional[str] = None
    notify_enabled: Optional[bool] = None
    recaptcha_enabled: Optional[bool] = None


class FormResponse(BaseModel):
    """Form response."""
    id: UUID
    project_id: UUID
    name: str
    slug: str
    description: Optional[str] = None
    status: FormStatus
    fields: List[dict]
    settings: dict
    success_message: str
    redirect_url: Optional[str] = None
    notify_email: Optional[str] = None
    notify_enabled: bool
    recaptcha_enabled: bool
    submission_count: int
    last_submission_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class FormListResponse(BaseModel):
    """List of forms response."""
    forms: List[FormResponse]
    total: int


class FormSubmissionResponse(BaseModel):
    """Form submission response."""
    id: UUID
    form_id: UUID
    data: dict
    status: FormSubmissionStatus
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    referrer: Optional[str] = None
    page_url: Optional[str] = None
    is_spam: bool
    notes: Optional[str] = None
    created_at: datetime
    read_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class SubmissionsListResponse(BaseModel):
    """List of submissions response."""
    submissions: List[FormSubmissionResponse]
    total: int
    new_count: int


class SubmissionCreate(BaseModel):
    """Public submission create (from deployed sites)."""
    data: dict
    page_url: Optional[str] = None


# =============================================================================
# FORM CRUD ENDPOINTS
# =============================================================================

@router.get("/project/{project_id}", response_model=FormListResponse)
async def list_project_forms(
    project_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    """List all forms for a project."""
    # Verify project access
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == user.id
    ).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    forms = db.query(Form).filter(Form.project_id == project_id).all()

    return FormListResponse(
        forms=[FormResponse.model_validate(f) for f in forms],
        total=len(forms)
    )


@router.post("/project/{project_id}", response_model=FormResponse, status_code=status.HTTP_201_CREATED)
async def create_form(
    project_id: UUID,
    data: FormCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    """Create a new form for a project."""
    # Verify project access
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == user.id
    ).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    # Check slug uniqueness within project
    existing = db.query(Form).filter(
        Form.project_id == project_id,
        Form.slug == data.slug
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Form with this slug already exists"
        )

    form = Form(
        project_id=project_id,
        name=data.name,
        slug=data.slug,
        description=data.description,
        fields=[f.model_dump() for f in data.fields],
        settings=data.settings.model_dump() if data.settings else {},
        success_message=data.success_message or "Thank you for your submission!",
        redirect_url=data.redirect_url,
        notify_email=data.notify_email,
        notify_enabled=data.notify_enabled,
        recaptcha_enabled=data.recaptcha_enabled,
    )

    db.add(form)
    db.commit()
    db.refresh(form)

    return FormResponse.model_validate(form)


@router.get("/{form_id}", response_model=FormResponse)
async def get_form(
    form_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    """Get a form by ID."""
    form = db.query(Form).join(Project).filter(
        Form.id == form_id,
        Project.user_id == user.id
    ).first()

    if not form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Form not found"
        )

    return FormResponse.model_validate(form)


@router.put("/{form_id}", response_model=FormResponse)
async def update_form(
    form_id: UUID,
    data: FormUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    """Update a form."""
    form = db.query(Form).join(Project).filter(
        Form.id == form_id,
        Project.user_id == user.id
    ).first()

    if not form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Form not found"
        )

    # Update fields
    if data.name is not None:
        form.name = data.name
    if data.slug is not None:
        # Check slug uniqueness
        existing = db.query(Form).filter(
            Form.project_id == form.project_id,
            Form.slug == data.slug,
            Form.id != form_id
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Form with this slug already exists"
            )
        form.slug = data.slug
    if data.description is not None:
        form.description = data.description
    if data.fields is not None:
        form.fields = [f.model_dump() for f in data.fields]
    if data.settings is not None:
        form.settings = data.settings.model_dump()
    if data.status is not None:
        form.status = data.status
    if data.success_message is not None:
        form.success_message = data.success_message
    if data.redirect_url is not None:
        form.redirect_url = data.redirect_url
    if data.notify_email is not None:
        form.notify_email = data.notify_email
    if data.notify_enabled is not None:
        form.notify_enabled = data.notify_enabled
    if data.recaptcha_enabled is not None:
        form.recaptcha_enabled = data.recaptcha_enabled

    form.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(form)

    return FormResponse.model_validate(form)


@router.delete("/{form_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_form(
    form_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    """Delete a form and all its submissions."""
    form = db.query(Form).join(Project).filter(
        Form.id == form_id,
        Project.user_id == user.id
    ).first()

    if not form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Form not found"
        )

    db.delete(form)
    db.commit()

    return None


@router.post("/{form_id}/publish", response_model=FormResponse)
async def publish_form(
    form_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    """Publish a form to make it active."""
    form = db.query(Form).join(Project).filter(
        Form.id == form_id,
        Project.user_id == user.id
    ).first()

    if not form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Form not found"
        )

    form.status = FormStatus.PUBLISHED
    form.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(form)

    return FormResponse.model_validate(form)


# =============================================================================
# SUBMISSIONS ENDPOINTS
# =============================================================================

@router.get("/{form_id}/submissions", response_model=SubmissionsListResponse)
async def list_submissions(
    form_id: UUID,
    status_filter: Optional[FormSubmissionStatus] = None,
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    """List all submissions for a form (inbox)."""
    form = db.query(Form).join(Project).filter(
        Form.id == form_id,
        Project.user_id == user.id
    ).first()

    if not form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Form not found"
        )

    query = db.query(FormSubmission).filter(FormSubmission.form_id == form_id)

    if status_filter:
        query = query.filter(FormSubmission.status == status_filter)

    total = query.count()
    new_count = db.query(FormSubmission).filter(
        FormSubmission.form_id == form_id,
        FormSubmission.status == FormSubmissionStatus.NEW
    ).count()

    submissions = query.order_by(desc(FormSubmission.created_at)).offset(offset).limit(limit).all()

    return SubmissionsListResponse(
        submissions=[FormSubmissionResponse.model_validate(s) for s in submissions],
        total=total,
        new_count=new_count
    )


@router.get("/{form_id}/submissions/{submission_id}", response_model=FormSubmissionResponse)
async def get_submission(
    form_id: UUID,
    submission_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    """Get a single submission."""
    submission = db.query(FormSubmission).join(Form).join(Project).filter(
        FormSubmission.id == submission_id,
        Form.id == form_id,
        Project.user_id == user.id
    ).first()

    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found"
        )

    # Mark as read if new
    if submission.status == FormSubmissionStatus.NEW:
        submission.status = FormSubmissionStatus.READ
        submission.read_at = datetime.utcnow()
        db.commit()
        db.refresh(submission)

    return FormSubmissionResponse.model_validate(submission)


@router.post("/{form_id}/submissions/{submission_id}/mark-read")
async def mark_submission_read(
    form_id: UUID,
    submission_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    """Mark a submission as read."""
    submission = db.query(FormSubmission).join(Form).join(Project).filter(
        FormSubmission.id == submission_id,
        Form.id == form_id,
        Project.user_id == user.id
    ).first()

    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found"
        )

    submission.status = FormSubmissionStatus.READ
    submission.read_at = datetime.utcnow()
    db.commit()

    return {"status": "ok"}


@router.post("/{form_id}/submissions/{submission_id}/archive")
async def archive_submission(
    form_id: UUID,
    submission_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    """Archive a submission."""
    submission = db.query(FormSubmission).join(Form).join(Project).filter(
        FormSubmission.id == submission_id,
        Form.id == form_id,
        Project.user_id == user.id
    ).first()

    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found"
        )

    submission.status = FormSubmissionStatus.ARCHIVED
    db.commit()

    return {"status": "ok"}


@router.post("/{form_id}/submissions/{submission_id}/spam")
async def mark_submission_spam(
    form_id: UUID,
    submission_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    """Mark a submission as spam."""
    submission = db.query(FormSubmission).join(Form).join(Project).filter(
        FormSubmission.id == submission_id,
        Form.id == form_id,
        Project.user_id == user.id
    ).first()

    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found"
        )

    submission.status = FormSubmissionStatus.SPAM
    submission.is_spam = True
    db.commit()

    return {"status": "ok"}


@router.delete("/{form_id}/submissions/{submission_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_submission(
    form_id: UUID,
    submission_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    """Delete a submission."""
    submission = db.query(FormSubmission).join(Form).join(Project).filter(
        FormSubmission.id == submission_id,
        Form.id == form_id,
        Project.user_id == user.id
    ).first()

    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found"
        )

    db.delete(submission)
    db.commit()

    return None


# =============================================================================
# PUBLIC SUBMISSION ENDPOINT (For deployed sites)
# =============================================================================

# This router handles public form submissions from deployed sites
public_router = APIRouter(prefix="/api/submit", tags=["form-submissions"])


@public_router.post("/{project_id}/{form_slug}")
async def submit_form_public(
    project_id: UUID,
    form_slug: str,
    data: SubmissionCreate,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Public endpoint for form submissions from deployed sites.
    No authentication required - forms are identified by project_id and form_slug.
    """
    # Find the form
    form = db.query(Form).join(Project).filter(
        Form.slug == form_slug,
        Project.id == project_id,
        Form.status == FormStatus.PUBLISHED
    ).first()

    if not form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Form not found or not published"
        )

    # Check honeypot if enabled
    if form.honeypot_enabled and data.data.get('_honeypot'):
        # Silently accept but mark as spam
        submission = FormSubmission(
            form_id=form.id,
            data=data.data,
            status=FormSubmissionStatus.SPAM,
            is_spam=True,
            spam_score=1.0,
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get('user-agent', '')[:500],
            referrer=request.headers.get('referer', '')[:500],
            page_url=data.page_url,
        )
        db.add(submission)
        db.commit()

        return {
            "success": True,
            "message": form.success_message,
            "redirect_url": form.redirect_url
        }

    # Create submission
    submission = FormSubmission(
        form_id=form.id,
        data=data.data,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get('user-agent', '')[:500],
        referrer=request.headers.get('referer', '')[:500],
        page_url=data.page_url,
    )

    db.add(submission)

    # Update form stats
    form.submission_count = (form.submission_count or 0) + 1
    form.last_submission_at = datetime.utcnow()

    db.commit()

    # TODO: Send email notification if enabled
    # if form.notify_enabled and form.notify_email:
    #     send_notification_email(form, submission)

    return {
        "success": True,
        "message": form.success_message,
        "redirect_url": form.redirect_url,
        "submission_id": str(submission.id)
    }
