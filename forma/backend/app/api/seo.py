"""SEO Tools API - Meta tags, Open Graph, structured data, sitemaps"""
import json
from datetime import datetime
from typing import Optional, List
from uuid import UUID
from xml.etree import ElementTree as ET

from fastapi import APIRouter, Depends, HTTPException, Response
from pydantic import BaseModel, HttpUrl
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import Project, User, Page, SEOSettings, PageSEO
from app.core.security import get_current_user_required as get_current_user


router = APIRouter(prefix="/api/projects/{project_id}/seo", tags=["seo"])
public_router = APIRouter(prefix="/seo", tags=["seo-public"])


# =============================================================================
# SCHEMAS
# =============================================================================

class SEOSettingsUpdate(BaseModel):
    """Update global SEO settings."""
    default_title_template: Optional[str] = None
    default_description: Optional[str] = None
    default_keywords: Optional[str] = None
    site_name: Optional[str] = None
    site_logo_url: Optional[str] = None
    site_language: Optional[str] = None
    site_locale: Optional[str] = None
    twitter_handle: Optional[str] = None
    facebook_app_id: Optional[str] = None
    og_type: Optional[str] = None
    og_image_url: Optional[str] = None
    og_image_width: Optional[int] = None
    og_image_height: Optional[int] = None
    twitter_card_type: Optional[str] = None
    twitter_image_url: Optional[str] = None
    organization_name: Optional[str] = None
    organization_logo_url: Optional[str] = None
    organization_url: Optional[str] = None
    organization_social_profiles: Optional[List[str]] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    address_street: Optional[str] = None
    address_city: Optional[str] = None
    address_state: Optional[str] = None
    address_postal: Optional[str] = None
    address_country: Optional[str] = None
    robots_txt_content: Optional[str] = None
    allow_indexing: Optional[bool] = None
    allow_follow: Optional[bool] = None
    sitemap_enabled: Optional[bool] = None
    sitemap_change_freq: Optional[str] = None
    sitemap_priority: Optional[float] = None
    google_site_verification: Optional[str] = None
    bing_site_verification: Optional[str] = None


class PageSEOUpdate(BaseModel):
    """Update page-specific SEO settings."""
    title: Optional[str] = None
    description: Optional[str] = None
    keywords: Optional[str] = None
    canonical_url: Optional[str] = None
    noindex: Optional[bool] = None
    nofollow: Optional[bool] = None
    noarchive: Optional[bool] = None
    nosnippet: Optional[bool] = None
    og_title: Optional[str] = None
    og_description: Optional[str] = None
    og_image_url: Optional[str] = None
    og_type: Optional[str] = None
    twitter_title: Optional[str] = None
    twitter_description: Optional[str] = None
    twitter_image_url: Optional[str] = None
    twitter_card_type: Optional[str] = None
    structured_data: Optional[dict] = None
    sitemap_priority: Optional[float] = None
    sitemap_change_freq: Optional[str] = None
    exclude_from_sitemap: Optional[bool] = None


class SEOPreviewResponse(BaseModel):
    """SEO preview for a page."""
    title: str
    description: str
    url: str
    meta_tags: List[dict]
    og_tags: List[dict]
    twitter_tags: List[dict]
    structured_data: Optional[dict]


# =============================================================================
# HELPERS
# =============================================================================

def get_or_create_seo_settings(db: Session, project_id: UUID) -> SEOSettings:
    """Get or create SEO settings for a project."""
    settings = db.query(SEOSettings).filter(
        SEOSettings.project_id == project_id
    ).first()

    if not settings:
        project = db.query(Project).filter(Project.id == project_id).first()
        settings = SEOSettings(
            project_id=project_id,
            site_name=project.name if project else "My Site"
        )
        db.add(settings)
        db.commit()
        db.refresh(settings)

    return settings


def get_or_create_page_seo(
    db: Session,
    page_id: UUID,
    project_id: UUID
) -> PageSEO:
    """Get or create SEO settings for a page."""
    page_seo = db.query(PageSEO).filter(PageSEO.page_id == page_id).first()

    if not page_seo:
        page_seo = PageSEO(
            page_id=page_id,
            project_id=project_id
        )
        db.add(page_seo)
        db.commit()
        db.refresh(page_seo)

    return page_seo


def generate_meta_tags(
    page: Page,
    page_seo: Optional[PageSEO],
    settings: SEOSettings,
    base_url: str
) -> dict:
    """Generate complete meta tags for a page."""
    # Title
    if page_seo and page_seo.title:
        title = page_seo.title
    elif settings.default_title_template:
        title = settings.default_title_template.format(
            page_title=page.name,
            site_name=settings.site_name or ""
        )
    else:
        title = page.name

    # Description
    description = (
        page_seo.description if page_seo and page_seo.description
        else settings.default_description or ""
    )

    # Keywords
    keywords = (
        page_seo.keywords if page_seo and page_seo.keywords
        else settings.default_keywords or ""
    )

    # Canonical URL
    page_url = f"{base_url}/{page.slug}" if page.slug != "home" else base_url
    canonical = (
        page_seo.canonical_url if page_seo and page_seo.canonical_url
        else page_url
    )

    # Robots directives
    robots_parts = []
    if page_seo:
        if page_seo.noindex:
            robots_parts.append("noindex")
        elif settings.allow_indexing:
            robots_parts.append("index")
        if page_seo.nofollow:
            robots_parts.append("nofollow")
        elif settings.allow_follow:
            robots_parts.append("follow")
        if page_seo.noarchive:
            robots_parts.append("noarchive")
        if page_seo.nosnippet:
            robots_parts.append("nosnippet")
    else:
        if settings.allow_indexing:
            robots_parts.append("index")
        if settings.allow_follow:
            robots_parts.append("follow")

    robots = ", ".join(robots_parts) if robots_parts else "index, follow"

    # Meta tags
    meta_tags = [
        {"name": "title", "content": title},
        {"name": "description", "content": description},
        {"name": "robots", "content": robots},
    ]

    if keywords:
        meta_tags.append({"name": "keywords", "content": keywords})

    if canonical:
        meta_tags.append({"rel": "canonical", "href": canonical})

    if settings.google_site_verification:
        meta_tags.append({
            "name": "google-site-verification",
            "content": settings.google_site_verification
        })

    if settings.bing_site_verification:
        meta_tags.append({
            "name": "msvalidate.01",
            "content": settings.bing_site_verification
        })

    # Open Graph tags
    og_tags = [
        {"property": "og:type", "content": (
            page_seo.og_type if page_seo and page_seo.og_type
            else settings.og_type or "website"
        )},
        {"property": "og:title", "content": (
            page_seo.og_title if page_seo and page_seo.og_title
            else title
        )},
        {"property": "og:description", "content": (
            page_seo.og_description if page_seo and page_seo.og_description
            else description
        )},
        {"property": "og:url", "content": page_url},
        {"property": "og:site_name", "content": settings.site_name or ""},
        {"property": "og:locale", "content": settings.site_locale or "en_US"},
    ]

    og_image = (
        page_seo.og_image_url if page_seo and page_seo.og_image_url
        else settings.og_image_url
    )
    if og_image:
        og_tags.extend([
            {"property": "og:image", "content": og_image},
            {"property": "og:image:width", "content": str(settings.og_image_width or 1200)},
            {"property": "og:image:height", "content": str(settings.og_image_height or 630)},
        ])

    if settings.facebook_app_id:
        og_tags.append({"property": "fb:app_id", "content": settings.facebook_app_id})

    # Twitter Card tags
    twitter_tags = [
        {"name": "twitter:card", "content": (
            page_seo.twitter_card_type if page_seo and page_seo.twitter_card_type
            else settings.twitter_card_type or "summary_large_image"
        )},
        {"name": "twitter:title", "content": (
            page_seo.twitter_title if page_seo and page_seo.twitter_title
            else title
        )},
        {"name": "twitter:description", "content": (
            page_seo.twitter_description if page_seo and page_seo.twitter_description
            else description
        )},
    ]

    twitter_image = (
        page_seo.twitter_image_url if page_seo and page_seo.twitter_image_url
        else settings.twitter_image_url or og_image
    )
    if twitter_image:
        twitter_tags.append({"name": "twitter:image", "content": twitter_image})

    if settings.twitter_handle:
        twitter_tags.extend([
            {"name": "twitter:site", "content": f"@{settings.twitter_handle.lstrip('@')}"},
            {"name": "twitter:creator", "content": f"@{settings.twitter_handle.lstrip('@')}"},
        ])

    return {
        "title": title,
        "description": description,
        "url": page_url,
        "meta_tags": meta_tags,
        "og_tags": og_tags,
        "twitter_tags": twitter_tags
    }


def generate_organization_schema(settings: SEOSettings, base_url: str) -> dict:
    """Generate Organization JSON-LD schema."""
    schema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": settings.organization_name or settings.site_name,
        "url": settings.organization_url or base_url,
    }

    if settings.organization_logo_url:
        schema["logo"] = settings.organization_logo_url

    if settings.organization_social_profiles:
        schema["sameAs"] = settings.organization_social_profiles

    if settings.contact_email or settings.contact_phone:
        schema["contactPoint"] = {
            "@type": "ContactPoint",
            "contactType": "customer service"
        }
        if settings.contact_email:
            schema["contactPoint"]["email"] = settings.contact_email
        if settings.contact_phone:
            schema["contactPoint"]["telephone"] = settings.contact_phone

    if settings.address_street:
        schema["address"] = {
            "@type": "PostalAddress",
            "streetAddress": settings.address_street,
            "addressLocality": settings.address_city,
            "addressRegion": settings.address_state,
            "postalCode": settings.address_postal,
            "addressCountry": settings.address_country
        }

    return schema


def generate_webpage_schema(
    page: Page,
    settings: SEOSettings,
    base_url: str,
    title: str,
    description: str
) -> dict:
    """Generate WebPage JSON-LD schema."""
    page_url = f"{base_url}/{page.slug}" if page.slug != "home" else base_url

    return {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": title,
        "description": description,
        "url": page_url,
        "isPartOf": {
            "@type": "WebSite",
            "name": settings.site_name,
            "url": base_url
        }
    }


# =============================================================================
# GLOBAL SEO SETTINGS ENDPOINTS
# =============================================================================

@router.get("")
async def get_seo_settings(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get global SEO settings for a project."""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    settings = get_or_create_seo_settings(db, project_id)

    return {
        "id": str(settings.id),
        "default_title_template": settings.default_title_template,
        "default_description": settings.default_description,
        "default_keywords": settings.default_keywords,
        "site_name": settings.site_name,
        "site_logo_url": settings.site_logo_url,
        "site_language": settings.site_language,
        "site_locale": settings.site_locale,
        "twitter_handle": settings.twitter_handle,
        "facebook_app_id": settings.facebook_app_id,
        "og_type": settings.og_type,
        "og_image_url": settings.og_image_url,
        "og_image_width": settings.og_image_width,
        "og_image_height": settings.og_image_height,
        "twitter_card_type": settings.twitter_card_type,
        "twitter_image_url": settings.twitter_image_url,
        "organization_name": settings.organization_name,
        "organization_logo_url": settings.organization_logo_url,
        "organization_url": settings.organization_url,
        "organization_social_profiles": settings.organization_social_profiles,
        "contact_email": settings.contact_email,
        "contact_phone": settings.contact_phone,
        "address_street": settings.address_street,
        "address_city": settings.address_city,
        "address_state": settings.address_state,
        "address_postal": settings.address_postal,
        "address_country": settings.address_country,
        "robots_txt_content": settings.robots_txt_content,
        "allow_indexing": settings.allow_indexing,
        "allow_follow": settings.allow_follow,
        "sitemap_enabled": settings.sitemap_enabled,
        "sitemap_change_freq": settings.sitemap_change_freq,
        "sitemap_priority": settings.sitemap_priority,
        "google_site_verification": settings.google_site_verification,
        "bing_site_verification": settings.bing_site_verification
    }


@router.put("")
async def update_seo_settings(
    project_id: UUID,
    data: SEOSettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update global SEO settings."""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    settings = get_or_create_seo_settings(db, project_id)

    # Update fields
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(settings, key, value)

    db.commit()
    db.refresh(settings)

    return {"success": True, "message": "SEO settings updated"}


# =============================================================================
# PAGE SEO ENDPOINTS
# =============================================================================

@router.get("/pages/{page_id}")
async def get_page_seo(
    project_id: UUID,
    page_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get SEO settings for a specific page."""
    page = db.query(Page).filter(
        Page.id == page_id,
        Page.project_id == project_id
    ).first()

    if not page:
        raise HTTPException(status_code=404, detail="Page not found")

    page_seo = get_or_create_page_seo(db, page_id, project_id)

    return {
        "id": str(page_seo.id),
        "page_id": str(page_id),
        "title": page_seo.title,
        "description": page_seo.description,
        "keywords": page_seo.keywords,
        "canonical_url": page_seo.canonical_url,
        "noindex": page_seo.noindex,
        "nofollow": page_seo.nofollow,
        "noarchive": page_seo.noarchive,
        "nosnippet": page_seo.nosnippet,
        "og_title": page_seo.og_title,
        "og_description": page_seo.og_description,
        "og_image_url": page_seo.og_image_url,
        "og_type": page_seo.og_type,
        "twitter_title": page_seo.twitter_title,
        "twitter_description": page_seo.twitter_description,
        "twitter_image_url": page_seo.twitter_image_url,
        "twitter_card_type": page_seo.twitter_card_type,
        "structured_data": page_seo.structured_data,
        "sitemap_priority": page_seo.sitemap_priority,
        "sitemap_change_freq": page_seo.sitemap_change_freq,
        "exclude_from_sitemap": page_seo.exclude_from_sitemap
    }


@router.put("/pages/{page_id}")
async def update_page_seo(
    project_id: UUID,
    page_id: UUID,
    data: PageSEOUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update SEO settings for a specific page."""
    page = db.query(Page).filter(
        Page.id == page_id,
        Page.project_id == project_id
    ).first()

    if not page:
        raise HTTPException(status_code=404, detail="Page not found")

    page_seo = get_or_create_page_seo(db, page_id, project_id)

    # Update fields
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(page_seo, key, value)

    db.commit()

    return {"success": True, "message": "Page SEO updated"}


@router.get("/pages/{page_id}/preview")
async def preview_page_seo(
    project_id: UUID,
    page_id: UUID,
    base_url: str = "https://example.com",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Preview SEO meta tags for a page."""
    page = db.query(Page).filter(
        Page.id == page_id,
        Page.project_id == project_id
    ).first()

    if not page:
        raise HTTPException(status_code=404, detail="Page not found")

    settings = get_or_create_seo_settings(db, project_id)
    page_seo = db.query(PageSEO).filter(PageSEO.page_id == page_id).first()

    meta = generate_meta_tags(page, page_seo, settings, base_url)

    # Generate structured data
    structured_data = None
    if page_seo and page_seo.structured_data:
        structured_data = page_seo.structured_data
    else:
        structured_data = generate_webpage_schema(
            page, settings, base_url,
            meta["title"], meta["description"]
        )

    return SEOPreviewResponse(
        title=meta["title"],
        description=meta["description"],
        url=meta["url"],
        meta_tags=meta["meta_tags"],
        og_tags=meta["og_tags"],
        twitter_tags=meta["twitter_tags"],
        structured_data=structured_data
    )


# =============================================================================
# SITEMAP & ROBOTS.TXT
# =============================================================================

@router.get("/sitemap-preview")
async def preview_sitemap(
    project_id: UUID,
    base_url: str = "https://example.com",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Preview sitemap.xml content."""
    settings = get_or_create_seo_settings(db, project_id)

    if not settings.sitemap_enabled:
        return {"enabled": False, "content": None}

    pages = db.query(Page).filter(
        Page.project_id == project_id,
        Page.is_published == True
    ).all()

    # Build sitemap XML
    urlset = ET.Element("urlset")
    urlset.set("xmlns", "http://www.sitemaps.org/schemas/sitemap/0.9")

    for page in pages:
        # Check if excluded
        page_seo = db.query(PageSEO).filter(PageSEO.page_id == page.id).first()
        if page_seo and page_seo.exclude_from_sitemap:
            continue
        if page_seo and page_seo.noindex:
            continue

        url_elem = ET.SubElement(urlset, "url")

        # Location
        loc = ET.SubElement(url_elem, "loc")
        page_url = f"{base_url}/{page.slug}" if page.slug != "home" else base_url
        loc.text = page_url

        # Last modified
        lastmod = ET.SubElement(url_elem, "lastmod")
        lastmod.text = page.updated_at.strftime("%Y-%m-%d")

        # Change frequency
        changefreq = ET.SubElement(url_elem, "changefreq")
        changefreq.text = (
            page_seo.sitemap_change_freq if page_seo and page_seo.sitemap_change_freq
            else settings.sitemap_change_freq or "weekly"
        )

        # Priority
        priority = ET.SubElement(url_elem, "priority")
        priority.text = str(
            page_seo.sitemap_priority if page_seo and page_seo.sitemap_priority
            else settings.sitemap_priority or 0.5
        )

    xml_content = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml_content += ET.tostring(urlset, encoding="unicode")

    return {"enabled": True, "content": xml_content}


@router.get("/robots-preview")
async def preview_robots(
    project_id: UUID,
    base_url: str = "https://example.com",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Preview robots.txt content."""
    settings = get_or_create_seo_settings(db, project_id)

    if settings.robots_txt_content:
        content = settings.robots_txt_content
    else:
        # Generate default robots.txt
        lines = [
            "User-agent: *",
        ]

        if settings.allow_indexing:
            lines.append("Allow: /")
        else:
            lines.append("Disallow: /")

        if settings.sitemap_enabled:
            lines.append(f"\nSitemap: {base_url}/sitemap.xml")

        content = "\n".join(lines)

    return {"content": content}


# =============================================================================
# PUBLIC ENDPOINTS (for deployed sites)
# =============================================================================

@public_router.get("/{project_id}/sitemap.xml")
async def get_sitemap(
    project_id: UUID,
    db: Session = Depends(get_db)
):
    """Get sitemap.xml for a deployed site."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Site not found")

    settings = db.query(SEOSettings).filter(
        SEOSettings.project_id == project_id
    ).first()

    if not settings or not settings.sitemap_enabled:
        raise HTTPException(status_code=404, detail="Sitemap not enabled")

    # Determine base URL from project's custom domain or subdomain
    base_url = f"https://{project.subdomain}.formasite.io"
    if hasattr(project, 'custom_domain') and project.custom_domain:
        base_url = f"https://{project.custom_domain}"

    pages = db.query(Page).filter(
        Page.project_id == project_id,
        Page.is_published == True
    ).all()

    # Build sitemap XML
    urlset = ET.Element("urlset")
    urlset.set("xmlns", "http://www.sitemaps.org/schemas/sitemap/0.9")

    for page in pages:
        page_seo = db.query(PageSEO).filter(PageSEO.page_id == page.id).first()
        if page_seo and (page_seo.exclude_from_sitemap or page_seo.noindex):
            continue

        url_elem = ET.SubElement(urlset, "url")

        loc = ET.SubElement(url_elem, "loc")
        page_url = f"{base_url}/{page.slug}" if page.slug != "home" else base_url
        loc.text = page_url

        lastmod = ET.SubElement(url_elem, "lastmod")
        lastmod.text = page.updated_at.strftime("%Y-%m-%d")

        changefreq = ET.SubElement(url_elem, "changefreq")
        changefreq.text = (
            page_seo.sitemap_change_freq if page_seo and page_seo.sitemap_change_freq
            else settings.sitemap_change_freq if settings else "weekly"
        )

        priority = ET.SubElement(url_elem, "priority")
        priority.text = str(
            page_seo.sitemap_priority if page_seo and page_seo.sitemap_priority
            else settings.sitemap_priority if settings else 0.5
        )

    xml_content = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml_content += ET.tostring(urlset, encoding="unicode")

    return Response(content=xml_content, media_type="application/xml")


@public_router.get("/{project_id}/robots.txt")
async def get_robots(
    project_id: UUID,
    db: Session = Depends(get_db)
):
    """Get robots.txt for a deployed site."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Site not found")

    settings = db.query(SEOSettings).filter(
        SEOSettings.project_id == project_id
    ).first()

    base_url = f"https://{project.subdomain}.formasite.io"
    if hasattr(project, 'custom_domain') and project.custom_domain:
        base_url = f"https://{project.custom_domain}"

    if settings and settings.robots_txt_content:
        content = settings.robots_txt_content
    else:
        lines = ["User-agent: *"]
        if settings and settings.allow_indexing:
            lines.append("Allow: /")
        else:
            lines.append("Allow: /")  # Default to allow

        if settings and settings.sitemap_enabled:
            lines.append(f"\nSitemap: {base_url}/sitemap.xml")

        content = "\n".join(lines)

    return Response(content=content, media_type="text/plain")


# =============================================================================
# SEO ANALYSIS
# =============================================================================

@router.get("/analyze/{page_id}")
async def analyze_page_seo(
    project_id: UUID,
    page_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Analyze SEO for a page and provide suggestions."""
    page = db.query(Page).filter(
        Page.id == page_id,
        Page.project_id == project_id
    ).first()

    if not page:
        raise HTTPException(status_code=404, detail="Page not found")

    settings = get_or_create_seo_settings(db, project_id)
    page_seo = db.query(PageSEO).filter(PageSEO.page_id == page_id).first()

    issues = []
    suggestions = []
    score = 100

    # Check title
    title = page_seo.title if page_seo and page_seo.title else page.name
    if not title:
        issues.append({"type": "error", "field": "title", "message": "Page is missing a title"})
        score -= 20
    elif len(title) < 30:
        suggestions.append({"field": "title", "message": "Title is short. Aim for 50-60 characters."})
        score -= 5
    elif len(title) > 60:
        suggestions.append({"field": "title", "message": "Title may be truncated in search results (>60 chars)"})
        score -= 5

    # Check description
    description = page_seo.description if page_seo and page_seo.description else settings.default_description
    if not description:
        issues.append({"type": "warning", "field": "description", "message": "Page is missing a meta description"})
        score -= 15
    elif len(description) < 120:
        suggestions.append({"field": "description", "message": "Description is short. Aim for 150-160 characters."})
        score -= 5
    elif len(description) > 160:
        suggestions.append({"field": "description", "message": "Description may be truncated in search results (>160 chars)"})
        score -= 5

    # Check Open Graph
    og_image = page_seo.og_image_url if page_seo and page_seo.og_image_url else settings.og_image_url
    if not og_image:
        suggestions.append({"field": "og_image", "message": "Add an Open Graph image for better social sharing"})
        score -= 5

    # Check structured data
    if not (page_seo and page_seo.structured_data):
        suggestions.append({"field": "structured_data", "message": "Consider adding structured data (JSON-LD) for rich snippets"})
        score -= 3

    # Determine grade
    if score >= 90:
        grade = "A"
    elif score >= 80:
        grade = "B"
    elif score >= 70:
        grade = "C"
    elif score >= 60:
        grade = "D"
    else:
        grade = "F"

    return {
        "score": max(0, score),
        "grade": grade,
        "issues": issues,
        "suggestions": suggestions,
        "meta": {
            "title": title,
            "title_length": len(title) if title else 0,
            "description": description,
            "description_length": len(description) if description else 0,
            "has_og_image": bool(og_image),
            "has_structured_data": bool(page_seo and page_seo.structured_data)
        }
    }
