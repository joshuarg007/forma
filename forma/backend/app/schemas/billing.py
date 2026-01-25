"""Billing Schemas"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from app.db.models import PlanType


class CheckoutRequest(BaseModel):
    plan: PlanType
    success_url: str
    cancel_url: str


class CheckoutResponse(BaseModel):
    checkout_url: str


class SubscriptionResponse(BaseModel):
    plan: PlanType
    status: str
    current_period_start: Optional[datetime]
    current_period_end: Optional[datetime]


class PortalResponse(BaseModel):
    portal_url: str
