"""AI Operations Routes"""
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import User, Project, Component, Intention
from app.core.security import get_current_user_required
from app.schemas.ai import (
    GenerateRequest, EditRequest, ExplainRequest,
    GenerateResponse, ExplainResponse, UsageStats, ProjectContext
)
from app.services.forma_ai import forma_ai

router = APIRouter(prefix="/api/ai", tags=["ai"])


@router.post("/generate", response_model=GenerateResponse)
async def generate_component(
    data: GenerateRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    """Generate a component from natural language intent."""
    # Verify project ownership
    project = db.query(Project).filter(
        Project.id == data.context.project_id,
        Project.user_id == user.id
    ).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    # Generate component
    result, tokens, error = await forma_ai.generate_component(
        db=db,
        user=user,
        intent=data.intent,
        context=data.context
    )

    if error:
        return GenerateResponse(
            success=False,
            error=error,
            tokens_used=tokens
        )

    # Save component to project
    if result:
        component = Component(
            project_id=project.id,
            name=result.name,
            intent=data.intent,
            code=result.code,
            props_schema=result.props_schema
        )
        db.add(component)
        db.commit()

        # Create intention record
        intention = Intention(
            project_id=project.id,
            component_id=component.id,
            intent_text=data.intent,
            version=1,
            snapshot={"code": result.code, "props_schema": result.props_schema}
        )
        db.add(intention)
        db.commit()

    return GenerateResponse(
        success=True,
        result=result,
        tokens_used=tokens
    )


@router.post("/edit", response_model=GenerateResponse)
async def edit_component(
    data: EditRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    """Edit an existing component based on intent."""
    # Get component
    component = db.query(Component).filter(
        Component.id == data.component_id
    ).first()

    if not component:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Component not found"
        )

    # Verify project ownership
    project = db.query(Project).filter(
        Project.id == component.project_id,
        Project.user_id == user.id
    ).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )

    # Edit component
    result, tokens, error = await forma_ai.edit_component(
        db=db,
        user=user,
        current_code=component.code or "",
        edit_intent=data.edit_intent,
        context=data.context
    )

    if error:
        return GenerateResponse(
            success=False,
            error=error,
            tokens_used=tokens
        )

    # Update component
    if result:
        # Get current version
        max_version = db.query(Intention).filter(
            Intention.component_id == component.id
        ).count()

        component.code = result.code
        component.props_schema = result.props_schema
        component.intent = data.edit_intent

        # Create new intention
        intention = Intention(
            project_id=project.id,
            component_id=component.id,
            intent_text=data.edit_intent,
            version=max_version + 1,
            snapshot={"code": result.code, "props_schema": result.props_schema}
        )
        db.add(intention)
        db.commit()

    return GenerateResponse(
        success=True,
        result=result,
        tokens_used=tokens
    )


@router.post("/explain", response_model=ExplainResponse)
async def explain_code(
    data: ExplainRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    """Explain what a piece of code does."""
    explanation, tokens, error = await forma_ai.explain_code(
        db=db,
        user=user,
        code=data.code
    )

    if error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error
        )

    return ExplainResponse(
        explanation=explanation,
        tokens_used=tokens
    )


@router.get("/usage", response_model=UsageStats)
async def get_usage(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    """Get current usage statistics."""
    stats = forma_ai.get_usage_stats(db, user)
    return UsageStats(**stats)
