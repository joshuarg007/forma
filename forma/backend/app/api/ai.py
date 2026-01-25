"""AI Operations Routes - Disabled (Using TensorFlow.js locally)"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import User
from app.core.security import get_current_user_required
from app.schemas.ai import (
    GenerateRequest, EditRequest, ExplainRequest,
    GenerateResponse, ExplainResponse, UsageStats
)

router = APIRouter(prefix="/api/ai", tags=["ai"])


@router.post("/generate", response_model=GenerateResponse)
async def generate_component(
    data: GenerateRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    """
    Generate a component from natural language intent.

    NOTE: External AI generation is disabled.
    Use the TensorFlow.js model in the frontend for smart suggestions.
    """
    return GenerateResponse(
        success=False,
        error="AI generation is disabled. Using local TensorFlow.js model for smart suggestions instead.",
        tokens_used=0
    )


@router.post("/edit", response_model=GenerateResponse)
async def edit_component(
    data: EditRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    """
    Edit an existing component based on intent.

    NOTE: External AI editing is disabled.
    Use the TensorFlow.js model in the frontend for smart suggestions.
    """
    return GenerateResponse(
        success=False,
        error="AI editing is disabled. Using local TensorFlow.js model for smart suggestions instead.",
        tokens_used=0
    )


@router.post("/explain", response_model=ExplainResponse)
async def explain_code(
    data: ExplainRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    """
    Explain what a piece of code does.

    NOTE: External AI explanation is disabled.
    """
    return ExplainResponse(
        explanation="Code explanation is handled locally. External AI is disabled.",
        tokens_used=0
    )


@router.get("/usage", response_model=UsageStats)
async def get_usage(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    """
    Get current usage statistics.

    Returns mock data since external AI is disabled.
    """
    return UsageStats(
        operations_used=0,
        operations_limit=999999,
        tokens_used=0,
        cost_usd=0.0,
        plan="local"
    )
