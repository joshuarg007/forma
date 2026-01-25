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
            # Check if this is a marketplace purchase
            metadata = data.get("metadata", {})
            if metadata.get("type") == "marketplace_purchase":
                self.handle_marketplace_payment_success(db, data)
            else:
                self._handle_checkout_completed(db, data)
        elif event_type == "customer.subscription.updated":
            self._handle_subscription_updated(db, data)
        elif event_type == "customer.subscription.deleted":
            self._handle_subscription_deleted(db, data)
        elif event_type == "account.updated":
            # Connect account updated
            self._handle_connect_account_updated(db, data)

    def _handle_connect_account_updated(self, db: Session, data: dict):
        """Handle Connect account status updates."""
        account_id = data.get("id")
        # Log for monitoring - actual user update happens on next API call
        print(f"Connect account updated: {account_id}")

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


    def create_connect_account(self, db: Session, user: User) -> str:
        """Create Stripe Connect account for creator."""
        if user.stripe_connect_id:
            return user.stripe_connect_id

        account = stripe.Account.create(
            type="express",
            country="US",
            email=user.email,
            capabilities={
                "card_payments": {"requested": True},
                "transfers": {"requested": True}
            },
            metadata={"user_id": str(user.id)}
        )

        user.stripe_connect_id = account.id
        db.commit()

        return account.id

    def create_connect_onboarding_link(
        self,
        db: Session,
        user: User,
        return_url: str,
        refresh_url: str
    ) -> str:
        """Create Stripe Connect onboarding link."""
        account_id = self.create_connect_account(db, user)

        link = stripe.AccountLink.create(
            account=account_id,
            refresh_url=refresh_url,
            return_url=return_url,
            type="account_onboarding"
        )

        return link.url

    def create_connect_login_link(self, user: User) -> str:
        """Create Stripe Connect dashboard login link."""
        if not user.stripe_connect_id:
            raise ValueError("User has no connected account")

        link = stripe.Account.create_login_link(user.stripe_connect_id)
        return link.url

    def get_connect_account_status(self, user: User) -> dict:
        """Get Connect account status."""
        if not user.stripe_connect_id:
            return {"connected": False, "charges_enabled": False, "payouts_enabled": False}

        try:
            account = stripe.Account.retrieve(user.stripe_connect_id)
            return {
                "connected": True,
                "charges_enabled": account.charges_enabled,
                "payouts_enabled": account.payouts_enabled,
                "details_submitted": account.details_submitted
            }
        except stripe.StripeError:
            return {"connected": False, "charges_enabled": False, "payouts_enabled": False}

    def create_marketplace_checkout(
        self,
        db: Session,
        buyer: User,
        listing_id: str,
        listing_title: str,
        amount_cents: int,
        seller_connect_id: str,
        success_url: str,
        cancel_url: str
    ) -> str:
        """
        Create checkout session for marketplace purchase with Connect transfer.
        15% platform fee, 85% to creator.
        """
        customer_id = self.get_or_create_customer(db, buyer)

        # Calculate split
        platform_fee_cents = int(amount_cents * 0.15)  # 15% platform fee

        session = stripe.checkout.Session.create(
            customer=customer_id,
            mode="payment",
            payment_method_types=["card"],
            line_items=[{
                "price_data": {
                    "currency": "usd",
                    "unit_amount": amount_cents,
                    "product_data": {
                        "name": listing_title,
                        "description": f"Marketplace component: {listing_title}"
                    }
                },
                "quantity": 1
            }],
            payment_intent_data={
                "application_fee_amount": platform_fee_cents,
                "transfer_data": {
                    "destination": seller_connect_id
                },
                "metadata": {
                    "listing_id": listing_id,
                    "buyer_id": str(buyer.id)
                }
            },
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={
                "type": "marketplace_purchase",
                "listing_id": listing_id,
                "buyer_id": str(buyer.id)
            }
        )

        return session.url

    def create_product_checkout(
        self,
        db: Session,
        buyer: User,
        product_name: str,
        price_cents: int,
        quantity: int,
        seller_connect_id: str,
        success_url: str,
        cancel_url: str,
        metadata: dict = None
    ) -> str:
        """
        Create checkout session for e-commerce product purchase with Connect transfer.
        For deployed sites selling products.
        """
        # Calculate split (configurable per seller, default 5% platform fee)
        platform_fee_cents = int(price_cents * quantity * 0.05)

        session = stripe.checkout.Session.create(
            mode="payment",
            payment_method_types=["card"],
            line_items=[{
                "price_data": {
                    "currency": "usd",
                    "unit_amount": price_cents,
                    "product_data": {
                        "name": product_name
                    }
                },
                "quantity": quantity
            }],
            payment_intent_data={
                "application_fee_amount": platform_fee_cents,
                "transfer_data": {
                    "destination": seller_connect_id
                },
                "metadata": metadata or {}
            },
            success_url=success_url,
            cancel_url=cancel_url,
            metadata=metadata or {}
        )

        return session.url

    def handle_marketplace_payment_success(self, db: Session, data: dict):
        """Handle successful marketplace payment."""
        from app.db.models import Purchase, MarketplaceListing

        metadata = data.get("metadata", {})
        listing_id = metadata.get("listing_id")
        buyer_id = metadata.get("buyer_id")
        payment_intent = data.get("payment_intent")
        amount = data.get("amount_total", 0) / 100  # Convert from cents

        if not listing_id or not buyer_id:
            return

        listing = db.query(MarketplaceListing).filter(
            MarketplaceListing.id == listing_id
        ).first()

        if not listing:
            return

        # Create purchase record
        platform_fee = amount * 0.15
        creator_payout = amount - platform_fee

        purchase = Purchase(
            listing_id=listing_id,
            buyer_id=buyer_id,
            amount_usd=amount,
            stripe_payment_id=payment_intent,
            platform_fee=platform_fee,
            creator_payout=creator_payout,
            status="completed"
        )

        listing.revenue_total += amount

        db.add(purchase)
        db.commit()


billing_service = BillingService()
