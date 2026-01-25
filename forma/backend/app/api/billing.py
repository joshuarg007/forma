"""Billing Routes"""
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
import stripe

from app.db.database import get_db
from app.db.models import User
from app.core.config import settings
from app.core.security import get_current_user_required
from app.schemas.billing import (
    CheckoutRequest, CheckoutResponse,
    SubscriptionResponse, PortalResponse
)
from app.services.billing import billing_service

router = APIRouter(prefix="/api/billing", tags=["billing"])


@router.get("/subscription", response_model=SubscriptionResponse)
async def get_subscription(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    """Get current subscription info."""
    info = billing_service.get_subscription(db, user)
    return SubscriptionResponse(**info)


@router.post("/checkout", response_model=CheckoutResponse)
async def create_checkout(
    data: CheckoutRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    """Create Stripe checkout session for plan upgrade."""
    try:
        url = billing_service.create_checkout_session(
            db=db,
            user=user,
            plan=data.plan,
            success_url=data.success_url,
            cancel_url=data.cancel_url
        )
        return CheckoutResponse(checkout_url=url)
    except stripe.StripeError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/portal", response_model=PortalResponse)
async def create_portal(
    return_url: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    """Create Stripe customer portal session."""
    try:
        url = billing_service.create_portal_session(db, user, return_url)
        return PortalResponse(portal_url=url)
    except stripe.StripeError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    """Handle Stripe webhooks."""
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.stripe_webhook_secret
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")

    billing_service.handle_webhook(db, event)
    return {"status": "success"}


# =============================================================================
# STRIPE CONNECT (For creators/sellers)
# =============================================================================

@router.get("/connect/status")
async def get_connect_status(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    """Get user's Stripe Connect account status."""
    status = billing_service.get_connect_account_status(user)
    return status


@router.post("/connect/onboard")
async def create_connect_onboarding(
    return_url: str,
    refresh_url: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    """Create Stripe Connect onboarding link for creators."""
    try:
        url = billing_service.create_connect_onboarding_link(
            db=db,
            user=user,
            return_url=return_url,
            refresh_url=refresh_url
        )
        return {"onboarding_url": url}
    except stripe.StripeError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/connect/dashboard")
async def get_connect_dashboard(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    """Get Stripe Connect dashboard login link."""
    if not user.stripe_connect_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No connected Stripe account"
        )

    try:
        url = billing_service.create_connect_login_link(user)
        return {"dashboard_url": url}
    except stripe.StripeError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
