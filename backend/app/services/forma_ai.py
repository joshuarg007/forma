"""FORMA AI Engine - White-labeled Claude wrapper"""
import json
import re
from typing import Optional
from datetime import datetime, timedelta

import anthropic
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.config import settings
from app.db.models import User, AIUsage, OperationType, PlanType
from app.schemas.ai import ComponentResult, ProjectContext


SYSTEM_PROMPT = """You are FORMA, an expert React component generator. You create clean, production-ready React components using TypeScript and TailwindCSS.

When given a user intent, you generate:
1. A well-structured React functional component
2. Proper TypeScript types for props
3. TailwindCSS for styling (no external CSS)
4. Accessibility attributes where appropriate

Rules:
- Use modern React patterns (hooks, functional components)
- Export the component as default
- Include comprehensive prop types
- Use semantic HTML elements
- Make components responsive by default
- Keep code clean and readable
- No external dependencies unless explicitly requested

Output format - respond with ONLY a JSON object:
{
  "name": "ComponentName",
  "code": "// Full component code here",
  "props_schema": {"prop1": "string", "prop2": "number"},
  "explanation": "Brief explanation of the component"
}"""


EDIT_PROMPT = """You are FORMA, an expert React component editor. You modify existing React components based on user intent while preserving the overall structure and style.

Given the current component code and an edit request, make the minimal changes necessary to fulfill the request. Maintain:
- Existing code style
- TypeScript types
- TailwindCSS patterns
- Component structure

Output format - respond with ONLY a JSON object:
{
  "name": "ComponentName",
  "code": "// Full modified component code",
  "props_schema": {"prop1": "string"},
  "explanation": "What was changed and why"
}"""


class FormaAI:
    """White-labeled AI engine - users never see 'Claude'"""

    def __init__(self):
        self.client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
        self.model = settings.anthropic_model

    def _get_plan_limit(self, plan: PlanType) -> int:
        """Get operation limit for plan."""
        limits = {
            PlanType.STARTER: settings.starter_ops_limit,
            PlanType.PRO: settings.pro_ops_limit,
            PlanType.TEAM: settings.team_ops_limit,
            PlanType.ENTERPRISE: 999999,
        }
        return limits.get(plan, settings.starter_ops_limit)

    def check_usage(self, db: Session, user: User) -> dict:
        """Check if user can make AI request."""
        # Get usage this month
        month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        usage_count = db.query(func.count(AIUsage.id)).filter(
            AIUsage.user_id == user.id,
            AIUsage.created_at >= month_start
        ).scalar() or 0

        limit = self._get_plan_limit(user.plan)

        return {
            "allowed": usage_count < limit or user.plan == PlanType.ENTERPRISE,
            "used": usage_count,
            "limit": limit,
            "remaining": max(0, limit - usage_count),
            "overage": usage_count >= limit and user.plan != PlanType.ENTERPRISE,
        }

    def record_usage(
        self,
        db: Session,
        user: User,
        operation_type: OperationType,
        tokens_input: int,
        tokens_output: int
    ):
        """Record AI usage for billing."""
        # Calculate cost (approximate)
        cost = (tokens_input * 0.003 + tokens_output * 0.015) / 1000

        usage = AIUsage(
            user_id=user.id,
            operation_type=operation_type,
            tokens_input=tokens_input,
            tokens_output=tokens_output,
            cost_usd=cost
        )
        db.add(usage)
        db.commit()

    def _build_context_prompt(self, context: ProjectContext) -> str:
        """Build context from project data."""
        parts = []

        if context.design_system:
            parts.append(f"Design System:\n{json.dumps(context.design_system, indent=2)}")

        if context.existing_components:
            component_names = [c.get("name", "Unknown") for c in context.existing_components]
            parts.append(f"Existing components in project: {', '.join(component_names)}")

        return "\n\n".join(parts) if parts else ""

    def _parse_response(self, content: str) -> Optional[ComponentResult]:
        """Parse AI response to extract component."""
        try:
            # Try to find JSON in response
            json_match = re.search(r'\{[\s\S]*\}', content)
            if json_match:
                data = json.loads(json_match.group())
                return ComponentResult(
                    name=data.get("name", "Component"),
                    code=data.get("code", ""),
                    props_schema=data.get("props_schema", {}),
                    explanation=data.get("explanation", "")
                )
        except json.JSONDecodeError:
            pass
        return None

    async def generate_component(
        self,
        db: Session,
        user: User,
        intent: str,
        context: ProjectContext
    ) -> tuple[Optional[ComponentResult], int, Optional[str]]:
        """Generate a component from natural language intent."""
        # Check usage
        usage_status = self.check_usage(db, user)
        if not usage_status["allowed"]:
            return None, 0, "Monthly AI operation limit reached. Please upgrade your plan."

        # Build prompt
        context_str = self._build_context_prompt(context)
        user_prompt = f"{context_str}\n\nCreate a React component: {intent}" if context_str else f"Create a React component: {intent}"

        try:
            response = self.client.messages.create(
                model=self.model,
                max_tokens=4096,
                system=SYSTEM_PROMPT,
                messages=[{"role": "user", "content": user_prompt}]
            )

            # Record usage
            tokens_input = response.usage.input_tokens
            tokens_output = response.usage.output_tokens
            self.record_usage(db, user, OperationType.GENERATE, tokens_input, tokens_output)

            # Parse response
            content = response.content[0].text
            result = self._parse_response(content)

            if result:
                return result, tokens_input + tokens_output, None
            else:
                return None, tokens_input + tokens_output, "Failed to parse AI response"

        except anthropic.APIError as e:
            return None, 0, f"AI service error: {str(e)}"

    async def edit_component(
        self,
        db: Session,
        user: User,
        current_code: str,
        edit_intent: str,
        context: ProjectContext
    ) -> tuple[Optional[ComponentResult], int, Optional[str]]:
        """Edit an existing component based on intent."""
        usage_status = self.check_usage(db, user)
        if not usage_status["allowed"]:
            return None, 0, "Monthly AI operation limit reached."

        user_prompt = f"""Current component code:
```tsx
{current_code}
```

Edit request: {edit_intent}"""

        try:
            response = self.client.messages.create(
                model=self.model,
                max_tokens=4096,
                system=EDIT_PROMPT,
                messages=[{"role": "user", "content": user_prompt}]
            )

            tokens_input = response.usage.input_tokens
            tokens_output = response.usage.output_tokens
            self.record_usage(db, user, OperationType.EDIT, tokens_input, tokens_output)

            content = response.content[0].text
            result = self._parse_response(content)

            if result:
                return result, tokens_input + tokens_output, None
            else:
                return None, tokens_input + tokens_output, "Failed to parse AI response"

        except anthropic.APIError as e:
            return None, 0, f"AI service error: {str(e)}"

    async def explain_code(
        self,
        db: Session,
        user: User,
        code: str
    ) -> tuple[str, int, Optional[str]]:
        """Explain what a piece of code does."""
        usage_status = self.check_usage(db, user)
        if not usage_status["allowed"]:
            return "", 0, "Monthly AI operation limit reached."

        try:
            response = self.client.messages.create(
                model=self.model,
                max_tokens=1024,
                system="You are FORMA, a helpful assistant that explains React code clearly and concisely.",
                messages=[{
                    "role": "user",
                    "content": f"Explain this React component:\n\n```tsx\n{code}\n```"
                }]
            )

            tokens_input = response.usage.input_tokens
            tokens_output = response.usage.output_tokens
            self.record_usage(db, user, OperationType.EXPLAIN, tokens_input, tokens_output)

            return response.content[0].text, tokens_input + tokens_output, None

        except anthropic.APIError as e:
            return "", 0, f"AI service error: {str(e)}"

    def get_usage_stats(self, db: Session, user: User) -> dict:
        """Get user's usage statistics."""
        month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        # Count operations this month
        ops_count = db.query(func.count(AIUsage.id)).filter(
            AIUsage.user_id == user.id,
            AIUsage.created_at >= month_start
        ).scalar() or 0

        # Sum tokens
        tokens_sum = db.query(
            func.sum(AIUsage.tokens_input + AIUsage.tokens_output)
        ).filter(
            AIUsage.user_id == user.id,
            AIUsage.created_at >= month_start
        ).scalar() or 0

        # Sum cost
        cost_sum = db.query(func.sum(AIUsage.cost_usd)).filter(
            AIUsage.user_id == user.id,
            AIUsage.created_at >= month_start
        ).scalar() or 0.0

        return {
            "operations_used": ops_count,
            "operations_limit": self._get_plan_limit(user.plan),
            "tokens_used": tokens_sum,
            "cost_usd": round(cost_sum, 4),
            "plan": user.plan.value
        }


# Singleton instance
forma_ai = FormaAI()
