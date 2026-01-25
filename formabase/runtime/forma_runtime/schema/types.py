"""Type definitions for the Forma schema format."""

from enum import Enum
from typing import Any, Literal

from pydantic import BaseModel, Field


class FieldType(str, Enum):
    """Supported field types in the schema."""

    TEXT = "text"
    EMAIL = "email"
    INTEGER = "integer"
    FLOAT = "float"
    BOOLEAN = "boolean"
    DATETIME = "datetime"
    DATE = "date"
    ENUM = "enum"
    JSON = "json"
    RICHTEXT = "richtext"
    FILE = "file"
    IMAGE = "image"  # Alias for file with image MIME types
    RELATION = "relation"


class RelationType(str, Enum):
    """Supported relation types between collections."""

    MANY_TO_ONE = "many-to-one"
    ONE_TO_MANY = "one-to-many"
    MANY_TO_MANY = "many-to-many"
    ONE_TO_ONE = "one-to-one"


class OnDeleteAction(str, Enum):
    """Actions to take when a related record is deleted."""

    CASCADE = "cascade"
    SET_NULL = "set_null"
    RESTRICT = "restrict"


class FieldDefinition(BaseModel):
    """Definition of a single field in a collection."""

    type: FieldType
    required: bool = False
    unique: bool = False
    nullable: bool = True
    default: Any = None
    display_name: str | None = Field(None, alias="displayName")
    description: str | None = None
    searchable: bool = False
    admin: bool = False  # Only visible in admin panel

    # Text options
    min_length: int | None = Field(None, alias="minLength")
    max_length: int | None = Field(None, alias="maxLength")
    pattern: str | None = None
    textarea: bool = False

    # Number options
    min: float | None = None
    max: float | None = None
    precision: int | None = None

    # Enum options
    options: list[str] | None = None
    multiple: bool = False  # Allow multiple enum values

    # Relation options
    target: str | None = None
    relation: RelationType | None = None
    on_delete: OnDeleteAction = Field(OnDeleteAction.CASCADE, alias="onDelete")

    # File options
    accept: list[str] | None = None  # MIME types
    max_size: int | None = Field(None, alias="maxSize")  # bytes

    # Auto-generation
    auto: str | None = None  # e.g., "slugify:title", "now", "updated"

    model_config = {"populate_by_name": True}


class IndexDefinition(BaseModel):
    """Definition of a database index."""

    fields: list[str]
    unique: bool = False
    name: str | None = None


class PermissionRule(BaseModel):
    """Permission rule for a specific action."""

    roles: list[str] | None = None
    where: dict[str, Any] | None = None
    public: bool = False


class CollectionPermissions(BaseModel):
    """Permissions configuration for a collection."""

    create: list[str] | PermissionRule | None = None
    read: list[str] | PermissionRule | dict[str, Any] | None = None
    update: list[str] | PermissionRule | None = None
    delete: list[str] | PermissionRule | None = None


class CollectionHooks(BaseModel):
    """Lifecycle hooks for a collection."""

    before_create: list[str] | None = Field(None, alias="beforeCreate")
    after_create: list[str] | None = Field(None, alias="afterCreate")
    before_update: list[str] | None = Field(None, alias="beforeUpdate")
    after_update: list[str] | None = Field(None, alias="afterUpdate")
    before_delete: list[str] | None = Field(None, alias="beforeDelete")
    after_delete: list[str] | None = Field(None, alias="afterDelete")

    model_config = {"populate_by_name": True}


class CollectionApiConfig(BaseModel):
    """API configuration for a collection."""

    default_limit: int = Field(20, alias="defaultLimit")
    max_limit: int = Field(100, alias="maxLimit")
    search_fields: list[str] | None = Field(None, alias="searchFields")

    model_config = {"populate_by_name": True}


class CollectionDefinition(BaseModel):
    """Definition of a collection (table) in the schema."""

    display_name: str | None = Field(None, alias="displayName")
    icon: str | None = None
    timestamps: bool = True
    soft_delete: bool = Field(False, alias="softDelete")
    fields: dict[str, FieldDefinition]
    indexes: list[IndexDefinition] | None = None
    permissions: CollectionPermissions | None = None
    hooks: CollectionHooks | None = None
    api: CollectionApiConfig | None = None
    auth: bool = False  # Is this the auth/user collection?

    model_config = {"populate_by_name": True}


class AuthSettings(BaseModel):
    """Authentication settings."""

    providers: list[str] = ["email"]
    require_email_verification: bool = Field(False, alias="requireEmailVerification")
    session_duration: int = Field(604800, alias="sessionDuration")  # 7 days in seconds
    allow_registration: bool = Field(True, alias="allowRegistration")
    default_role: str = Field("user", alias="defaultRole")

    model_config = {"populate_by_name": True}


class StorageSettings(BaseModel):
    """Storage settings."""

    provider: Literal["local", "s3"] = "local"
    bucket: str | None = None
    region: str | None = None
    public_url: str | None = Field(None, alias="publicUrl")

    model_config = {"populate_by_name": True}


class RateLimitConfig(BaseModel):
    """Rate limit configuration."""

    requests: int = 100
    window: int = 60  # seconds


class ApiSettings(BaseModel):
    """API settings."""

    rate_limit: dict[str, RateLimitConfig] | None = Field(None, alias="rateLimit")
    cors: dict[str, Any] | None = None

    model_config = {"populate_by_name": True}


class HookSettings(BaseModel):
    """Hook settings (email, webhooks)."""

    email: dict[str, Any] | None = None
    webhook: dict[str, Any] | None = None


class SchemaSettings(BaseModel):
    """Global schema settings."""

    auth: AuthSettings | None = None
    storage: StorageSettings | None = None
    api: ApiSettings | None = None
    hooks: HookSettings | None = None


class SchemaDefinition(BaseModel):
    """Root schema definition."""

    version: str = "1.0"
    name: str
    collections: dict[str, CollectionDefinition]
    settings: SchemaSettings | None = None

    def get_auth_collection(self) -> tuple[str, CollectionDefinition] | None:
        """Get the collection marked as auth=True."""
        for name, collection in self.collections.items():
            if collection.auth:
                return name, collection
        return None

    def get_collection(self, name: str) -> CollectionDefinition | None:
        """Get a collection by name."""
        return self.collections.get(name)
