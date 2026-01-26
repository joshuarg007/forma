"""Design System and Theme Manager API."""
from typing import List, Optional, Dict, Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import Project, User, DesignSystem, Theme, ComponentStyle
from app.core.security import get_current_user_required as get_current_user


router = APIRouter(prefix="/api/projects/{project_id}/design-system", tags=["design-system"])


# =============================================================================
# SCHEMAS
# =============================================================================

class ColorScale(BaseModel):
    """Color scale with shades."""
    name: str
    colors: Dict[str, str]  # {50: "#fff", 100: "#fafafa", ..., 900: "#111"}


class TypographyConfig(BaseModel):
    font_families: Dict[str, str] = {}  # {sans: "Inter", serif: "Georgia", mono: "Fira Code"}
    font_sizes: Dict[str, str] = {}  # {xs: "0.75rem", sm: "0.875rem", ...}
    font_weights: Dict[str, int] = {}  # {normal: 400, medium: 500, bold: 700}
    line_heights: Dict[str, str] = {}  # {tight: "1.25", normal: "1.5", relaxed: "1.75"}
    letter_spacings: Dict[str, str] = {}  # {tight: "-0.05em", normal: "0", wide: "0.05em"}


class SpacingConfig(BaseModel):
    values: Dict[str, str] = {}  # {0: "0", 1: "0.25rem", 2: "0.5rem", ...}


class DesignSystemCreate(BaseModel):
    name: str = "Default"
    description: Optional[str] = None


class DesignSystemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    colors: Optional[Dict[str, Any]] = None
    typography: Optional[Dict[str, Any]] = None
    spacing: Optional[Dict[str, Any]] = None
    radii: Optional[Dict[str, Any]] = None
    shadows: Optional[Dict[str, Any]] = None
    breakpoints: Optional[Dict[str, Any]] = None
    z_indices: Optional[Dict[str, Any]] = None
    transitions: Optional[Dict[str, Any]] = None


class DesignSystemResponse(BaseModel):
    id: UUID
    project_id: UUID
    name: str
    description: Optional[str]
    colors: dict
    typography: dict
    spacing: dict
    radii: dict
    shadows: dict
    breakpoints: dict
    z_indices: dict
    transitions: dict
    theme_count: int = 0

    class Config:
        from_attributes = True


class ThemeCreate(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    color_mode: str = "light"
    is_default: bool = False
    colors: Dict[str, str] = {}  # Semantic color tokens
    semantic_tokens: Dict[str, Any] = {}


class ThemeUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    color_mode: Optional[str] = None
    is_default: Optional[bool] = None
    colors: Optional[Dict[str, str]] = None
    semantic_tokens: Optional[Dict[str, Any]] = None


class ThemeResponse(BaseModel):
    id: UUID
    design_system_id: UUID
    name: str
    slug: str
    description: Optional[str]
    is_default: bool
    color_mode: str
    colors: dict
    semantic_tokens: dict
    css_variables: Optional[str]

    class Config:
        from_attributes = True


class ComponentStyleCreate(BaseModel):
    name: str
    component_type: str
    variant: str = "default"
    styles: Dict[str, Any]
    responsive: Dict[str, Any] = {}
    states: Dict[str, Any] = {}


class ComponentStyleUpdate(BaseModel):
    name: Optional[str] = None
    variant: Optional[str] = None
    styles: Optional[Dict[str, Any]] = None
    responsive: Optional[Dict[str, Any]] = None
    states: Optional[Dict[str, Any]] = None


class ComponentStyleResponse(BaseModel):
    id: UUID
    design_system_id: UUID
    name: str
    component_type: str
    variant: str
    styles: dict
    responsive: dict
    states: dict

    class Config:
        from_attributes = True


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


def get_or_create_design_system(project: Project, db: Session) -> DesignSystem:
    """Get or create design system for project."""
    design_system = db.query(DesignSystem).filter(
        DesignSystem.project_id == project.id
    ).first()

    if not design_system:
        design_system = DesignSystem(
            project_id=project.id,
            name="Default",
            colors=get_default_colors(),
            typography=get_default_typography(),
            spacing=get_default_spacing(),
            radii=get_default_radii(),
            shadows=get_default_shadows(),
            breakpoints=get_default_breakpoints(),
            z_indices=get_default_z_indices(),
            transitions=get_default_transitions(),
        )
        db.add(design_system)
        db.commit()
        db.refresh(design_system)

        # Create default light and dark themes
        create_default_themes(design_system, db)

    return design_system


def get_default_colors() -> dict:
    """Default color palette."""
    return {
        "gray": {
            "50": "#f9fafb", "100": "#f3f4f6", "200": "#e5e7eb",
            "300": "#d1d5db", "400": "#9ca3af", "500": "#6b7280",
            "600": "#4b5563", "700": "#374151", "800": "#1f2937", "900": "#111827"
        },
        "primary": {
            "50": "#eff6ff", "100": "#dbeafe", "200": "#bfdbfe",
            "300": "#93c5fd", "400": "#60a5fa", "500": "#3b82f6",
            "600": "#2563eb", "700": "#1d4ed8", "800": "#1e40af", "900": "#1e3a8a"
        },
        "secondary": {
            "50": "#f5f3ff", "100": "#ede9fe", "200": "#ddd6fe",
            "300": "#c4b5fd", "400": "#a78bfa", "500": "#8b5cf6",
            "600": "#7c3aed", "700": "#6d28d9", "800": "#5b21b6", "900": "#4c1d95"
        },
        "success": {
            "50": "#f0fdf4", "100": "#dcfce7", "200": "#bbf7d0",
            "300": "#86efac", "400": "#4ade80", "500": "#22c55e",
            "600": "#16a34a", "700": "#15803d", "800": "#166534", "900": "#14532d"
        },
        "warning": {
            "50": "#fffbeb", "100": "#fef3c7", "200": "#fde68a",
            "300": "#fcd34d", "400": "#fbbf24", "500": "#f59e0b",
            "600": "#d97706", "700": "#b45309", "800": "#92400e", "900": "#78350f"
        },
        "error": {
            "50": "#fef2f2", "100": "#fee2e2", "200": "#fecaca",
            "300": "#fca5a5", "400": "#f87171", "500": "#ef4444",
            "600": "#dc2626", "700": "#b91c1c", "800": "#991b1b", "900": "#7f1d1d"
        }
    }


def get_default_typography() -> dict:
    """Default typography settings."""
    return {
        "fontFamilies": {
            "sans": "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            "serif": "Georgia, Cambria, 'Times New Roman', serif",
            "mono": "'Fira Code', 'JetBrains Mono', monospace"
        },
        "fontSizes": {
            "xs": "0.75rem", "sm": "0.875rem", "base": "1rem",
            "lg": "1.125rem", "xl": "1.25rem", "2xl": "1.5rem",
            "3xl": "1.875rem", "4xl": "2.25rem", "5xl": "3rem"
        },
        "fontWeights": {
            "thin": 100, "light": 300, "normal": 400,
            "medium": 500, "semibold": 600, "bold": 700, "black": 900
        },
        "lineHeights": {
            "none": "1", "tight": "1.25", "snug": "1.375",
            "normal": "1.5", "relaxed": "1.625", "loose": "2"
        },
        "letterSpacings": {
            "tighter": "-0.05em", "tight": "-0.025em", "normal": "0",
            "wide": "0.025em", "wider": "0.05em", "widest": "0.1em"
        }
    }


def get_default_spacing() -> dict:
    """Default spacing scale."""
    return {
        "0": "0", "px": "1px", "0.5": "0.125rem", "1": "0.25rem",
        "1.5": "0.375rem", "2": "0.5rem", "2.5": "0.625rem", "3": "0.75rem",
        "3.5": "0.875rem", "4": "1rem", "5": "1.25rem", "6": "1.5rem",
        "7": "1.75rem", "8": "2rem", "9": "2.25rem", "10": "2.5rem",
        "12": "3rem", "14": "3.5rem", "16": "4rem", "20": "5rem",
        "24": "6rem", "28": "7rem", "32": "8rem", "36": "9rem",
        "40": "10rem", "44": "11rem", "48": "12rem", "52": "13rem",
        "56": "14rem", "60": "15rem", "64": "16rem", "72": "18rem",
        "80": "20rem", "96": "24rem"
    }


def get_default_radii() -> dict:
    """Default border radius scale."""
    return {
        "none": "0", "sm": "0.125rem", "default": "0.25rem",
        "md": "0.375rem", "lg": "0.5rem", "xl": "0.75rem",
        "2xl": "1rem", "3xl": "1.5rem", "full": "9999px"
    }


def get_default_shadows() -> dict:
    """Default shadow scale."""
    return {
        "sm": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        "default": "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        "md": "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        "lg": "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
        "xl": "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
        "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
        "inner": "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
        "none": "none"
    }


def get_default_breakpoints() -> dict:
    """Default responsive breakpoints."""
    return {
        "sm": "640px", "md": "768px", "lg": "1024px",
        "xl": "1280px", "2xl": "1536px"
    }


def get_default_z_indices() -> dict:
    """Default z-index scale."""
    return {
        "auto": "auto", "0": "0", "10": "10", "20": "20",
        "30": "30", "40": "40", "50": "50",
        "dropdown": "1000", "sticky": "1100", "fixed": "1200",
        "modal-backdrop": "1300", "modal": "1400",
        "popover": "1500", "tooltip": "1600"
    }


def get_default_transitions() -> dict:
    """Default transition presets."""
    return {
        "none": "none",
        "all": "all 150ms cubic-bezier(0.4, 0, 0.2, 1)",
        "default": "color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter 150ms cubic-bezier(0.4, 0, 0.2, 1)",
        "colors": "color, background-color, border-color, text-decoration-color, fill, stroke 150ms cubic-bezier(0.4, 0, 0.2, 1)",
        "opacity": "opacity 150ms cubic-bezier(0.4, 0, 0.2, 1)",
        "shadow": "box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1)",
        "transform": "transform 150ms cubic-bezier(0.4, 0, 0.2, 1)"
    }


def create_default_themes(design_system: DesignSystem, db: Session):
    """Create default light and dark themes."""
    # Light theme
    light_theme = Theme(
        design_system_id=design_system.id,
        name="Light",
        slug="light",
        color_mode="light",
        is_default=True,
        colors={
            "background": "#ffffff",
            "foreground": "#0f172a",
            "card": "#ffffff",
            "card-foreground": "#0f172a",
            "popover": "#ffffff",
            "popover-foreground": "#0f172a",
            "primary": "#3b82f6",
            "primary-foreground": "#ffffff",
            "secondary": "#f1f5f9",
            "secondary-foreground": "#0f172a",
            "muted": "#f1f5f9",
            "muted-foreground": "#64748b",
            "accent": "#f1f5f9",
            "accent-foreground": "#0f172a",
            "destructive": "#ef4444",
            "destructive-foreground": "#ffffff",
            "border": "#e2e8f0",
            "input": "#e2e8f0",
            "ring": "#3b82f6"
        },
        semantic_tokens={}
    )
    light_theme.css_variables = generate_css_variables(light_theme, design_system)
    db.add(light_theme)

    # Dark theme
    dark_theme = Theme(
        design_system_id=design_system.id,
        name="Dark",
        slug="dark",
        color_mode="dark",
        is_default=False,
        colors={
            "background": "#0f172a",
            "foreground": "#f8fafc",
            "card": "#1e293b",
            "card-foreground": "#f8fafc",
            "popover": "#1e293b",
            "popover-foreground": "#f8fafc",
            "primary": "#60a5fa",
            "primary-foreground": "#0f172a",
            "secondary": "#1e293b",
            "secondary-foreground": "#f8fafc",
            "muted": "#1e293b",
            "muted-foreground": "#94a3b8",
            "accent": "#1e293b",
            "accent-foreground": "#f8fafc",
            "destructive": "#f87171",
            "destructive-foreground": "#0f172a",
            "border": "#334155",
            "input": "#334155",
            "ring": "#60a5fa"
        },
        semantic_tokens={}
    )
    dark_theme.css_variables = generate_css_variables(dark_theme, design_system)
    db.add(dark_theme)

    db.commit()


def generate_css_variables(theme: Theme, design_system: DesignSystem) -> str:
    """Generate CSS variables for a theme."""
    lines = [f":root[data-theme='{theme.slug}'], .theme-{theme.slug} {{"]

    # Theme colors
    for key, value in (theme.colors or {}).items():
        css_key = key.replace("-", "-")
        lines.append(f"  --{css_key}: {value};")

    # Color scales from design system
    for scale_name, scale in (design_system.colors or {}).items():
        for shade, value in scale.items():
            lines.append(f"  --color-{scale_name}-{shade}: {value};")

    # Typography
    typography = design_system.typography or {}
    for family_key, family_value in typography.get("fontFamilies", {}).items():
        lines.append(f"  --font-{family_key}: {family_value};")

    for size_key, size_value in typography.get("fontSizes", {}).items():
        lines.append(f"  --text-{size_key}: {size_value};")

    # Spacing
    for space_key, space_value in (design_system.spacing or {}).items():
        lines.append(f"  --space-{space_key}: {space_value};")

    # Radii
    for radius_key, radius_value in (design_system.radii or {}).items():
        lines.append(f"  --radius-{radius_key}: {radius_value};")

    # Shadows
    for shadow_key, shadow_value in (design_system.shadows or {}).items():
        lines.append(f"  --shadow-{shadow_key}: {shadow_value};")

    lines.append("}")

    return "\n".join(lines)


# =============================================================================
# DESIGN SYSTEM ENDPOINTS
# =============================================================================

@router.get("", response_model=DesignSystemResponse)
async def get_design_system(
    project_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Get the design system for a project."""
    project = get_project_access(project_id, user, db)
    design_system = get_or_create_design_system(project, db)

    response = DesignSystemResponse.model_validate(design_system)
    response.theme_count = len(design_system.themes)
    return response


@router.put("", response_model=DesignSystemResponse)
async def update_design_system(
    project_id: UUID,
    request: DesignSystemUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Update design system tokens."""
    project = get_project_access(project_id, user, db)
    design_system = get_or_create_design_system(project, db)

    # Update fields
    if request.name is not None:
        design_system.name = request.name
    if request.description is not None:
        design_system.description = request.description
    if request.colors is not None:
        design_system.colors = request.colors
    if request.typography is not None:
        design_system.typography = request.typography
    if request.spacing is not None:
        design_system.spacing = request.spacing
    if request.radii is not None:
        design_system.radii = request.radii
    if request.shadows is not None:
        design_system.shadows = request.shadows
    if request.breakpoints is not None:
        design_system.breakpoints = request.breakpoints
    if request.z_indices is not None:
        design_system.z_indices = request.z_indices
    if request.transitions is not None:
        design_system.transitions = request.transitions

    db.commit()

    # Regenerate CSS for all themes
    for theme in design_system.themes:
        theme.css_variables = generate_css_variables(theme, design_system)
    db.commit()

    db.refresh(design_system)

    response = DesignSystemResponse.model_validate(design_system)
    response.theme_count = len(design_system.themes)
    return response


@router.post("/reset")
async def reset_design_system(
    project_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Reset design system to defaults."""
    project = get_project_access(project_id, user, db)

    # Delete existing
    db.query(DesignSystem).filter(DesignSystem.project_id == project.id).delete()
    db.commit()

    # Recreate with defaults
    design_system = get_or_create_design_system(project, db)

    return {"success": True, "message": "Design system reset to defaults"}


# =============================================================================
# THEME ENDPOINTS
# =============================================================================

@router.get("/themes", response_model=List[ThemeResponse])
async def list_themes(
    project_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """List all themes for the project."""
    project = get_project_access(project_id, user, db)
    design_system = get_or_create_design_system(project, db)

    return [ThemeResponse.model_validate(t) for t in design_system.themes]


@router.post("/themes", response_model=ThemeResponse)
async def create_theme(
    project_id: UUID,
    request: ThemeCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Create a new theme."""
    project = get_project_access(project_id, user, db)
    design_system = get_or_create_design_system(project, db)

    # Check for duplicate slug
    existing = db.query(Theme).filter(
        Theme.design_system_id == design_system.id,
        Theme.slug == request.slug
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Theme with this slug already exists")

    # If making this default, unset others
    if request.is_default:
        db.query(Theme).filter(
            Theme.design_system_id == design_system.id
        ).update({Theme.is_default: False})

    theme = Theme(
        design_system_id=design_system.id,
        name=request.name,
        slug=request.slug,
        description=request.description,
        color_mode=request.color_mode,
        is_default=request.is_default,
        colors=request.colors,
        semantic_tokens=request.semantic_tokens,
    )
    theme.css_variables = generate_css_variables(theme, design_system)

    db.add(theme)
    db.commit()
    db.refresh(theme)

    return ThemeResponse.model_validate(theme)


@router.get("/themes/{theme_id}", response_model=ThemeResponse)
async def get_theme(
    project_id: UUID,
    theme_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Get a specific theme."""
    project = get_project_access(project_id, user, db)
    design_system = get_or_create_design_system(project, db)

    theme = db.query(Theme).filter(
        Theme.id == theme_id,
        Theme.design_system_id == design_system.id
    ).first()

    if not theme:
        raise HTTPException(status_code=404, detail="Theme not found")

    return ThemeResponse.model_validate(theme)


@router.put("/themes/{theme_id}", response_model=ThemeResponse)
async def update_theme(
    project_id: UUID,
    theme_id: UUID,
    request: ThemeUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Update a theme."""
    project = get_project_access(project_id, user, db)
    design_system = get_or_create_design_system(project, db)

    theme = db.query(Theme).filter(
        Theme.id == theme_id,
        Theme.design_system_id == design_system.id
    ).first()

    if not theme:
        raise HTTPException(status_code=404, detail="Theme not found")

    # Check for duplicate slug
    if request.slug and request.slug != theme.slug:
        existing = db.query(Theme).filter(
            Theme.design_system_id == design_system.id,
            Theme.slug == request.slug,
            Theme.id != theme_id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Theme with this slug already exists")

    # Update fields
    if request.name is not None:
        theme.name = request.name
    if request.slug is not None:
        theme.slug = request.slug
    if request.description is not None:
        theme.description = request.description
    if request.color_mode is not None:
        theme.color_mode = request.color_mode
    if request.colors is not None:
        theme.colors = request.colors
    if request.semantic_tokens is not None:
        theme.semantic_tokens = request.semantic_tokens

    # Handle default flag
    if request.is_default is not None:
        if request.is_default:
            db.query(Theme).filter(
                Theme.design_system_id == design_system.id
            ).update({Theme.is_default: False})
        theme.is_default = request.is_default

    # Regenerate CSS
    theme.css_variables = generate_css_variables(theme, design_system)

    db.commit()
    db.refresh(theme)

    return ThemeResponse.model_validate(theme)


@router.delete("/themes/{theme_id}")
async def delete_theme(
    project_id: UUID,
    theme_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Delete a theme."""
    project = get_project_access(project_id, user, db)
    design_system = get_or_create_design_system(project, db)

    theme = db.query(Theme).filter(
        Theme.id == theme_id,
        Theme.design_system_id == design_system.id
    ).first()

    if not theme:
        raise HTTPException(status_code=404, detail="Theme not found")

    if theme.is_default:
        raise HTTPException(status_code=400, detail="Cannot delete the default theme")

    db.delete(theme)
    db.commit()

    return {"success": True, "message": "Theme deleted"}


@router.get("/themes/{theme_id}/css")
async def get_theme_css(
    project_id: UUID,
    theme_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Get CSS variables for a theme."""
    project = get_project_access(project_id, user, db)
    design_system = get_or_create_design_system(project, db)

    theme = db.query(Theme).filter(
        Theme.id == theme_id,
        Theme.design_system_id == design_system.id
    ).first()

    if not theme:
        raise HTTPException(status_code=404, detail="Theme not found")

    return {
        "css": theme.css_variables,
        "theme": theme.slug
    }


@router.get("/css")
async def get_all_themes_css(
    project_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Get CSS variables for all themes."""
    project = get_project_access(project_id, user, db)
    design_system = get_or_create_design_system(project, db)

    css_parts = []
    for theme in design_system.themes:
        if theme.css_variables:
            css_parts.append(f"/* Theme: {theme.name} */")
            css_parts.append(theme.css_variables)
            css_parts.append("")

    return {
        "css": "\n".join(css_parts),
        "themes": [t.slug for t in design_system.themes]
    }


# =============================================================================
# COMPONENT STYLE PRESETS
# =============================================================================

@router.get("/styles", response_model=List[ComponentStyleResponse])
async def list_component_styles(
    project_id: UUID,
    component_type: Optional[str] = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """List component style presets."""
    project = get_project_access(project_id, user, db)
    design_system = get_or_create_design_system(project, db)

    query = db.query(ComponentStyle).filter(
        ComponentStyle.design_system_id == design_system.id
    )

    if component_type:
        query = query.filter(ComponentStyle.component_type == component_type)

    styles = query.all()
    return [ComponentStyleResponse.model_validate(s) for s in styles]


@router.post("/styles", response_model=ComponentStyleResponse)
async def create_component_style(
    project_id: UUID,
    request: ComponentStyleCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Create a component style preset."""
    project = get_project_access(project_id, user, db)
    design_system = get_or_create_design_system(project, db)

    style = ComponentStyle(
        design_system_id=design_system.id,
        name=request.name,
        component_type=request.component_type,
        variant=request.variant,
        styles=request.styles,
        responsive=request.responsive,
        states=request.states,
    )

    db.add(style)
    db.commit()
    db.refresh(style)

    return ComponentStyleResponse.model_validate(style)


@router.put("/styles/{style_id}", response_model=ComponentStyleResponse)
async def update_component_style(
    project_id: UUID,
    style_id: UUID,
    request: ComponentStyleUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Update a component style preset."""
    project = get_project_access(project_id, user, db)
    design_system = get_or_create_design_system(project, db)

    style = db.query(ComponentStyle).filter(
        ComponentStyle.id == style_id,
        ComponentStyle.design_system_id == design_system.id
    ).first()

    if not style:
        raise HTTPException(status_code=404, detail="Style not found")

    if request.name is not None:
        style.name = request.name
    if request.variant is not None:
        style.variant = request.variant
    if request.styles is not None:
        style.styles = request.styles
    if request.responsive is not None:
        style.responsive = request.responsive
    if request.states is not None:
        style.states = request.states

    db.commit()
    db.refresh(style)

    return ComponentStyleResponse.model_validate(style)


@router.delete("/styles/{style_id}")
async def delete_component_style(
    project_id: UUID,
    style_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Delete a component style preset."""
    project = get_project_access(project_id, user, db)
    design_system = get_or_create_design_system(project, db)

    style = db.query(ComponentStyle).filter(
        ComponentStyle.id == style_id,
        ComponentStyle.design_system_id == design_system.id
    ).first()

    if not style:
        raise HTTPException(status_code=404, detail="Style not found")

    db.delete(style)
    db.commit()

    return {"success": True, "message": "Style deleted"}
