"""Hook executor for running lifecycle hooks.

Handles executing hooks defined in schema.json at the appropriate times:
- beforeCreate: Before inserting a new record
- afterCreate: After inserting a new record
- beforeUpdate: Before updating a record
- afterUpdate: After updating a record
- beforeDelete: Before deleting a record
- afterDelete: After deleting a record
"""

import asyncio
import logging
from typing import Any, Callable, Optional

from ..schema import CollectionHooks
from .builtins import get_builtin_hook, webhook_async, HookFunction


logger = logging.getLogger(__name__)


class HookExecutor:
    """Execute lifecycle hooks for collections."""

    def __init__(self, hooks: Optional[CollectionHooks] = None):
        """Initialize the hook executor.

        Args:
            hooks: CollectionHooks from schema definition
        """
        self.hooks = hooks
        self._custom_hooks: dict[str, HookFunction] = {}
        self._resolved_hooks: dict[str, list[HookFunction]] = {}

    def register_custom_hook(self, name: str, hook: HookFunction) -> None:
        """Register a custom hook function.

        Args:
            name: Hook name (used in schema)
            hook: Hook function
        """
        self._custom_hooks[name] = hook
        # Clear cache when new hooks are registered
        self._resolved_hooks.clear()

    def _resolve_hooks(self, hook_names: list[str]) -> list[HookFunction]:
        """Resolve hook names to actual functions.

        Args:
            hook_names: List of hook specifications

        Returns:
            List of hook functions
        """
        resolved = []
        for name in hook_names:
            # Try custom hooks first
            base_name = name.split(":")[0]
            if base_name in self._custom_hooks:
                resolved.append(self._custom_hooks[base_name])
                continue

            # Try builtin hooks
            hook = get_builtin_hook(name)
            if hook:
                resolved.append(hook)
            else:
                logger.warning(f"Unknown hook: {name}")

        return resolved

    def _get_hooks_for_event(self, event: str) -> list[HookFunction]:
        """Get resolved hooks for an event.

        Args:
            event: Event name (e.g., "before_create")

        Returns:
            List of hook functions
        """
        if not self.hooks:
            return []

        # Check cache
        if event in self._resolved_hooks:
            return self._resolved_hooks[event]

        # Get hook names for this event
        hook_names = getattr(self.hooks, event, None) or []

        # Resolve to functions
        hooks = self._resolve_hooks(hook_names)
        self._resolved_hooks[event] = hooks

        return hooks

    async def run_before_create(
        self,
        data: dict[str, Any],
        user: Optional[dict] = None,
    ) -> dict[str, Any]:
        """Run beforeCreate hooks.

        Args:
            data: Input data for creating the record
            user: Current authenticated user (if any)

        Returns:
            Modified data after running hooks
        """
        hooks = self._get_hooks_for_event("before_create")
        for hook in hooks:
            try:
                data = hook(data, user, None)
            except Exception as e:
                logger.error(f"Hook error in beforeCreate: {e}")
                raise

        return data

    async def run_after_create(
        self,
        data: dict[str, Any],
        user: Optional[dict] = None,
        created_item: Any = None,
    ) -> None:
        """Run afterCreate hooks (including async webhooks).

        Args:
            data: The data that was used to create the record
            user: Current authenticated user (if any)
            created_item: The created database record
        """
        hooks = self._get_hooks_for_event("after_create")
        for hook in hooks:
            try:
                hook(data, user, created_item)
            except Exception as e:
                logger.error(f"Hook error in afterCreate: {e}")
                # Don't raise - afterCreate shouldn't fail the operation

        # Handle webhooks stored by webhook hook
        await self._process_webhooks(data, user)

    async def run_before_update(
        self,
        data: dict[str, Any],
        user: Optional[dict] = None,
        existing: Any = None,
    ) -> dict[str, Any]:
        """Run beforeUpdate hooks.

        Args:
            data: Input data for updating the record
            user: Current authenticated user (if any)
            existing: The existing database record

        Returns:
            Modified data after running hooks
        """
        hooks = self._get_hooks_for_event("before_update")
        for hook in hooks:
            try:
                data = hook(data, user, existing)
            except Exception as e:
                logger.error(f"Hook error in beforeUpdate: {e}")
                raise

        return data

    async def run_after_update(
        self,
        data: dict[str, Any],
        user: Optional[dict] = None,
        updated_item: Any = None,
    ) -> None:
        """Run afterUpdate hooks (including async webhooks).

        Args:
            data: The data that was used to update the record
            user: Current authenticated user (if any)
            updated_item: The updated database record
        """
        hooks = self._get_hooks_for_event("after_update")
        for hook in hooks:
            try:
                hook(data, user, updated_item)
            except Exception as e:
                logger.error(f"Hook error in afterUpdate: {e}")
                # Don't raise - afterUpdate shouldn't fail the operation

        # Handle webhooks
        await self._process_webhooks(data, user)

    async def run_before_delete(
        self,
        item_id: int,
        user: Optional[dict] = None,
        existing: Any = None,
    ) -> bool:
        """Run beforeDelete hooks.

        Args:
            item_id: ID of the record being deleted
            user: Current authenticated user (if any)
            existing: The existing database record

        Returns:
            True if delete should proceed, False to cancel
        """
        hooks = self._get_hooks_for_event("before_delete")
        data = {"id": item_id}

        for hook in hooks:
            try:
                result = hook(data, user, existing)
                # If hook returns False (or data with _cancel=True), cancel delete
                if result is False or (isinstance(result, dict) and result.get("_cancel")):
                    return False
            except Exception as e:
                logger.error(f"Hook error in beforeDelete: {e}")
                raise

        return True

    async def run_after_delete(
        self,
        item_id: int,
        user: Optional[dict] = None,
        deleted_item: Any = None,
    ) -> None:
        """Run afterDelete hooks (including async webhooks).

        Args:
            item_id: ID of the deleted record
            user: Current authenticated user (if any)
            deleted_item: The deleted database record (if available)
        """
        hooks = self._get_hooks_for_event("after_delete")
        data = {"id": item_id}

        for hook in hooks:
            try:
                hook(data, user, deleted_item)
            except Exception as e:
                logger.error(f"Hook error in afterDelete: {e}")
                # Don't raise - afterDelete shouldn't fail the operation

        # Handle webhooks
        await self._process_webhooks(data, user)

    async def _process_webhooks(
        self,
        data: dict[str, Any],
        user: Optional[dict] = None,
    ) -> None:
        """Process any webhooks queued by the webhook hook.

        Args:
            data: Data containing _webhooks list
            user: Current authenticated user
        """
        webhooks = data.pop("_webhooks", [])
        if webhooks:
            # Fire webhooks concurrently
            tasks = [webhook_async(url, data, user) for url in webhooks]
            await asyncio.gather(*tasks, return_exceptions=True)


# Executor cache per collection
_executors: dict[str, HookExecutor] = {}


def get_executor(collection_name: str, hooks: Optional[CollectionHooks] = None) -> HookExecutor:
    """Get or create a hook executor for a collection.

    Args:
        collection_name: Name of the collection
        hooks: CollectionHooks from schema (only needed on first call)

    Returns:
        HookExecutor for the collection
    """
    if collection_name not in _executors:
        _executors[collection_name] = HookExecutor(hooks)
    return _executors[collection_name]


def reset_executors() -> None:
    """Reset all executors (for testing)."""
    global _executors
    _executors.clear()
