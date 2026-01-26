"""Localization / i18n API."""
import json
from datetime import datetime
from typing import List, Optional, Dict, Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sqlalchemy import and_
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import (
    Project, User, LocaleSettings, Translation, TranslationImport
)
from app.core.security import get_current_user_required as get_current_user


router = APIRouter(prefix="/api/projects/{project_id}/localization", tags=["localization"])
public_router = APIRouter(prefix="/api/i18n", tags=["i18n"])


# =============================================================================
# SCHEMAS
# =============================================================================

class LocaleSettingsUpdate(BaseModel):
    default_locale: Optional[str] = None
    enabled_locales: Optional[List[str]] = None
    auto_detect: Optional[bool] = None
    fallback_locale: Optional[str] = None
    url_strategy: Optional[str] = None
    rtl_locales: Optional[List[str]] = None


class LocaleSettingsResponse(BaseModel):
    id: UUID
    project_id: UUID
    default_locale: str
    enabled_locales: list
    auto_detect: bool
    fallback_locale: str
    url_strategy: str
    rtl_locales: list

    class Config:
        from_attributes = True


class TranslationCreate(BaseModel):
    key: str
    locale: str
    value: str
    namespace: str = "common"
    context: Optional[str] = None
    max_length: Optional[int] = None


class TranslationUpdate(BaseModel):
    value: Optional[str] = None
    context: Optional[str] = None
    max_length: Optional[int] = None
    is_reviewed: Optional[bool] = None


class TranslationResponse(BaseModel):
    id: UUID
    key: str
    namespace: str
    locale: str
    value: str
    context: Optional[str]
    max_length: Optional[int]
    is_reviewed: bool
    is_auto_translated: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TranslationBulkCreate(BaseModel):
    locale: str
    namespace: str = "common"
    translations: Dict[str, str]  # {key: value}


class TranslationStats(BaseModel):
    total_keys: int
    locales: List[str]
    completion: Dict[str, float]  # {locale: percentage}
    unreviewed_count: int


class LocaleInfo(BaseModel):
    code: str
    name: str
    native_name: str
    is_rtl: bool
    is_default: bool
    completion: float
    string_count: int


# =============================================================================
# LOCALE DATA
# =============================================================================

LOCALE_INFO = {
    "en": {"name": "English", "native_name": "English", "rtl": False},
    "es": {"name": "Spanish", "native_name": "Español", "rtl": False},
    "fr": {"name": "French", "native_name": "Français", "rtl": False},
    "de": {"name": "German", "native_name": "Deutsch", "rtl": False},
    "it": {"name": "Italian", "native_name": "Italiano", "rtl": False},
    "pt": {"name": "Portuguese", "native_name": "Português", "rtl": False},
    "nl": {"name": "Dutch", "native_name": "Nederlands", "rtl": False},
    "pl": {"name": "Polish", "native_name": "Polski", "rtl": False},
    "ru": {"name": "Russian", "native_name": "Русский", "rtl": False},
    "zh": {"name": "Chinese", "native_name": "中文", "rtl": False},
    "ja": {"name": "Japanese", "native_name": "日本語", "rtl": False},
    "ko": {"name": "Korean", "native_name": "한국어", "rtl": False},
    "ar": {"name": "Arabic", "native_name": "العربية", "rtl": True},
    "he": {"name": "Hebrew", "native_name": "עברית", "rtl": True},
    "fa": {"name": "Persian", "native_name": "فارسی", "rtl": True},
    "hi": {"name": "Hindi", "native_name": "हिन्दी", "rtl": False},
    "th": {"name": "Thai", "native_name": "ไทย", "rtl": False},
    "vi": {"name": "Vietnamese", "native_name": "Tiếng Việt", "rtl": False},
    "tr": {"name": "Turkish", "native_name": "Türkçe", "rtl": False},
    "sv": {"name": "Swedish", "native_name": "Svenska", "rtl": False},
}


# =============================================================================
# HELPERS
# =============================================================================

def get_project_access(project_id: UUID, user: User, db: Session) -> Project:
    """Get project with access check."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if project.user_id != user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    return project


def get_or_create_locale_settings(project_id: UUID, db: Session) -> LocaleSettings:
    """Get or create locale settings."""
    settings = db.query(LocaleSettings).filter(
        LocaleSettings.project_id == project_id
    ).first()

    if not settings:
        settings = LocaleSettings(
            project_id=project_id,
            default_locale="en",
            enabled_locales=["en"],
            fallback_locale="en",
        )
        db.add(settings)
        db.commit()
        db.refresh(settings)

    return settings


# =============================================================================
# SETTINGS ENDPOINTS
# =============================================================================

@router.get("/settings", response_model=LocaleSettingsResponse)
async def get_locale_settings(
    project_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Get localization settings."""
    project = get_project_access(project_id, user, db)
    settings = get_or_create_locale_settings(project.id, db)
    return LocaleSettingsResponse.model_validate(settings)


@router.put("/settings", response_model=LocaleSettingsResponse)
async def update_locale_settings(
    project_id: UUID,
    request: LocaleSettingsUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Update localization settings."""
    project = get_project_access(project_id, user, db)
    settings = get_or_create_locale_settings(project.id, db)

    for field, value in request.model_dump(exclude_unset=True).items():
        setattr(settings, field, value)

    db.commit()
    db.refresh(settings)

    return LocaleSettingsResponse.model_validate(settings)


@router.get("/locales")
async def list_available_locales():
    """List all available locales."""
    return [
        {
            "code": code,
            "name": info["name"],
            "native_name": info["native_name"],
            "is_rtl": info["rtl"]
        }
        for code, info in LOCALE_INFO.items()
    ]


@router.get("/locales/enabled", response_model=List[LocaleInfo])
async def list_enabled_locales(
    project_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """List enabled locales with completion stats."""
    project = get_project_access(project_id, user, db)
    settings = get_or_create_locale_settings(project.id, db)

    # Count total keys (from default locale)
    total_keys = db.query(Translation).filter(
        Translation.project_id == project.id,
        Translation.locale == settings.default_locale
    ).count()

    result = []
    for locale in settings.enabled_locales:
        locale_count = db.query(Translation).filter(
            Translation.project_id == project.id,
            Translation.locale == locale
        ).count()

        completion = (locale_count / total_keys * 100) if total_keys > 0 else 0

        info = LOCALE_INFO.get(locale, {"name": locale, "native_name": locale, "rtl": False})

        result.append(LocaleInfo(
            code=locale,
            name=info["name"],
            native_name=info["native_name"],
            is_rtl=info["rtl"] or locale in settings.rtl_locales,
            is_default=locale == settings.default_locale,
            completion=round(completion, 1),
            string_count=locale_count
        ))

    return result


# =============================================================================
# TRANSLATION ENDPOINTS
# =============================================================================

@router.post("/translations", response_model=TranslationResponse)
async def create_translation(
    project_id: UUID,
    request: TranslationCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Create a translation string."""
    project = get_project_access(project_id, user, db)
    settings = get_or_create_locale_settings(project.id, db)

    # Check if already exists
    existing = db.query(Translation).filter(
        Translation.project_id == project.id,
        Translation.key == request.key,
        Translation.locale == request.locale,
        Translation.namespace == request.namespace
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Translation already exists")

    translation = Translation(
        locale_settings_id=settings.id,
        project_id=project.id,
        key=request.key,
        locale=request.locale,
        value=request.value,
        namespace=request.namespace,
        context=request.context,
        max_length=request.max_length,
    )

    db.add(translation)
    db.commit()
    db.refresh(translation)

    return TranslationResponse.model_validate(translation)


@router.get("/translations", response_model=List[TranslationResponse])
async def list_translations(
    project_id: UUID,
    locale: Optional[str] = None,
    namespace: Optional[str] = None,
    search: Optional[str] = None,
    unreviewed_only: bool = False,
    limit: int = Query(100, le=500),
    offset: int = 0,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """List translations."""
    project = get_project_access(project_id, user, db)

    query = db.query(Translation).filter(Translation.project_id == project.id)

    if locale:
        query = query.filter(Translation.locale == locale)
    if namespace:
        query = query.filter(Translation.namespace == namespace)
    if search:
        query = query.filter(
            (Translation.key.ilike(f"%{search}%")) |
            (Translation.value.ilike(f"%{search}%"))
        )
    if unreviewed_only:
        query = query.filter(Translation.is_reviewed == False)

    translations = query.order_by(Translation.key).offset(offset).limit(limit).all()

    return [TranslationResponse.model_validate(t) for t in translations]


@router.get("/translations/{translation_id}", response_model=TranslationResponse)
async def get_translation(
    project_id: UUID,
    translation_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Get a specific translation."""
    project = get_project_access(project_id, user, db)

    translation = db.query(Translation).filter(
        Translation.id == translation_id,
        Translation.project_id == project.id
    ).first()

    if not translation:
        raise HTTPException(status_code=404, detail="Translation not found")

    return TranslationResponse.model_validate(translation)


@router.put("/translations/{translation_id}", response_model=TranslationResponse)
async def update_translation(
    project_id: UUID,
    translation_id: UUID,
    request: TranslationUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Update a translation."""
    project = get_project_access(project_id, user, db)

    translation = db.query(Translation).filter(
        Translation.id == translation_id,
        Translation.project_id == project.id
    ).first()

    if not translation:
        raise HTTPException(status_code=404, detail="Translation not found")

    for field, value in request.model_dump(exclude_unset=True).items():
        setattr(translation, field, value)

    if request.is_reviewed:
        translation.reviewed_by_id = user.id
        translation.reviewed_at = datetime.utcnow()

    db.commit()
    db.refresh(translation)

    return TranslationResponse.model_validate(translation)


@router.delete("/translations/{translation_id}")
async def delete_translation(
    project_id: UUID,
    translation_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Delete a translation."""
    project = get_project_access(project_id, user, db)

    translation = db.query(Translation).filter(
        Translation.id == translation_id,
        Translation.project_id == project.id
    ).first()

    if not translation:
        raise HTTPException(status_code=404, detail="Translation not found")

    db.delete(translation)
    db.commit()

    return {"success": True}


@router.post("/translations/bulk")
async def bulk_create_translations(
    project_id: UUID,
    request: TranslationBulkCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Bulk create/update translations."""
    project = get_project_access(project_id, user, db)
    settings = get_or_create_locale_settings(project.id, db)

    created = 0
    updated = 0

    for key, value in request.translations.items():
        existing = db.query(Translation).filter(
            Translation.project_id == project.id,
            Translation.key == key,
            Translation.locale == request.locale,
            Translation.namespace == request.namespace
        ).first()

        if existing:
            existing.value = value
            updated += 1
        else:
            translation = Translation(
                locale_settings_id=settings.id,
                project_id=project.id,
                key=key,
                locale=request.locale,
                value=value,
                namespace=request.namespace,
            )
            db.add(translation)
            created += 1

    db.commit()

    return {"success": True, "created": created, "updated": updated}


@router.get("/stats", response_model=TranslationStats)
async def get_translation_stats(
    project_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Get translation statistics."""
    project = get_project_access(project_id, user, db)
    settings = get_or_create_locale_settings(project.id, db)

    # Total unique keys
    total_keys = db.query(Translation.key).filter(
        Translation.project_id == project.id,
        Translation.locale == settings.default_locale
    ).distinct().count()

    # Completion by locale
    completion = {}
    for locale in settings.enabled_locales:
        locale_count = db.query(Translation).filter(
            Translation.project_id == project.id,
            Translation.locale == locale
        ).count()
        completion[locale] = round((locale_count / total_keys * 100) if total_keys > 0 else 0, 1)

    # Unreviewed count
    unreviewed = db.query(Translation).filter(
        Translation.project_id == project.id,
        Translation.is_reviewed == False
    ).count()

    return TranslationStats(
        total_keys=total_keys,
        locales=settings.enabled_locales,
        completion=completion,
        unreviewed_count=unreviewed
    )


# =============================================================================
# EXPORT/IMPORT
# =============================================================================

@router.get("/export/{locale}")
async def export_translations(
    project_id: UUID,
    locale: str,
    format: str = Query("json", regex="^(json|csv)$"),
    namespace: Optional[str] = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Export translations for a locale."""
    project = get_project_access(project_id, user, db)

    query = db.query(Translation).filter(
        Translation.project_id == project.id,
        Translation.locale == locale
    )

    if namespace:
        query = query.filter(Translation.namespace == namespace)

    translations = query.all()

    if format == "json":
        # Nested JSON structure
        result: Dict[str, Dict[str, str]] = {}
        for t in translations:
            if t.namespace not in result:
                result[t.namespace] = {}
            result[t.namespace][t.key] = t.value

        return JSONResponse(content=result)

    else:  # CSV
        lines = ["key,namespace,value"]
        for t in translations:
            # Escape quotes in value
            value = t.value.replace('"', '""')
            lines.append(f'"{t.key}","{t.namespace}","{value}"')

        return JSONResponse(
            content="\n".join(lines),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={locale}_translations.csv"}
        )


@router.post("/import/{locale}")
async def import_translations(
    project_id: UUID,
    locale: str,
    file: UploadFile = File(...),
    namespace: str = "common",
    overwrite: bool = False,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Import translations from file."""
    project = get_project_access(project_id, user, db)
    settings = get_or_create_locale_settings(project.id, db)

    content = await file.read()
    content_str = content.decode("utf-8")

    imported = 0
    updated = 0
    skipped = 0
    errors = []

    try:
        data = json.loads(content_str)

        # Handle nested structure
        if isinstance(data, dict):
            for ns, translations in data.items():
                if isinstance(translations, dict):
                    for key, value in translations.items():
                        if not isinstance(value, str):
                            continue

                        existing = db.query(Translation).filter(
                            Translation.project_id == project.id,
                            Translation.key == key,
                            Translation.locale == locale,
                            Translation.namespace == ns
                        ).first()

                        if existing:
                            if overwrite:
                                existing.value = value
                                updated += 1
                            else:
                                skipped += 1
                        else:
                            translation = Translation(
                                locale_settings_id=settings.id,
                                project_id=project.id,
                                key=key,
                                locale=locale,
                                value=value,
                                namespace=ns,
                            )
                            db.add(translation)
                            imported += 1

        db.commit()

    except json.JSONDecodeError as e:
        errors.append(f"Invalid JSON: {str(e)}")

    # Record import
    import_record = TranslationImport(
        project_id=project.id,
        source_type="json",
        source_filename=file.filename,
        locale=locale,
        strings_imported=imported,
        strings_updated=updated,
        strings_skipped=skipped,
        errors=errors,
        imported_by_id=user.id,
    )
    db.add(import_record)
    db.commit()

    return {
        "success": len(errors) == 0,
        "imported": imported,
        "updated": updated,
        "skipped": skipped,
        "errors": errors
    }


# =============================================================================
# PUBLIC ENDPOINT (for published sites)
# =============================================================================

@public_router.get("/{project_id}/{locale}")
async def get_public_translations(
    project_id: UUID,
    locale: str,
    namespace: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get translations for a published site (public endpoint)."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    settings = db.query(LocaleSettings).filter(
        LocaleSettings.project_id == project_id
    ).first()

    if not settings:
        return {}

    # Use fallback if locale not enabled
    if locale not in settings.enabled_locales:
        locale = settings.fallback_locale

    query = db.query(Translation).filter(
        Translation.project_id == project_id,
        Translation.locale == locale
    )

    if namespace:
        query = query.filter(Translation.namespace == namespace)

    translations = query.all()

    # Build nested response
    result: Dict[str, Dict[str, str]] = {}
    for t in translations:
        if t.namespace not in result:
            result[t.namespace] = {}
        result[t.namespace][t.key] = t.value

    return result
