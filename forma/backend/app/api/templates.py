"""Component Templates API Routes"""
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Query

from app.templates import (
    ALL_TEMPLATES,
    ALL_PAGE_TEMPLATES,
    ALL_COMBINED_TEMPLATES,
    get_templates_by_category,
    get_template_by_id,
    get_all_categories,
    get_theme,
    get_all_themes,
    get_style_preset,
    get_all_style_presets,
    get_page_templates_by_subcategory,
    get_page_template_by_id,
    get_all_combined_categories,
    get_combined_templates_by_category,
    get_combined_template_by_id,
)

router = APIRouter(prefix="/api/templates", tags=["templates"])


@router.get("/")
async def list_all_templates(
    category: Optional[str] = Query(None, description="Filter by category"),
    include_pages: bool = Query(True, description="Include page templates")
):
    """
    Get all templates, optionally filtered by category.

    Categories: navbar, footer, hero, sidebar, section, page, component
    """
    if include_pages:
        templates_list = ALL_COMBINED_TEMPLATES
        categories_list = get_all_combined_categories()
    else:
        templates_list = ALL_TEMPLATES
        categories_list = get_all_categories()

    if category:
        templates = [t for t in templates_list if t.get("category") == category]
        if not templates:
            raise HTTPException(status_code=404, detail=f"No templates found for category: {category}")
        return {
            "category": category,
            "count": len(templates),
            "templates": templates
        }

    return {
        "count": len(templates_list),
        "categories": categories_list,
        "templates": templates_list
    }


@router.get("/categories")
async def list_categories(include_pages: bool = Query(True)):
    """Get list of all available template categories."""
    if include_pages:
        templates_list = ALL_COMBINED_TEMPLATES
        categories = get_all_combined_categories()
    else:
        templates_list = ALL_TEMPLATES
        categories = get_all_categories()

    category_counts = {}
    for cat in categories:
        category_counts[cat] = len([t for t in templates_list if t.get("category") == cat])

    return {
        "categories": [
            {"name": cat, "count": category_counts[cat]}
            for cat in categories
        ]
    }


@router.get("/pages")
async def list_page_templates(
    subcategory: Optional[str] = Query(None, description="Filter by subcategory (landing, dashboard, auth)")
):
    """
    Get all page templates, optionally filtered by subcategory.

    Subcategories: landing, dashboard, auth, component
    """
    if subcategory:
        templates = get_page_templates_by_subcategory(subcategory)
        if not templates:
            raise HTTPException(status_code=404, detail=f"No page templates found for subcategory: {subcategory}")
        return {
            "subcategory": subcategory,
            "count": len(templates),
            "templates": templates
        }

    # Get unique subcategories
    subcategories = set()
    for template in ALL_PAGE_TEMPLATES:
        if "subcategory" in template:
            subcategories.add(template["subcategory"])

    return {
        "count": len(ALL_PAGE_TEMPLATES),
        "subcategories": sorted(list(subcategories)),
        "templates": ALL_PAGE_TEMPLATES
    }


@router.get("/template/{template_id}")
async def get_template(template_id: str):
    """Get a specific template by ID (searches both component and page templates)."""
    template = get_combined_template_by_id(template_id)
    if not template:
        raise HTTPException(status_code=404, detail=f"Template not found: {template_id}")
    return template


@router.get("/themes")
async def list_themes():
    """Get all available theme configurations."""
    themes = get_all_themes()
    return {
        "count": len(themes),
        "themes": [
            {
                "id": theme_id,
                "name": theme["name"],
                "description": theme["description"],
                "colors": theme["colors"]
            }
            for theme_id, theme in themes.items()
        ]
    }


@router.get("/themes/{theme_id}")
async def get_theme_by_id(theme_id: str):
    """Get a specific theme configuration."""
    theme = get_theme(theme_id)
    if not theme:
        raise HTTPException(status_code=404, detail=f"Theme not found: {theme_id}")
    return theme


@router.get("/styles")
async def list_style_presets():
    """Get all available style presets (border radius configurations)."""
    presets = get_all_style_presets()
    return {
        "count": len(presets),
        "presets": [
            {
                "id": preset_id,
                "name": preset["name"],
                "description": preset["description"],
                "borderRadius": preset["borderRadius"]
            }
            for preset_id, preset in presets.items()
        ]
    }


@router.get("/styles/{preset_id}")
async def get_style_preset_by_id(preset_id: str):
    """Get a specific style preset."""
    preset = get_style_preset(preset_id)
    if not preset:
        raise HTTPException(status_code=404, detail=f"Style preset not found: {preset_id}")
    return preset


@router.get("/search")
async def search_templates(
    q: str = Query(..., min_length=1, description="Search query"),
    category: Optional[str] = Query(None, description="Filter by category"),
    include_pages: bool = Query(True, description="Include page templates")
):
    """Search templates by name, description, or tags."""
    query = q.lower()
    results = []

    if include_pages:
        templates_list = ALL_COMBINED_TEMPLATES
    else:
        templates_list = ALL_TEMPLATES

    templates_to_search = (
        [t for t in templates_list if t.get("category") == category]
        if category else templates_list
    )

    for template in templates_to_search:
        # Search in name
        if query in template["name"].lower():
            results.append(template)
            continue
        # Search in description
        if query in template["description"].lower():
            results.append(template)
            continue
        # Search in tags
        if any(query in tag.lower() for tag in template.get("tags", [])):
            results.append(template)
            continue

    return {
        "query": q,
        "category": category,
        "count": len(results),
        "templates": results
    }
