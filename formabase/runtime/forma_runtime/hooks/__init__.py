"""Lifecycle hooks for Formabase collections.

Hooks allow running custom logic at various points in the record lifecycle:
- beforeCreate: Transform/validate data before insert
- afterCreate: Post-processing, notifications, webhooks
- beforeUpdate: Transform/validate data before update
- afterUpdate: Post-processing, notifications, webhooks
- beforeDelete: Prevent deletion, cleanup related data
- afterDelete: Post-deletion cleanup, notifications

Usage in schema.json:
```json
{
  "collections": {
    "posts": {
      "hooks": {
        "beforeCreate": ["slugify:title", "set_author"],
        "afterCreate": ["webhook:https://example.com/new-post"]
      }
    }
  }
}
```

Built-in hooks:
- slugify:field_name - Generate URL slug from field
- hash_password:field_name - Hash password with bcrypt
- set_author - Set author_id from current user
- set_owner - Set user_id from current user
- timestamp:field_name - Set field to current time
- webhook:url - POST data to external URL
- validate_email:field_name - Validate email format
- lowercase:field_name - Convert to lowercase
- uppercase:field_name - Convert to uppercase
- trim:field_name - Trim whitespace
- generate_uuid:field_name - Generate UUID
- increment:field_name - Increment numeric field
- set_field:field:value - Set field to static value
"""

from .builtins import (
    BUILTIN_HOOKS,
    HookFunction,
    get_builtin_hook,
    slugify,
    slugify_hook,
    hash_password_hook,
    set_author_hook,
    set_owner_hook,
    timestamp_hook,
    webhook_hook,
    validate_email_hook,
    lowercase_hook,
    uppercase_hook,
    trim_hook,
    generate_uuid_hook,
    increment_hook,
    set_field_hook,
)
from .executor import (
    HookExecutor,
    get_executor,
    reset_executors,
)

__all__ = [
    # Types
    "HookFunction",
    # Executor
    "HookExecutor",
    "get_executor",
    "reset_executors",
    # Builtin registry
    "BUILTIN_HOOKS",
    "get_builtin_hook",
    # Utility functions
    "slugify",
    # Individual hooks
    "slugify_hook",
    "hash_password_hook",
    "set_author_hook",
    "set_owner_hook",
    "timestamp_hook",
    "webhook_hook",
    "validate_email_hook",
    "lowercase_hook",
    "uppercase_hook",
    "trim_hook",
    "generate_uuid_hook",
    "increment_hook",
    "set_field_hook",
]
