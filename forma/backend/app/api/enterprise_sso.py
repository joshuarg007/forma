"""Enterprise SSO/SAML API for single sign-on"""
import json
import logging
from uuid import UUID, uuid4
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
from urllib.parse import urlencode

from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from app.db.database import get_db
from app.db.models import User, Team, TeamMember, SSOConfig, SSOProvider, SSOSession
from app.api.auth import get_current_user, create_access_token, create_refresh_token
from app.core.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/sso", tags=["enterprise-sso"])
admin_router = APIRouter(prefix="/api/teams/{team_id}/sso", tags=["enterprise-sso"])


# Pydantic models
class SSOConfigCreate(BaseModel):
    """Create SSO configuration"""
    provider: str = Field(..., description="saml, oidc, okta, azure_ad, google_workspace")
    display_name: Optional[str] = None

    # SAML settings
    idp_entity_id: Optional[str] = None
    idp_sso_url: Optional[str] = None
    idp_certificate: Optional[str] = None

    # OIDC settings
    client_id: Optional[str] = None
    client_secret: Optional[str] = None
    authorization_url: Optional[str] = None
    token_url: Optional[str] = None
    userinfo_url: Optional[str] = None
    scopes: Optional[str] = "openid profile email"

    # Domain verification
    allowed_domains: Optional[list[str]] = None


class SSOConfigUpdate(BaseModel):
    """Update SSO configuration"""
    display_name: Optional[str] = None
    enabled: Optional[bool] = None

    # SAML settings
    idp_entity_id: Optional[str] = None
    idp_sso_url: Optional[str] = None
    idp_certificate: Optional[str] = None

    # OIDC settings
    client_id: Optional[str] = None
    client_secret: Optional[str] = None
    authorization_url: Optional[str] = None
    token_url: Optional[str] = None
    userinfo_url: Optional[str] = None
    scopes: Optional[str] = None

    # Domain verification
    allowed_domains: Optional[list[str]] = None


class SSOLoginRequest(BaseModel):
    """SSO login request"""
    email: str


class SSOCallbackRequest(BaseModel):
    """SSO callback data"""
    code: Optional[str] = None
    state: Optional[str] = None
    SAMLResponse: Optional[str] = None
    RelayState: Optional[str] = None


# Helper functions
def get_sso_config_for_email(email: str, db: Session) -> Optional[tuple]:
    """Find SSO config based on email domain"""
    domain = email.split("@")[-1].lower()

    # Find team with SSO configured for this domain
    configs = db.query(SSOConfig).filter(
        SSOConfig.enabled == True
    ).all()

    for config in configs:
        allowed = config.allowed_domains or []
        if domain in [d.lower() for d in allowed]:
            team = db.query(Team).filter(Team.id == config.team_id).first()
            return (config, team)

    return None


def generate_state_token() -> str:
    """Generate random state token for OAuth"""
    import secrets
    return secrets.token_urlsafe(32)


def build_oidc_auth_url(config: SSOConfig, state: str, redirect_uri: str) -> str:
    """Build OIDC authorization URL"""
    params = {
        "client_id": config.client_id,
        "response_type": "code",
        "scope": config.scopes or "openid profile email",
        "redirect_uri": redirect_uri,
        "state": state,
    }

    # Add nonce for security
    import secrets
    params["nonce"] = secrets.token_urlsafe(16)

    return f"{config.authorization_url}?{urlencode(params)}"


async def exchange_oidc_code(config: SSOConfig, code: str, redirect_uri: str) -> Dict:
    """Exchange authorization code for tokens"""
    import httpx

    async with httpx.AsyncClient() as client:
        response = await client.post(
            config.token_url,
            data={
                "grant_type": "authorization_code",
                "client_id": config.client_id,
                "client_secret": config.client_secret,
                "code": code,
                "redirect_uri": redirect_uri,
            },
            headers={"Accept": "application/json"},
            timeout=30.0
        )

        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to exchange code for token")

        return response.json()


async def get_oidc_userinfo(config: SSOConfig, access_token: str) -> Dict:
    """Get user info from OIDC provider"""
    import httpx

    async with httpx.AsyncClient() as client:
        response = await client.get(
            config.userinfo_url,
            headers={
                "Authorization": f"Bearer {access_token}",
                "Accept": "application/json",
            },
            timeout=30.0
        )

        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to get user info")

        return response.json()


def parse_saml_response(saml_response: str) -> Dict:
    """Parse SAML response and extract user attributes"""
    import base64
    from xml.etree import ElementTree

    try:
        decoded = base64.b64decode(saml_response)
        root = ElementTree.fromstring(decoded)

        # Extract attributes (simplified - production should use proper SAML library)
        namespaces = {
            'saml': 'urn:oasis:names:tc:SAML:2.0:assertion',
            'samlp': 'urn:oasis:names:tc:SAML:2.0:protocol',
        }

        attributes = {}

        # Find assertion
        assertion = root.find('.//saml:Assertion', namespaces)
        if assertion is None:
            raise ValueError("No assertion found in SAML response")

        # Extract NameID
        name_id = assertion.find('.//saml:NameID', namespaces)
        if name_id is not None and name_id.text:
            attributes['email'] = name_id.text

        # Extract attributes
        for attr in assertion.findall('.//saml:Attribute', namespaces):
            name = attr.get('Name', '')
            value_elem = attr.find('.//saml:AttributeValue', namespaces)
            if value_elem is not None and value_elem.text:
                # Map common SAML attributes
                if 'email' in name.lower():
                    attributes['email'] = value_elem.text
                elif 'firstname' in name.lower() or 'givenname' in name.lower():
                    attributes['first_name'] = value_elem.text
                elif 'lastname' in name.lower() or 'surname' in name.lower():
                    attributes['last_name'] = value_elem.text
                elif 'name' in name.lower():
                    attributes['name'] = value_elem.text

        return attributes

    except Exception as e:
        logger.error(f"Failed to parse SAML response: {e}")
        raise HTTPException(status_code=400, detail="Invalid SAML response")


# API Endpoints

@router.post("/lookup")
async def lookup_sso(
    request: SSOLoginRequest,
    db: Session = Depends(get_db)
):
    """Check if email domain has SSO configured"""
    result = get_sso_config_for_email(request.email, db)

    if not result:
        return {
            "sso_enabled": False,
            "message": "No SSO configured for this domain"
        }

    config, team = result

    return {
        "sso_enabled": True,
        "provider": config.provider.value,
        "team_name": team.name if team else None,
        "login_url": f"/api/sso/login?email={request.email}"
    }


@router.get("/login")
async def initiate_sso_login(
    email: str,
    redirect_url: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Initiate SSO login flow"""
    result = get_sso_config_for_email(email, db)

    if not result:
        raise HTTPException(status_code=400, detail="No SSO configured for this domain")

    config, team = result

    # Create SSO session
    state = generate_state_token()
    sso_session = SSOSession(
        id=uuid4(),
        sso_config_id=config.id,
        state=state,
        email=email,
        redirect_url=redirect_url or "/dashboard",
        expires_at=datetime.utcnow() + timedelta(minutes=10)
    )
    db.add(sso_session)
    db.commit()

    # Build redirect URL based on provider
    callback_url = f"{settings.api_base_url}/api/sso/callback"

    if config.provider == SSOProvider.SAML:
        # SAML redirect
        params = {
            "SAMLRequest": "",  # Would need to build actual SAML request
            "RelayState": state,
        }
        redirect_url = f"{config.idp_sso_url}?{urlencode(params)}"

    else:
        # OIDC/OAuth redirect
        redirect_url = build_oidc_auth_url(config, state, callback_url)

    return RedirectResponse(url=redirect_url, status_code=302)


@router.get("/callback")
@router.post("/callback")
async def sso_callback(
    request: Request,
    db: Session = Depends(get_db)
):
    """Handle SSO callback from identity provider"""
    # Get params from query string or form body
    params = dict(request.query_params)
    if request.method == "POST":
        form = await request.form()
        params.update(dict(form))

    state = params.get("state") or params.get("RelayState")
    if not state:
        raise HTTPException(status_code=400, detail="Missing state parameter")

    # Find SSO session
    sso_session = db.query(SSOSession).filter(
        SSOSession.state == state,
        SSOSession.expires_at > datetime.utcnow(),
        SSOSession.used == False
    ).first()

    if not sso_session:
        raise HTTPException(status_code=400, detail="Invalid or expired SSO session")

    # Get SSO config
    config = db.query(SSOConfig).filter(SSOConfig.id == sso_session.sso_config_id).first()
    if not config:
        raise HTTPException(status_code=400, detail="SSO configuration not found")

    # Process based on provider type
    user_info = {}

    if config.provider == SSOProvider.SAML:
        saml_response = params.get("SAMLResponse")
        if not saml_response:
            raise HTTPException(status_code=400, detail="Missing SAML response")
        user_info = parse_saml_response(saml_response)

    else:
        # OIDC flow
        code = params.get("code")
        if not code:
            raise HTTPException(status_code=400, detail="Missing authorization code")

        callback_url = f"{settings.api_base_url}/api/sso/callback"
        tokens = await exchange_oidc_code(config, code, callback_url)
        user_info = await get_oidc_userinfo(config, tokens.get("access_token"))

    # Validate email domain
    email = user_info.get("email", "").lower()
    if not email:
        raise HTTPException(status_code=400, detail="No email in SSO response")

    domain = email.split("@")[-1]
    allowed = [d.lower() for d in (config.allowed_domains or [])]
    if allowed and domain not in allowed:
        raise HTTPException(status_code=403, detail="Email domain not allowed")

    # Mark session as used
    sso_session.used = True
    db.commit()

    # Find or create user
    user = db.query(User).filter(User.email == email).first()

    if not user:
        # Create new user
        name = user_info.get("name") or f"{user_info.get('first_name', '')} {user_info.get('last_name', '')}".strip()
        user = User(
            id=uuid4(),
            email=email,
            name=name or email.split("@")[0],
            password_hash="sso_user",  # SSO users don't have passwords
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    # Add to team if not already member
    team = db.query(Team).filter(Team.id == config.team_id).first()
    if team:
        existing_member = db.query(TeamMember).filter(
            TeamMember.team_id == team.id,
            TeamMember.user_id == user.id
        ).first()

        if not existing_member:
            member = TeamMember(
                id=uuid4(),
                team_id=team.id,
                user_id=user.id,
                role="member",
                status="active",
                invited_by_id=team.owner_id,
            )
            db.add(member)
            db.commit()

    # Create tokens
    access_token = create_access_token(user_id=str(user.id))
    refresh_token = create_refresh_token(user_id=str(user.id))

    # Redirect to frontend with tokens
    redirect_url = sso_session.redirect_url or "/dashboard"
    params = urlencode({
        "access_token": access_token,
        "refresh_token": refresh_token,
        "sso": "true"
    })

    return RedirectResponse(url=f"{redirect_url}?{params}", status_code=302)


# Admin endpoints for SSO configuration

@admin_router.get("")
async def get_sso_config(
    team_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get SSO configuration for team"""
    # Verify user is team admin
    member = db.query(TeamMember).filter(
        TeamMember.team_id == team_id,
        TeamMember.user_id == current_user.id,
        TeamMember.role.in_(["owner", "admin"])
    ).first()

    if not member:
        raise HTTPException(status_code=403, detail="Not authorized")

    config = db.query(SSOConfig).filter(SSOConfig.team_id == team_id).first()

    if not config:
        return {"configured": False}

    return {
        "configured": True,
        "id": str(config.id),
        "provider": config.provider.value,
        "display_name": config.display_name,
        "enabled": config.enabled,
        "allowed_domains": config.allowed_domains,
        "created_at": config.created_at.isoformat(),
        # Don't expose secrets
        "has_idp_certificate": bool(config.idp_certificate),
        "has_client_secret": bool(config.client_secret),
        "idp_entity_id": config.idp_entity_id,
        "idp_sso_url": config.idp_sso_url,
        "authorization_url": config.authorization_url,
        "token_url": config.token_url,
        "userinfo_url": config.userinfo_url,
    }


@admin_router.post("")
async def create_sso_config(
    team_id: UUID,
    config_data: SSOConfigCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create SSO configuration for team"""
    # Verify user is team admin
    member = db.query(TeamMember).filter(
        TeamMember.team_id == team_id,
        TeamMember.user_id == current_user.id,
        TeamMember.role.in_(["owner", "admin"])
    ).first()

    if not member:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Check if config already exists
    existing = db.query(SSOConfig).filter(SSOConfig.team_id == team_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="SSO already configured for this team")

    # Create config
    try:
        provider = SSOProvider(config_data.provider)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid provider: {config_data.provider}")

    config = SSOConfig(
        id=uuid4(),
        team_id=team_id,
        provider=provider,
        display_name=config_data.display_name,
        enabled=False,  # Start disabled until fully configured
        idp_entity_id=config_data.idp_entity_id,
        idp_sso_url=config_data.idp_sso_url,
        idp_certificate=config_data.idp_certificate,
        client_id=config_data.client_id,
        client_secret=config_data.client_secret,
        authorization_url=config_data.authorization_url,
        token_url=config_data.token_url,
        userinfo_url=config_data.userinfo_url,
        scopes=config_data.scopes,
        allowed_domains=config_data.allowed_domains,
    )

    db.add(config)
    db.commit()
    db.refresh(config)

    return {
        "id": str(config.id),
        "provider": config.provider.value,
        "enabled": config.enabled,
        "message": "SSO configuration created. Enable it after testing."
    }


@admin_router.put("")
async def update_sso_config(
    team_id: UUID,
    config_data: SSOConfigUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update SSO configuration"""
    # Verify user is team admin
    member = db.query(TeamMember).filter(
        TeamMember.team_id == team_id,
        TeamMember.user_id == current_user.id,
        TeamMember.role.in_(["owner", "admin"])
    ).first()

    if not member:
        raise HTTPException(status_code=403, detail="Not authorized")

    config = db.query(SSOConfig).filter(SSOConfig.team_id == team_id).first()
    if not config:
        raise HTTPException(status_code=404, detail="SSO not configured")

    # Update fields
    update_data = config_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if hasattr(config, key):
            setattr(config, key, value)

    config.updated_at = datetime.utcnow()
    db.commit()

    return {
        "id": str(config.id),
        "provider": config.provider.value,
        "enabled": config.enabled,
        "message": "SSO configuration updated"
    }


@admin_router.delete("")
async def delete_sso_config(
    team_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete SSO configuration"""
    # Verify user is team owner
    member = db.query(TeamMember).filter(
        TeamMember.team_id == team_id,
        TeamMember.user_id == current_user.id,
        TeamMember.role == "owner"
    ).first()

    if not member:
        raise HTTPException(status_code=403, detail="Only team owner can delete SSO")

    config = db.query(SSOConfig).filter(SSOConfig.team_id == team_id).first()
    if not config:
        raise HTTPException(status_code=404, detail="SSO not configured")

    db.delete(config)
    db.commit()

    return {"deleted": True}


@admin_router.post("/test")
async def test_sso_config(
    team_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Test SSO configuration (initiates test login)"""
    # Verify user is team admin
    member = db.query(TeamMember).filter(
        TeamMember.team_id == team_id,
        TeamMember.user_id == current_user.id,
        TeamMember.role.in_(["owner", "admin"])
    ).first()

    if not member:
        raise HTTPException(status_code=403, detail="Not authorized")

    config = db.query(SSOConfig).filter(SSOConfig.team_id == team_id).first()
    if not config:
        raise HTTPException(status_code=404, detail="SSO not configured")

    # Return test URL
    return {
        "test_url": f"/api/sso/login?email=test@{config.allowed_domains[0] if config.allowed_domains else 'example.com'}&redirect_url=/sso/test-complete"
    }


@admin_router.get("/metadata")
async def get_sso_metadata(
    team_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get SAML service provider metadata"""
    config = db.query(SSOConfig).filter(SSOConfig.team_id == team_id).first()

    # Return SP metadata for SAML configuration
    entity_id = f"{settings.api_base_url}/api/sso/metadata/{team_id}"
    acs_url = f"{settings.api_base_url}/api/sso/callback"

    return {
        "entity_id": entity_id,
        "acs_url": acs_url,
        "name_id_format": "urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress",
        "xml": f"""<?xml version="1.0"?>
<EntityDescriptor xmlns="urn:oasis:names:tc:SAML:2.0:metadata" entityID="{entity_id}">
    <SPSSODescriptor protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
        <NameIDFormat>urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress</NameIDFormat>
        <AssertionConsumerService
            Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
            Location="{acs_url}"
            index="0" />
    </SPSSODescriptor>
</EntityDescriptor>"""
    }
