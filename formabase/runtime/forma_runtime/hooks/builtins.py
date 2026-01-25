"""Built-in hook implementations.

These hooks can be referenced in schema.json by name:
- slugify:field_name - Generate slug from another field
- hash_password:field_name - Hash a password field using bcrypt
- set_author - Set author_id from current user
- set_owner - Set user_id from current user
- timestamp - Set current timestamp
- webhook:url - Call external webhook
- validate_email:field_name - Validate email format
- lowercase:field_name - Convert field to lowercase
- uppercase:field_name - Convert field to uppercase
- trim:field_name - Trim whitespace from field
"""

import hashlib
import re
import unicodedata
from datetime import datetime
from typing import Any, Callable, Optional
import httpx


# Type for hook functions
HookFunction = Callable[[dict[str, Any], Optional[dict], Optional[Any]], dict[str, Any]]


def slugify(text: str) -> str:
    """Convert text to URL-safe slug."""
    # Normalize unicode characters
    text = unicodedata.normalize("NFKD", str(text))
    text = text.encode("ascii", "ignore").decode("ascii")
    # Convert to lowercase
    text = text.lower()
    # Replace spaces with hyphens
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[-\s]+", "-", text).strip("-_")
    return text


def slugify_hook(source_field: str) -> HookFunction:
    """Create a hook that generates a slug from a source field.

    Usage in schema: "slugify:title" -> generates slug from title field
    """
    def hook(data: dict[str, Any], user: Optional[dict] = None, existing: Any = None) -> dict[str, Any]:
        if source_field in data:
            source_value = data[source_field]
            if source_value:
                data["slug"] = slugify(source_value)
        return data
    return hook


def hash_password_hook(field_name: str = "password") -> HookFunction:
    """Create a hook that hashes a password field using bcrypt.

    Usage in schema: "hash_password:password"
    """
    def hook(data: dict[str, Any], user: Optional[dict] = None, existing: Any = None) -> dict[str, Any]:
        if field_name in data and data[field_name]:
            password = data[field_name]
            # Only hash if it doesn't look already hashed
            if not password.startswith("$2b$") and not password.startswith("$2a$"):
                try:
                    import bcrypt
                    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt())
                    data[field_name] = hashed.decode()
                except ImportError:
                    # Fallback to sha256 if bcrypt not available
                    hashed = hashlib.sha256(password.encode()).hexdigest()
                    data[field_name] = hashed
        return data
    return hook


def set_author_hook() -> HookFunction:
    """Create a hook that sets author_id from current user.

    Usage in schema: "set_author"
    """
    def hook(data: dict[str, Any], user: Optional[dict] = None, existing: Any = None) -> dict[str, Any]:
        if user and "id" in user:
            # Only set if not already set
            if "author_id" not in data or data["author_id"] is None:
                data["author_id"] = user["id"]
        return data
    return hook


def set_owner_hook() -> HookFunction:
    """Create a hook that sets user_id from current user.

    Usage in schema: "set_owner"
    """
    def hook(data: dict[str, Any], user: Optional[dict] = None, existing: Any = None) -> dict[str, Any]:
        if user and "id" in user:
            # Only set if not already set
            if "user_id" not in data or data["user_id"] is None:
                data["user_id"] = user["id"]
        return data
    return hook


def timestamp_hook(field_name: str = "updated_at") -> HookFunction:
    """Create a hook that sets a timestamp field to now.

    Usage in schema: "timestamp:updated_at" or just "timestamp"
    """
    def hook(data: dict[str, Any], user: Optional[dict] = None, existing: Any = None) -> dict[str, Any]:
        data[field_name] = datetime.utcnow().isoformat()
        return data
    return hook


async def webhook_async(url: str, data: dict[str, Any], user: Optional[dict] = None) -> None:
    """Call an external webhook with the data."""
    payload = {
        "data": data,
        "user": user,
        "timestamp": datetime.utcnow().isoformat(),
    }
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            await client.post(url, json=payload)
    except Exception:
        # Don't fail the operation if webhook fails
        pass


def webhook_hook(url: str) -> HookFunction:
    """Create a hook that calls an external webhook.

    Usage in schema: "webhook:https://example.com/hook"
    Note: This is fire-and-forget, doesn't block operation.
    """
    def hook(data: dict[str, Any], user: Optional[dict] = None, existing: Any = None) -> dict[str, Any]:
        # Store URL in data for async execution later
        if "_webhooks" not in data:
            data["_webhooks"] = []
        data["_webhooks"].append(url)
        return data
    return hook


def validate_email_hook(field_name: str = "email") -> HookFunction:
    """Create a hook that validates email format.

    Usage in schema: "validate_email:email"
    Raises ValueError if email is invalid.
    """
    email_pattern = re.compile(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")

    def hook(data: dict[str, Any], user: Optional[dict] = None, existing: Any = None) -> dict[str, Any]:
        if field_name in data and data[field_name]:
            email = data[field_name]
            if not email_pattern.match(email):
                raise ValueError(f"Invalid email format: {email}")
        return data
    return hook


def lowercase_hook(field_name: str) -> HookFunction:
    """Create a hook that lowercases a field.

    Usage in schema: "lowercase:email"
    """
    def hook(data: dict[str, Any], user: Optional[dict] = None, existing: Any = None) -> dict[str, Any]:
        if field_name in data and data[field_name]:
            data[field_name] = str(data[field_name]).lower()
        return data
    return hook


def uppercase_hook(field_name: str) -> HookFunction:
    """Create a hook that uppercases a field.

    Usage in schema: "uppercase:code"
    """
    def hook(data: dict[str, Any], user: Optional[dict] = None, existing: Any = None) -> dict[str, Any]:
        if field_name in data and data[field_name]:
            data[field_name] = str(data[field_name]).upper()
        return data
    return hook


def trim_hook(field_name: str) -> HookFunction:
    """Create a hook that trims whitespace from a field.

    Usage in schema: "trim:title"
    """
    def hook(data: dict[str, Any], user: Optional[dict] = None, existing: Any = None) -> dict[str, Any]:
        if field_name in data and data[field_name]:
            data[field_name] = str(data[field_name]).strip()
        return data
    return hook


def generate_uuid_hook(field_name: str = "uuid") -> HookFunction:
    """Create a hook that generates a UUID.

    Usage in schema: "generate_uuid:external_id"
    """
    import uuid as uuid_module

    def hook(data: dict[str, Any], user: Optional[dict] = None, existing: Any = None) -> dict[str, Any]:
        # Only generate if not already set
        if field_name not in data or data[field_name] is None:
            data[field_name] = str(uuid_module.uuid4())
        return data
    return hook


def increment_hook(field_name: str, amount: int = 1) -> HookFunction:
    """Create a hook that increments a numeric field.

    Usage in schema: "increment:view_count" or "increment:view_count:5"
    """
    def hook(data: dict[str, Any], user: Optional[dict] = None, existing: Any = None) -> dict[str, Any]:
        if existing:
            current_value = getattr(existing, field_name, 0) or 0
            data[field_name] = current_value + amount
        return data
    return hook


def set_field_hook(field_name: str, value: Any) -> HookFunction:
    """Create a hook that sets a field to a specific value.

    Usage in schema: "set_field:status:draft"
    """
    def hook(data: dict[str, Any], user: Optional[dict] = None, existing: Any = None) -> dict[str, Any]:
        # Only set if not already in data
        if field_name not in data:
            data[field_name] = value
        return data
    return hook


# Registry of built-in hooks
BUILTIN_HOOKS: dict[str, Callable[..., HookFunction]] = {
    "slugify": slugify_hook,
    "hash_password": hash_password_hook,
    "set_author": set_author_hook,
    "set_owner": set_owner_hook,
    "timestamp": timestamp_hook,
    "webhook": webhook_hook,
    "validate_email": validate_email_hook,
    "lowercase": lowercase_hook,
    "uppercase": uppercase_hook,
    "trim": trim_hook,
    "generate_uuid": generate_uuid_hook,
    "increment": increment_hook,
    "set_field": set_field_hook,
}


def get_builtin_hook(hook_spec: str) -> Optional[HookFunction]:
    """Parse a hook specification and return the hook function.

    Hook specs can be:
    - "hook_name" (e.g., "set_author")
    - "hook_name:arg" (e.g., "slugify:title")
    - "hook_name:arg1:arg2" (e.g., "set_field:status:draft")
    """
    parts = hook_spec.split(":")
    hook_name = parts[0]

    if hook_name not in BUILTIN_HOOKS:
        return None

    hook_factory = BUILTIN_HOOKS[hook_name]

    # Handle different argument counts
    if len(parts) == 1:
        # No arguments
        return hook_factory()
    elif len(parts) == 2:
        # Single argument
        return hook_factory(parts[1])
    else:
        # Multiple arguments
        return hook_factory(*parts[1:])
