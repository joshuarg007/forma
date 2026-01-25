"""Stripe Billing Service"""
import stripe
from datetime import datetime
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.models import User, Subscription, PlanType

stripe.api_key = settings.stripe_api_key


class BillingService:
    """Handle Stripe billing operations."""

    def get_price_id(self, plan: PlanType) -> str:
        """Get Stripe price ID for plan."""
        prices = {
            PlanType.STARTER: settings.stripe_price_starter,
            PlanType.PRO: settings.stripe_price_pro,
            PlanType.TEAM: settings.stripe_price_team,
        }
        return prices.get(plan, settings.stripe_price_starter)

    def get_or_create_customer(self, db: Session, user: User) -> str:
        """Get or create Stripe customer."""
        if user.stripe_customer_id:
            return user.stripe_customer_id

        customer = stripe.Customer.create(
            email=user.email,
            name=user.name,
            metadata={"user_id": str(user.id)}
        )

        user.stripe_customer_id = customer.id
        db.commit()

        return customer.id

    def create_checkout_session(
        self,
        db: Session,
        user: User,
        plan: PlanType,
        success_url: str,
        cancel_url: str
    ) -> str:
        """Create Stripe checkout session."""
        customer_id = self.get_or_create_customer(db, user)
        price_id = self.get_price_id(plan)

        session = stripe.checkout.Session.create(
            customer=customer_id,
            mode="subscription",
            payment_method_types=["card"],
            line_items=[{
                "price": price_id,
                "quantity": 1
            }],
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={
                "user_id": str(user.id),
                "plan": plan.value
            }
        )

        return session.url

    def create_portal_session(self, db: Session, user: User, return_url: str) -> str:
        """Create Stripe customer portal session."""
        customer_id = self.get_or_create_customer(db, user)

        session = stripe.billing_portal.Session.create(
            customer=customer_id,
            return_url=return_url
        )

        return session.url

    def handle_webhook(self, db: Session, event: dict):
        """Handle Stripe webhook events."""
        event_type = event["type"]
        data = event["data"]["object"]

        if event_type == "checkout.session.completed":
            self._handle_checkout_completed(db, data)
        elif event_type == "customer.subscription.updated":
            self._handle_subscription_updated(db, data)
        elif event_type == "customer.subscription.deleted":
            self._handle_subscription_deleted(db, data)

    def _handle_checkout_completed(self, db: Session, data: dict):
        """Handle successful checkout."""
        user_id = data.get("metadata", {}).get("user_id")
        plan = data.get("metadata", {}).get("plan")
        subscription_id = data.get("subscription")

        if not user_id or not plan:
            return

        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return

        # Update user plan
        user.plan = PlanType(plan)

        # Create or update subscription record
        subscription = db.query(Subscription).filter(
            Subscription.user_id == user.id
        ).first()

        if subscription:
            subscription.stripe_subscription_id = subscription_id
            subscription.plan = PlanType(plan)
            subscription.status = "active"
        else:
            subscription = Subscription(
                user_id=user.id,
                stripe_subscription_id=subscription_id,
                plan=PlanType(plan),
                status="active"
            )
            db.add(subscription)

        db.commit()

    def _handle_subscription_updated(self, db: Session, data: dict):
        """Handle subscription update."""
        subscription_id = data.get("id")
        status = data.get("status")

        subscription = db.query(Subscription).filter(
            Subscription.stripe_subscription_id == subscription_id
        ).first()

        if subscription:
            subscription.status = status
            if data.get("current_period_start"):
                subscription.current_period_start = datetime.fromtimestamp(
                    data["current_period_start"]
                )
            if data.get("current_period_end"):
                subscription.current_period_end = datetime.fromtimestamp(
                    data["current_period_end"]
                )
            db.commit()

    def _handle_subscription_deleted(self, db: Session, data: dict):
        """Handle subscription cancellation."""
        subscription_id = data.get("id")

        subscription = db.query(Subscription).filter(
            Subscription.stripe_subscription_id == subscription_id
        ).first()

        if subscription:
            subscription.status = "canceled"
            # Downgrade user to starter
            user = db.query(User).filter(User.id == subscription.user_id).first()
            if user:
                user.plan = PlanType.STARTER
            db.commit()

    def get_subscription(self, db: Session, user: User) -> dict:
        """Get user's subscription info."""
        subscription = db.query(Subscription).filter(
            Subscription.user_id == user.id
        ).first()

        if not subscription:
            return {
                "plan": user.plan.value,
                "status": "active",
                "current_period_start": None,
                "current_period_end": None
            }

        return {
            "plan": subscription.plan.value,
            "status": subscription.status,
            "current_period_start": subscription.current_period_start,
            "current_period_end": subscription.current_period_end
        }


billing_service = BillingService()
