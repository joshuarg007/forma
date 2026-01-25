"""FORMA AI Engine - Disabled (Using TensorFlow.js locally)

This service is kept as a stub for API compatibility.
All AI functionality has been moved to the frontend using TensorFlow.js.
"""
from typing import Optional

from sqlalchemy.orm import Session

from app.db.models import User, PlanType
from app.schemas.ai import ComponentResult, ProjectContext


class FormaAI:
    """
    AI Engine stub - External AI is disabled.

    The project now uses TensorFlow.js in the browser for:
    - Component suggestions
    - Smart recommendations
    - Personalized learning

    No external API calls are made.
    """

    def __init__(self):
        self.disabled = True

    def _get_plan_limit(self, plan: PlanType) -> int:
        """Get operation limit for plan - returns unlimited since AI is local."""
        return 999999

    def check_usage(self, db: Session, user: User) -> dict:
        """Check if user can make AI request - always allowed since AI is local."""
        return {
            "allowed": True,
            "used": 0,
            "limit": 999999,
            "remaining": 999999,
            "overage": False,
        }

    def record_usage(
        self,
        db: Session,
        user: User,
        operation_type: str,
        tokens_input: int,
        tokens_output: int
    ):
        """Record AI usage - no-op since AI is local."""
        pass

    async def generate_component(
        self,
        db: Session,
        user: User,
        intent: str,
        context: ProjectContext
    ) -> tuple[Optional[ComponentResult], int, Optional[str]]:
        """
        Generate a component from natural language intent.

        NOTE: This is disabled. Use TensorFlow.js in the frontend.
        """
        return None, 0, "AI generation is disabled. Use local TensorFlow.js model instead."

    async def edit_component(
        self,
        db: Session,
        user: User,
        current_code: str,
        edit_intent: str,
        context: ProjectContext
    ) -> tuple[Optional[ComponentResult], int, Optional[str]]:
        """
        Edit an existing component based on intent.

        NOTE: This is disabled. Use TensorFlow.js in the frontend.
        """
        return None, 0, "AI editing is disabled. Use local TensorFlow.js model instead."

    async def explain_code(
        self,
        db: Session,
        user: User,
        code: str
    ) -> tuple[str, int, Optional[str]]:
        """
        Explain what a piece of code does.

        NOTE: This is disabled.
        """
        return "Code explanation is disabled.", 0, None

    def get_usage_stats(self, db: Session, user: User) -> dict:
        """Get user's usage statistics - returns unlimited since AI is local."""
        return {
            "operations_used": 0,
            "operations_limit": 999999,
            "tokens_used": 0,
            "cost_usd": 0.0,
            "plan": "local"
        }


# Singleton instance
forma_ai = FormaAI()
