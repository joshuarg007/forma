"""Component Routes"""
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import User, Project, Component, Intention
from app.core.security import get_current_user_required
from app.schemas.component import (
    ComponentCreate, ComponentUpdate, ComponentResponse, IntentionResponse
)

router = APIRouter(prefix="/api/projects/{project_id}/components", tags=["components"])


def get_project_or_404(project_id: UUID, user: User, db: Session) -> Project:
    """Get project and verify ownership."""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == user.id
    ).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    return project


@router.get("", response_model=List[ComponentResponse])
async def list_components(
    project_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    """List components in a project."""
    get_project_or_404(project_id, user, db)

    components = db.query(Component).filter(
        Component.project_id == project_id
    ).order_by(Component.position).all()

    return [ComponentResponse.model_validate(c) for c in components]


@router.post("", response_model=ComponentResponse, status_code=status.HTTP_201_CREATED)
async def create_component(
    project_id: UUID,
    data: ComponentCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    """Create a new component."""
    get_project_or_404(project_id, user, db)

    # Get max position
    max_pos = db.query(Component).filter(
        Component.project_id == project_id
    ).count()

    component = Component(
        project_id=project_id,
        name=data.name,
        intent=data.intent,
        code=data.code,
        parent_id=data.parent_id,
        position=max_pos
    )
    db.add(component)
    db.commit()
    db.refresh(component)

    # Create initial intention if intent provided
    if data.intent:
        intention = Intention(
            project_id=project_id,
            component_id=component.id,
            intent_text=data.intent,
            version=1,
            snapshot={"code": data.code, "props_schema": {}}
        )
        db.add(intention)
        db.commit()

    return ComponentResponse.model_validate(component)


@router.get("/{component_id}", response_model=ComponentResponse)
async def get_component(
    project_id: UUID,
    component_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    """Get a component by ID."""
    get_project_or_404(project_id, user, db)

    component = db.query(Component).filter(
        Component.id == component_id,
        Component.project_id == project_id
    ).first()

    if not component:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Component not found"
        )

    return ComponentResponse.model_validate(component)


@router.put("/{component_id}", response_model=ComponentResponse)
async def update_component(
    project_id: UUID,
    component_id: UUID,
    data: ComponentUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    """Update a component."""
    get_project_or_404(project_id, user, db)

    component = db.query(Component).filter(
        Component.id == component_id,
        Component.project_id == project_id
    ).first()

    if not component:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Component not found"
        )

    if data.name is not None:
        component.name = data.name
    if data.intent is not None:
        component.intent = data.intent
    if data.code is not None:
        component.code = data.code
    if data.props_schema is not None:
        component.props_schema = data.props_schema
    if data.position is not None:
        component.position = data.position

    db.commit()
    db.refresh(component)
    return ComponentResponse.model_validate(component)


@router.delete("/{component_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_component(
    project_id: UUID,
    component_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    """Delete a component."""
    get_project_or_404(project_id, user, db)

    component = db.query(Component).filter(
        Component.id == component_id,
        Component.project_id == project_id
    ).first()

    if not component:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Component not found"
        )

    db.delete(component)
    db.commit()


@router.get("/{component_id}/intentions", response_model=List[IntentionResponse])
async def get_intentions(
    project_id: UUID,
    component_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    """Get intention history for a component."""
    get_project_or_404(project_id, user, db)

    intentions = db.query(Intention).filter(
        Intention.component_id == component_id
    ).order_by(Intention.version.desc()).all()

    return [IntentionResponse.model_validate(i) for i in intentions]


@router.post("/{component_id}/rollback/{version}", response_model=ComponentResponse)
async def rollback_component(
    project_id: UUID,
    component_id: UUID,
    version: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    """Rollback component to a previous intention version."""
    get_project_or_404(project_id, user, db)

    component = db.query(Component).filter(
        Component.id == component_id,
        Component.project_id == project_id
    ).first()

    if not component:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Component not found"
        )

    intention = db.query(Intention).filter(
        Intention.component_id == component_id,
        Intention.version == version
    ).first()

    if not intention:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Intention version not found"
        )

    # Restore from snapshot
    snapshot = intention.snapshot or {}
    component.code = snapshot.get("code", component.code)
    component.props_schema = snapshot.get("props_schema", component.props_schema)
    component.intent = intention.intent_text

    db.commit()
    db.refresh(component)
    return ComponentResponse.model_validate(component)
