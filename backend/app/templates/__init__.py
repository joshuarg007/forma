"""Component Templates Module"""
from .components import (
    ALL_TEMPLATES,
    THEMES,
    STYLE_PRESETS,
    get_templates_by_category,
    get_template_by_id,
    get_all_categories,
    get_theme,
    get_all_themes,
    get_style_preset,
    get_all_style_presets,
)

from .pages import (
    ALL_PAGE_TEMPLATES,
    get_page_templates_by_subcategory,
    get_page_template_by_id,
)

# Combined templates list
ALL_COMBINED_TEMPLATES = ALL_TEMPLATES + ALL_PAGE_TEMPLATES

def get_all_combined_categories():
    """Get all unique categories from both component and page templates."""
    categories = set()
    for template in ALL_COMBINED_TEMPLATES:
        categories.add(template.get("category", "uncategorized"))
    return sorted(list(categories))


def get_combined_templates_by_category(category: str):
    """Get templates filtered by category from combined list."""
    return [t for t in ALL_COMBINED_TEMPLATES if t.get("category") == category]


def get_combined_template_by_id(template_id: str):
    """Get any template by ID from combined list."""
    for template in ALL_COMBINED_TEMPLATES:
        if template["id"] == template_id:
            return template
    return None


__all__ = [
    # Component templates
    "ALL_TEMPLATES",
    "THEMES",
    "STYLE_PRESETS",
    "get_templates_by_category",
    "get_template_by_id",
    "get_all_categories",
    "get_theme",
    "get_all_themes",
    "get_style_preset",
    "get_all_style_presets",
    # Page templates
    "ALL_PAGE_TEMPLATES",
    "get_page_templates_by_subcategory",
    "get_page_template_by_id",
    # Combined
    "ALL_COMBINED_TEMPLATES",
    "get_all_combined_categories",
    "get_combined_templates_by_category",
    "get_combined_template_by_id",
]
