"""A/B Testing API - Experiments, variants, and conversion tracking"""
import hashlib
import math
from datetime import datetime
from typing import Optional, List, Dict, Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db.database import get_db
from app.db.models import (
    Project, User, Page, Experiment, ExperimentVariant, ExperimentAssignment,
    ExperimentStatus
)
from app.core.security import get_current_user_required as get_current_user


router = APIRouter(prefix="/api/projects/{project_id}/experiments", tags=["experiments"])
public_router = APIRouter(prefix="/experiments", tags=["experiments-public"])


# =============================================================================
# SCHEMAS
# =============================================================================

class VariantCreate(BaseModel):
    """Create a variant."""
    name: str
    slug: str
    weight: int = 50
    is_control: bool = False
    changes: Dict[str, Any] = {}


class ExperimentCreate(BaseModel):
    """Create an experiment."""
    name: str
    slug: str
    description: Optional[str] = None
    target_page_id: Optional[str] = None
    target_url_pattern: Optional[str] = None
    primary_goal: str = "click"
    primary_goal_selector: Optional[str] = None
    traffic_percentage: int = 100
    confidence_level: float = 0.95
    minimum_sample_size: int = 100
    variants: List[VariantCreate] = []


class ExperimentUpdate(BaseModel):
    """Update an experiment."""
    name: Optional[str] = None
    description: Optional[str] = None
    target_page_id: Optional[str] = None
    target_url_pattern: Optional[str] = None
    primary_goal: Optional[str] = None
    primary_goal_selector: Optional[str] = None
    traffic_percentage: Optional[int] = None
    confidence_level: Optional[float] = None
    minimum_sample_size: Optional[int] = None


class VariantUpdate(BaseModel):
    """Update a variant."""
    name: Optional[str] = None
    weight: Optional[int] = None
    changes: Optional[Dict[str, Any]] = None


class ConversionRequest(BaseModel):
    """Record a conversion."""
    visitor_id: str
    experiment_slug: str
    value: Optional[float] = None


# =============================================================================
# HELPERS
# =============================================================================

def assign_variant(
    visitor_id: str,
    experiment: Experiment,
    variants: List[ExperimentVariant]
) -> ExperimentVariant:
    """
    Deterministically assign a visitor to a variant based on visitor ID.
    Uses consistent hashing so the same visitor always gets the same variant.
    """
    # Hash visitor ID + experiment ID
    hash_input = f"{visitor_id}:{experiment.id}"
    hash_value = int(hashlib.md5(hash_input.encode()).hexdigest(), 16)

    # Calculate total weight
    total_weight = sum(v.weight for v in variants)

    # Find variant based on hash
    bucket = hash_value % total_weight
    cumulative = 0

    for variant in variants:
        cumulative += variant.weight
        if bucket < cumulative:
            return variant

    # Fallback to last variant
    return variants[-1]


def calculate_statistics(control: ExperimentVariant, treatment: ExperimentVariant) -> dict:
    """
    Calculate statistical significance using a two-proportion z-test.
    Returns conversion rates, lift, and significance.
    """
    n1 = control.visitors or 1
    n2 = treatment.visitors or 1
    c1 = control.conversions or 0
    c2 = treatment.conversions or 0

    # Conversion rates
    p1 = c1 / n1
    p2 = c2 / n2

    # Lift
    lift = ((p2 - p1) / p1 * 100) if p1 > 0 else 0

    # Pooled proportion
    p_pool = (c1 + c2) / (n1 + n2) if (n1 + n2) > 0 else 0

    # Standard error
    se = math.sqrt(p_pool * (1 - p_pool) * (1/n1 + 1/n2)) if p_pool > 0 and p_pool < 1 else 0

    # Z-score
    z_score = (p2 - p1) / se if se > 0 else 0

    # P-value (two-tailed)
    # Using normal approximation
    p_value = 2 * (1 - normal_cdf(abs(z_score)))

    # Confidence interval for difference (95%)
    ci_margin = 1.96 * se
    ci_lower = (p2 - p1 - ci_margin) * 100
    ci_upper = (p2 - p1 + ci_margin) * 100

    return {
        "control_conversion_rate": round(p1 * 100, 2),
        "treatment_conversion_rate": round(p2 * 100, 2),
        "lift": round(lift, 2),
        "z_score": round(z_score, 3),
        "p_value": round(p_value, 4),
        "is_significant": p_value < 0.05,
        "confidence_interval": [round(ci_lower, 2), round(ci_upper, 2)],
        "winner": "treatment" if p_value < 0.05 and p2 > p1 else ("control" if p_value < 0.05 and p1 > p2 else None)
    }


def normal_cdf(x: float) -> float:
    """Cumulative distribution function for standard normal distribution."""
    return 0.5 * (1 + math.erf(x / math.sqrt(2)))


# =============================================================================
# EXPERIMENT ENDPOINTS
# =============================================================================

@router.post("")
async def create_experiment(
    project_id: UUID,
    data: ExperimentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new A/B experiment."""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Check slug uniqueness
    existing = db.query(Experiment).filter(
        Experiment.project_id == project_id,
        Experiment.slug == data.slug
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Experiment slug already exists")

    experiment = Experiment(
        project_id=project_id,
        name=data.name,
        slug=data.slug,
        description=data.description,
        target_page_id=UUID(data.target_page_id) if data.target_page_id else None,
        target_url_pattern=data.target_url_pattern,
        primary_goal=data.primary_goal,
        primary_goal_selector=data.primary_goal_selector,
        traffic_percentage=data.traffic_percentage,
        confidence_level=data.confidence_level,
        minimum_sample_size=data.minimum_sample_size
    )

    db.add(experiment)
    db.flush()

    # Create variants
    if data.variants:
        for v in data.variants:
            variant = ExperimentVariant(
                experiment_id=experiment.id,
                name=v.name,
                slug=v.slug,
                weight=v.weight,
                is_control=v.is_control,
                changes=v.changes
            )
            db.add(variant)
    else:
        # Create default control and variant
        db.add(ExperimentVariant(
            experiment_id=experiment.id,
            name="Control",
            slug="control",
            weight=50,
            is_control=True
        ))
        db.add(ExperimentVariant(
            experiment_id=experiment.id,
            name="Variant A",
            slug="variant_a",
            weight=50,
            is_control=False
        ))

    db.commit()
    db.refresh(experiment)

    return {
        "id": str(experiment.id),
        "name": experiment.name,
        "slug": experiment.slug,
        "status": experiment.status.value
    }


@router.get("")
async def list_experiments(
    project_id: UUID,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all experiments for a project."""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    query = db.query(Experiment).filter(Experiment.project_id == project_id)

    if status:
        try:
            query = query.filter(Experiment.status == ExperimentStatus(status))
        except ValueError:
            pass

    experiments = query.order_by(Experiment.created_at.desc()).all()

    return {
        "experiments": [
            {
                "id": str(e.id),
                "name": e.name,
                "slug": e.slug,
                "status": e.status.value,
                "primary_goal": e.primary_goal,
                "traffic_percentage": e.traffic_percentage,
                "started_at": e.started_at.isoformat() if e.started_at else None,
                "variant_count": len(e.variants),
                "total_visitors": sum(v.visitors for v in e.variants),
                "total_conversions": sum(v.conversions for v in e.variants),
                "created_at": e.created_at.isoformat()
            }
            for e in experiments
        ]
    }


@router.get("/{experiment_id}")
async def get_experiment(
    project_id: UUID,
    experiment_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get experiment details with statistics."""
    experiment = db.query(Experiment).filter(
        Experiment.id == experiment_id,
        Experiment.project_id == project_id
    ).first()

    if not experiment:
        raise HTTPException(status_code=404, detail="Experiment not found")

    # Calculate stats
    variants_data = []
    control = None

    for v in experiment.variants:
        conversion_rate = (v.conversions / v.visitors * 100) if v.visitors > 0 else 0
        variant_data = {
            "id": str(v.id),
            "name": v.name,
            "slug": v.slug,
            "weight": v.weight,
            "is_control": v.is_control,
            "changes": v.changes,
            "visitors": v.visitors,
            "conversions": v.conversions,
            "conversion_rate": round(conversion_rate, 2)
        }
        variants_data.append(variant_data)

        if v.is_control:
            control = v

    # Calculate significance for each treatment vs control
    statistics = {}
    if control:
        for v in experiment.variants:
            if not v.is_control:
                statistics[v.slug] = calculate_statistics(control, v)

    return {
        "id": str(experiment.id),
        "name": experiment.name,
        "slug": experiment.slug,
        "description": experiment.description,
        "status": experiment.status.value,
        "target_page_id": str(experiment.target_page_id) if experiment.target_page_id else None,
        "target_url_pattern": experiment.target_url_pattern,
        "primary_goal": experiment.primary_goal,
        "primary_goal_selector": experiment.primary_goal_selector,
        "traffic_percentage": experiment.traffic_percentage,
        "confidence_level": experiment.confidence_level,
        "minimum_sample_size": experiment.minimum_sample_size,
        "started_at": experiment.started_at.isoformat() if experiment.started_at else None,
        "ended_at": experiment.ended_at.isoformat() if experiment.ended_at else None,
        "variants": variants_data,
        "statistics": statistics,
        "created_at": experiment.created_at.isoformat()
    }


@router.put("/{experiment_id}")
async def update_experiment(
    project_id: UUID,
    experiment_id: UUID,
    data: ExperimentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update experiment settings."""
    experiment = db.query(Experiment).filter(
        Experiment.id == experiment_id,
        Experiment.project_id == project_id
    ).first()

    if not experiment:
        raise HTTPException(status_code=404, detail="Experiment not found")

    if experiment.status == ExperimentStatus.RUNNING:
        raise HTTPException(
            status_code=400,
            detail="Cannot modify a running experiment. Pause it first."
        )

    update_data = data.model_dump(exclude_unset=True)

    if 'target_page_id' in update_data:
        update_data['target_page_id'] = UUID(update_data['target_page_id']) if update_data['target_page_id'] else None

    for key, value in update_data.items():
        setattr(experiment, key, value)

    db.commit()

    return {"success": True, "message": "Experiment updated"}


@router.post("/{experiment_id}/start")
async def start_experiment(
    project_id: UUID,
    experiment_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Start an experiment."""
    experiment = db.query(Experiment).filter(
        Experiment.id == experiment_id,
        Experiment.project_id == project_id
    ).first()

    if not experiment:
        raise HTTPException(status_code=404, detail="Experiment not found")

    if experiment.status == ExperimentStatus.RUNNING:
        raise HTTPException(status_code=400, detail="Experiment is already running")

    if len(experiment.variants) < 2:
        raise HTTPException(status_code=400, detail="Experiment needs at least 2 variants")

    experiment.status = ExperimentStatus.RUNNING
    experiment.started_at = datetime.utcnow()
    db.commit()

    return {"success": True, "message": "Experiment started"}


@router.post("/{experiment_id}/pause")
async def pause_experiment(
    project_id: UUID,
    experiment_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Pause a running experiment."""
    experiment = db.query(Experiment).filter(
        Experiment.id == experiment_id,
        Experiment.project_id == project_id
    ).first()

    if not experiment:
        raise HTTPException(status_code=404, detail="Experiment not found")

    if experiment.status != ExperimentStatus.RUNNING:
        raise HTTPException(status_code=400, detail="Experiment is not running")

    experiment.status = ExperimentStatus.PAUSED
    db.commit()

    return {"success": True, "message": "Experiment paused"}


@router.post("/{experiment_id}/complete")
async def complete_experiment(
    project_id: UUID,
    experiment_id: UUID,
    winner_variant_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark an experiment as completed."""
    experiment = db.query(Experiment).filter(
        Experiment.id == experiment_id,
        Experiment.project_id == project_id
    ).first()

    if not experiment:
        raise HTTPException(status_code=404, detail="Experiment not found")

    experiment.status = ExperimentStatus.COMPLETED
    experiment.ended_at = datetime.utcnow()
    db.commit()

    return {"success": True, "message": "Experiment completed"}


@router.delete("/{experiment_id}")
async def delete_experiment(
    project_id: UUID,
    experiment_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete an experiment."""
    experiment = db.query(Experiment).filter(
        Experiment.id == experiment_id,
        Experiment.project_id == project_id
    ).first()

    if not experiment:
        raise HTTPException(status_code=404, detail="Experiment not found")

    if experiment.status == ExperimentStatus.RUNNING:
        raise HTTPException(status_code=400, detail="Cannot delete a running experiment")

    db.delete(experiment)
    db.commit()

    return {"success": True, "message": "Experiment deleted"}


# =============================================================================
# VARIANT ENDPOINTS
# =============================================================================

@router.post("/{experiment_id}/variants")
async def add_variant(
    project_id: UUID,
    experiment_id: UUID,
    data: VariantCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add a variant to an experiment."""
    experiment = db.query(Experiment).filter(
        Experiment.id == experiment_id,
        Experiment.project_id == project_id
    ).first()

    if not experiment:
        raise HTTPException(status_code=404, detail="Experiment not found")

    if experiment.status == ExperimentStatus.RUNNING:
        raise HTTPException(status_code=400, detail="Cannot add variants to a running experiment")

    # Check slug uniqueness
    existing = db.query(ExperimentVariant).filter(
        ExperimentVariant.experiment_id == experiment_id,
        ExperimentVariant.slug == data.slug
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Variant slug already exists")

    variant = ExperimentVariant(
        experiment_id=experiment_id,
        name=data.name,
        slug=data.slug,
        weight=data.weight,
        is_control=data.is_control,
        changes=data.changes
    )

    db.add(variant)
    db.commit()
    db.refresh(variant)

    return {
        "id": str(variant.id),
        "name": variant.name,
        "slug": variant.slug
    }


@router.put("/{experiment_id}/variants/{variant_id}")
async def update_variant(
    project_id: UUID,
    experiment_id: UUID,
    variant_id: UUID,
    data: VariantUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a variant."""
    variant = db.query(ExperimentVariant).filter(
        ExperimentVariant.id == variant_id,
        ExperimentVariant.experiment_id == experiment_id
    ).first()

    if not variant:
        raise HTTPException(status_code=404, detail="Variant not found")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(variant, key, value)

    db.commit()

    return {"success": True, "message": "Variant updated"}


@router.delete("/{experiment_id}/variants/{variant_id}")
async def delete_variant(
    project_id: UUID,
    experiment_id: UUID,
    variant_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a variant."""
    experiment = db.query(Experiment).filter(
        Experiment.id == experiment_id
    ).first()

    if experiment and experiment.status == ExperimentStatus.RUNNING:
        raise HTTPException(status_code=400, detail="Cannot delete variants from a running experiment")

    variant = db.query(ExperimentVariant).filter(
        ExperimentVariant.id == variant_id,
        ExperimentVariant.experiment_id == experiment_id
    ).first()

    if not variant:
        raise HTTPException(status_code=404, detail="Variant not found")

    db.delete(variant)
    db.commit()

    return {"success": True, "message": "Variant deleted"}


# =============================================================================
# PUBLIC ENDPOINTS (for deployed sites)
# =============================================================================

@public_router.get("/{project_id}/assign")
async def get_assignment(
    project_id: UUID,
    visitor_id: str,
    experiment_slug: Optional[str] = None,
    page_path: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get experiment assignments for a visitor."""
    assignments = {}

    query = db.query(Experiment).filter(
        Experiment.project_id == project_id,
        Experiment.status == ExperimentStatus.RUNNING
    )

    if experiment_slug:
        query = query.filter(Experiment.slug == experiment_slug)

    experiments = query.all()

    for experiment in experiments:
        # Check if visitor is in traffic allocation
        hash_input = f"{visitor_id}:traffic:{experiment.id}"
        hash_value = int(hashlib.md5(hash_input.encode()).hexdigest(), 16)

        if (hash_value % 100) >= experiment.traffic_percentage:
            continue  # Not in experiment traffic

        # Check for existing assignment
        existing = db.query(ExperimentAssignment).filter(
            ExperimentAssignment.experiment_id == experiment.id,
            ExperimentAssignment.visitor_id == visitor_id
        ).first()

        if existing:
            variant = db.query(ExperimentVariant).filter(
                ExperimentVariant.id == existing.variant_id
            ).first()
        else:
            # Assign to variant
            variants = list(experiment.variants)
            variant = assign_variant(visitor_id, experiment, variants)

            # Record assignment
            assignment = ExperimentAssignment(
                experiment_id=experiment.id,
                variant_id=variant.id,
                visitor_id=visitor_id
            )
            db.add(assignment)

            # Increment visitor count
            variant.visitors += 1

        assignments[experiment.slug] = {
            "experiment_id": str(experiment.id),
            "variant_id": str(variant.id),
            "variant_slug": variant.slug,
            "variant_name": variant.name,
            "is_control": variant.is_control,
            "changes": variant.changes
        }

    db.commit()

    return {"assignments": assignments}


@public_router.post("/{project_id}/convert")
async def record_conversion(
    project_id: UUID,
    data: ConversionRequest,
    db: Session = Depends(get_db)
):
    """Record a conversion for a visitor."""
    experiment = db.query(Experiment).filter(
        Experiment.project_id == project_id,
        Experiment.slug == data.experiment_slug,
        Experiment.status == ExperimentStatus.RUNNING
    ).first()

    if not experiment:
        raise HTTPException(status_code=404, detail="Experiment not found")

    assignment = db.query(ExperimentAssignment).filter(
        ExperimentAssignment.experiment_id == experiment.id,
        ExperimentAssignment.visitor_id == data.visitor_id
    ).first()

    if not assignment:
        raise HTTPException(status_code=404, detail="No assignment found")

    if assignment.converted:
        return {"success": True, "already_converted": True}

    # Record conversion
    assignment.converted = True
    assignment.converted_at = datetime.utcnow()
    assignment.conversion_value = data.value

    # Increment conversion count
    variant = db.query(ExperimentVariant).filter(
        ExperimentVariant.id == assignment.variant_id
    ).first()

    if variant:
        variant.conversions += 1

    db.commit()

    return {"success": True, "already_converted": False}
