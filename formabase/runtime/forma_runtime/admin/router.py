"""Admin UI routes for Formabase Runtime."""

from typing import Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..db import get_session
from .templates import (
    base_layout,
    collection_list_page,
    dashboard_page,
    multitenant_base_layout,
    multitenant_dashboard_page,
    record_form_page,
    projects_page,
)
from ..registry import SchemaRegistry


def create_admin_router(
    schema: Any,
    models: dict[str, Any],
    crud_instances: dict[str, Any] | None = None,
) -> APIRouter:
    """
    Create admin UI router for the given schema.

    Args:
        schema: The parsed schema definition
        models: Dictionary of SQLAlchemy models
        crud_instances: Optional dictionary of CRUD class instances

    Returns:
        FastAPI router with admin routes
    """
    router = APIRouter(prefix="/admin", tags=["Admin"])
    collections = list(schema.collections.keys())

    def get_collection_fields(collection_name: str) -> list[dict[str, Any]]:
        """Get field definitions for a collection."""
        collection = schema.collections.get(collection_name)
        if not collection:
            return []

        fields = []
        for field_name, field_def in collection.fields.items():
            fields.append({
                "name": field_name,
                "type": field_def.type.value if hasattr(field_def.type, 'value') else str(field_def.type),
                "required": field_def.required,
                "options": field_def.options if hasattr(field_def, 'options') else None,
            })
        return fields

    @router.get("", response_class=HTMLResponse)
    async def admin_dashboard(
        request: Request,
        session: AsyncSession = Depends(get_session),
    ):
        """Admin dashboard showing all collections."""
        collection_stats = []

        for coll_name in collections:
            model = models.get(coll_name)
            if model:
                # Get record count
                result = await session.execute(select(func.count()).select_from(model))
                count = result.scalar() or 0

                # Get field count
                collection = schema.collections.get(coll_name)
                field_count = len(collection.fields) if collection else 0

                collection_stats.append({
                    "name": coll_name,
                    "count": count,
                    "field_count": field_count,
                })

        return HTMLResponse(dashboard_page(collection_stats))

    @router.get("/{collection_name}", response_class=HTMLResponse)
    async def list_records(
        collection_name: str,
        page: int = Query(1, ge=1),
        per_page: int = Query(20, ge=1, le=100),
        session: AsyncSession = Depends(get_session),
    ):
        """List records in a collection."""
        if collection_name not in collections:
            raise HTTPException(status_code=404, detail="Collection not found")

        model = models.get(collection_name)
        if not model:
            raise HTTPException(status_code=404, detail="Model not found")

        # Get total count
        count_result = await session.execute(select(func.count()).select_from(model))
        total = count_result.scalar() or 0

        # Get paginated records
        offset = (page - 1) * per_page
        query = select(model).offset(offset).limit(per_page)

        # Order by created_at if available, otherwise by id
        if hasattr(model, 'created_at'):
            query = query.order_by(model.created_at.desc())
        elif hasattr(model, 'id'):
            query = query.order_by(model.id.desc())

        result = await session.execute(query)
        records = result.scalars().all()

        # Convert to dicts
        record_dicts = []
        for record in records:
            record_dict = {}
            for column in model.__table__.columns:
                value = getattr(record, column.name, None)
                # Convert UUID to string for display
                if isinstance(value, UUID):
                    value = str(value)
                record_dict[column.name] = value
            record_dicts.append(record_dict)

        fields = get_collection_fields(collection_name)

        return HTMLResponse(collection_list_page(
            collection_name=collection_name,
            fields=fields,
            records=record_dicts,
            total=total,
            page=page,
            per_page=per_page,
            collections=collections,
        ))

    @router.get("/{collection_name}/new", response_class=HTMLResponse)
    async def new_record_form(collection_name: str):
        """Show form to create a new record."""
        if collection_name not in collections:
            raise HTTPException(status_code=404, detail="Collection not found")

        fields = get_collection_fields(collection_name)

        return HTMLResponse(record_form_page(
            collection_name=collection_name,
            fields=fields,
            record=None,
            collections=collections,
        ))

    @router.get("/{collection_name}/{record_id}/edit", response_class=HTMLResponse)
    async def edit_record_form(
        collection_name: str,
        record_id: str,
        session: AsyncSession = Depends(get_session),
    ):
        """Show form to edit an existing record."""
        if collection_name not in collections:
            raise HTTPException(status_code=404, detail="Collection not found")

        model = models.get(collection_name)
        if not model:
            raise HTTPException(status_code=404, detail="Model not found")

        # Find record
        try:
            record_uuid = UUID(record_id)
            result = await session.execute(select(model).where(model.id == record_uuid))
            record = result.scalar_one_or_none()
        except (ValueError, Exception):
            record = None

        if not record:
            raise HTTPException(status_code=404, detail="Record not found")

        # Convert to dict
        record_dict = {}
        for column in model.__table__.columns:
            value = getattr(record, column.name, None)
            if isinstance(value, UUID):
                value = str(value)
            record_dict[column.name] = value

        fields = get_collection_fields(collection_name)

        return HTMLResponse(record_form_page(
            collection_name=collection_name,
            fields=fields,
            record=record_dict,
            collections=collections,
        ))

    @router.post("/{collection_name}")
    async def create_record(
        collection_name: str,
        request: Request,
        session: AsyncSession = Depends(get_session),
    ):
        """Create a new record."""
        if collection_name not in collections:
            raise HTTPException(status_code=404, detail="Collection not found")

        model = models.get(collection_name)
        if not model:
            raise HTTPException(status_code=404, detail="Model not found")

        # Get request body
        try:
            data = await request.json()
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid JSON")

        # Handle password hashing for auth collections
        collection = schema.collections.get(collection_name)
        if collection and collection.auth and 'password' in data:
            from ..auth.password import hash_password
            data['password_hash'] = hash_password(data.pop('password'))

        # Remove empty strings for optional fields
        cleaned_data = {k: v for k, v in data.items() if v != '' and v is not None}

        try:
            record = model(**cleaned_data)
            session.add(record)
            await session.commit()
            await session.refresh(record)

            return {"success": True, "id": str(record.id)}
        except Exception as e:
            await session.rollback()
            raise HTTPException(status_code=400, detail=str(e))

    @router.put("/{collection_name}/{record_id}")
    async def update_record(
        collection_name: str,
        record_id: str,
        request: Request,
        session: AsyncSession = Depends(get_session),
    ):
        """Update an existing record."""
        if collection_name not in collections:
            raise HTTPException(status_code=404, detail="Collection not found")

        model = models.get(collection_name)
        if not model:
            raise HTTPException(status_code=404, detail="Model not found")

        # Find record
        try:
            record_uuid = UUID(record_id)
            result = await session.execute(select(model).where(model.id == record_uuid))
            record = result.scalar_one_or_none()
        except (ValueError, Exception):
            record = None

        if not record:
            raise HTTPException(status_code=404, detail="Record not found")

        # Get request body
        try:
            data = await request.json()
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid JSON")

        # Handle password hashing for auth collections
        collection = schema.collections.get(collection_name)
        if collection and collection.auth and 'password' in data:
            if data['password']:  # Only update if password is provided
                from ..auth.password import hash_password
                data['password_hash'] = hash_password(data['password'])
            del data['password']

        # Update fields
        try:
            for key, value in data.items():
                if hasattr(record, key) and key not in ('id', 'created_at'):
                    if value == '':
                        value = None
                    setattr(record, key, value)

            await session.commit()
            await session.refresh(record)

            return {"success": True, "id": str(record.id)}
        except Exception as e:
            await session.rollback()
            raise HTTPException(status_code=400, detail=str(e))

    @router.delete("/{collection_name}/{record_id}")
    async def delete_record(
        collection_name: str,
        record_id: str,
        session: AsyncSession = Depends(get_session),
    ):
        """Delete a record."""
        if collection_name not in collections:
            raise HTTPException(status_code=404, detail="Collection not found")

        model = models.get(collection_name)
        if not model:
            raise HTTPException(status_code=404, detail="Model not found")

        # Find record
        try:
            record_uuid = UUID(record_id)
            result = await session.execute(select(model).where(model.id == record_uuid))
            record = result.scalar_one_or_none()
        except (ValueError, Exception):
            record = None

        if not record:
            raise HTTPException(status_code=404, detail="Record not found")

        try:
            await session.delete(record)
            await session.commit()
            return {"success": True}
        except Exception as e:
            await session.rollback()
            raise HTTPException(status_code=400, detail=str(e))

    return router


def create_multitenant_admin_router(registry: SchemaRegistry) -> APIRouter:
    """
    Create admin UI router for multi-tenant mode.

    Shows a list of projects and provides project-scoped admin for each.

    Args:
        registry: The schema registry containing registered projects

    Returns:
        FastAPI router with multi-tenant admin routes
    """
    router = APIRouter(prefix="/admin", tags=["Admin"])

    @router.get("", response_class=HTMLResponse)
    async def admin_projects():
        """Admin landing page showing all registered projects."""
        project_list = []
        for project_id in registry.list_projects():
            reg = registry.get(project_id)
            if reg:
                project_list.append({
                    "id": project_id,
                    "collection_count": len(reg.collections),
                })

        return HTMLResponse(projects_page(project_list))

    @router.get("/p/{project_id}", response_class=HTMLResponse)
    async def project_dashboard(
        project_id: str,
        session: AsyncSession = Depends(get_session),
    ):
        """Dashboard for a specific project."""
        reg = registry.get(project_id)
        if not reg:
            raise HTTPException(status_code=404, detail="Project not found")

        collection_stats = []
        for coll_name in reg.collections:
            model = reg.models.get(coll_name)
            if model:
                result = await session.execute(select(func.count()).select_from(model))
                count = result.scalar() or 0

                collection = reg.schema.collections.get(coll_name)
                field_count = len(collection.fields) if collection else 0

                collection_stats.append({
                    "name": coll_name,
                    "count": count,
                    "field_count": field_count,
                })

        return HTMLResponse(multitenant_dashboard_page(project_id, collection_stats))

    def _get_collection_fields(schema: Any, collection_name: str) -> list[dict[str, Any]]:
        """Get field definitions for a collection."""
        collection = schema.collections.get(collection_name)
        if not collection:
            return []

        fields = []
        for field_name, field_def in collection.fields.items():
            fields.append({
                "name": field_name,
                "type": field_def.type.value if hasattr(field_def.type, 'value') else str(field_def.type),
                "required": field_def.required,
                "options": field_def.options if hasattr(field_def, 'options') else None,
            })
        return fields

    def _multitenant_list_page(
        project_id: str,
        collection_name: str,
        fields: list[dict[str, Any]],
        records: list[dict[str, Any]],
        total: int,
        page: int,
        per_page: int,
        collections: list[str],
    ) -> str:
        """Generate collection list page for multi-tenant mode."""
        # Build table headers
        display_fields = [f for f in fields if f['name'] not in ('password_hash', 'password')][:8]
        headers = '<th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>'
        for field in display_fields:
            headers += f'<th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{field["name"].replace("_", " ")}</th>'
        headers += '<th class="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>'

        # Build table rows
        rows = ""
        if not records:
            rows = f'''
                <tr>
                    <td colspan="{len(display_fields) + 2}" class="px-6 py-12 text-center text-gray-500">
                        <svg class="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
                        </svg>
                        <p class="font-medium">No records yet</p>
                        <p class="text-sm mt-1">Create your first {collection_name} record</p>
                    </td>
                </tr>
            '''
        else:
            for record in records:
                row_id = record.get('id', 'N/A')
                cells = f'<td class="px-6 py-4 text-sm font-mono text-gray-500">{str(row_id)[:8]}...</td>'
                for field in display_fields:
                    value = record.get(field['name'], '')
                    field_type = field.get('type', 'text')
                    if value is None:
                        value = '<span class="text-gray-400">null</span>'
                    elif isinstance(value, bool):
                        value = f'<span class="px-2 py-1 text-xs rounded-full {"bg-green-100 text-green-800" if value else "bg-gray-100 text-gray-600"}">{"Yes" if value else "No"}</span>'
                    elif isinstance(value, (dict, list)):
                        value = f'<span class="text-gray-400">[object]</span>'
                    elif field_type == 'image' and value:
                        value = f'<img src="{value}" alt="" class="w-10 h-10 object-cover rounded">'
                    elif field_type == 'file' and value:
                        filename = str(value).split("/")[-1] if "/" in str(value) else str(value)
                        value = f'<a href="{value}" target="_blank" class="text-indigo-600 hover:underline text-xs">{filename[:20]}{"..." if len(filename) > 20 else ""}</a>'
                    else:
                        value = str(value)[:50] + ('...' if len(str(value)) > 50 else '')
                    cells += f'<td class="px-6 py-4 text-sm text-gray-900">{value}</td>'

                cells += f'''
                    <td class="px-6 py-4 text-right">
                        <div class="flex items-center justify-end gap-2">
                            <a href="/admin/p/{project_id}/{collection_name}/{row_id}/edit" class="p-2 text-gray-400 hover:text-indigo-600 transition" title="Edit">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                </svg>
                            </a>
                            <button onclick="deleteRecord('{row_id}')" class="p-2 text-gray-400 hover:text-red-600 transition" title="Delete">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                </svg>
                            </button>
                        </div>
                    </td>
                '''
                rows += f'<tr class="hover:bg-gray-50 transition">{cells}</tr>'

        # Pagination
        total_pages = (total + per_page - 1) // per_page
        pagination = ""
        if total_pages > 1:
            prev_disabled = "opacity-50 cursor-not-allowed" if page <= 1 else ""
            next_disabled = "opacity-50 cursor-not-allowed" if page >= total_pages else ""
            pagination = f'''
                <div class="flex items-center justify-between mt-6 px-6 pb-4">
                    <p class="text-sm text-gray-600">
                        Showing {(page - 1) * per_page + 1} to {min(page * per_page, total)} of {total} records
                    </p>
                    <div class="flex items-center gap-2">
                        <a href="?page={page - 1}" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 {prev_disabled}">Previous</a>
                        <span class="px-4 py-2 text-sm font-medium text-gray-700">Page {page} of {total_pages}</span>
                        <a href="?page={page + 1}" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 {next_disabled}">Next</a>
                    </div>
                </div>
            '''

        content = f'''
            <div class="flex items-center justify-between mb-8">
                <div>
                    <h1 class="text-3xl font-bold text-gray-900 capitalize">{collection_name}</h1>
                    <p class="text-gray-500 mt-1">{total} record{"s" if total != 1 else ""}</p>
                </div>
                <a href="/admin/p/{project_id}/{collection_name}/new" class="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                    </svg>
                    Add {collection_name[:-1] if collection_name.endswith('s') else collection_name}
                </a>
            </div>

            <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-gray-50 border-b border-gray-200">
                            <tr>{headers}</tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                            {rows}
                        </tbody>
                    </table>
                </div>
                {pagination}
            </div>

            <!-- Delete confirmation modal -->
            <div id="deleteModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 hidden">
                <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                    <h3 class="text-xl font-bold text-gray-900 mb-2">Delete Record</h3>
                    <p class="text-gray-600 mb-6">Are you sure you want to delete this record? This action cannot be undone.</p>
                    <div class="flex gap-3 justify-end">
                        <button onclick="closeDeleteModal()" class="px-5 py-2.5 text-gray-700 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition">Cancel</button>
                        <button onclick="confirmDelete()" class="px-5 py-2.5 text-white bg-red-600 rounded-lg font-medium hover:bg-red-700 transition">Delete</button>
                    </div>
                </div>
            </div>

            <script>
                let deleteId = null;

                function deleteRecord(id) {{
                    deleteId = id;
                    document.getElementById('deleteModal').classList.remove('hidden');
                }}

                function closeDeleteModal() {{
                    deleteId = null;
                    document.getElementById('deleteModal').classList.add('hidden');
                }}

                async function confirmDelete() {{
                    if (!deleteId) return;
                    try {{
                        const response = await fetch('/admin/p/{project_id}/{collection_name}/' + deleteId, {{
                            method: 'DELETE',
                        }});
                        if (response.ok) {{
                            window.location.reload();
                        }} else {{
                            alert('Failed to delete record');
                        }}
                    }} catch (e) {{
                        alert('Error: ' + e.message);
                    }}
                    closeDeleteModal();
                }}
            </script>
        '''

        return multitenant_base_layout(project_id, collection_name.title(), content, collections, collection_name)

    @router.get("/p/{project_id}/{collection_name}", response_class=HTMLResponse)
    async def list_project_records(
        project_id: str,
        collection_name: str,
        page: int = Query(1, ge=1),
        per_page: int = Query(20, ge=1, le=100),
        session: AsyncSession = Depends(get_session),
    ):
        """List records in a collection for a project."""
        reg = registry.get(project_id)
        if not reg:
            raise HTTPException(status_code=404, detail="Project not found")

        if collection_name not in reg.collections:
            raise HTTPException(status_code=404, detail="Collection not found")

        model = reg.models.get(collection_name)
        if not model:
            raise HTTPException(status_code=404, detail="Model not found")

        # Get total count
        count_result = await session.execute(select(func.count()).select_from(model))
        total = count_result.scalar() or 0

        # Get paginated records
        offset = (page - 1) * per_page
        query = select(model).offset(offset).limit(per_page)

        if hasattr(model, 'created_at'):
            query = query.order_by(model.created_at.desc())
        elif hasattr(model, 'id'):
            query = query.order_by(model.id.desc())

        result = await session.execute(query)
        records = result.scalars().all()

        record_dicts = []
        for record in records:
            record_dict = {}
            for column in model.__table__.columns:
                value = getattr(record, column.name, None)
                if isinstance(value, UUID):
                    value = str(value)
                record_dict[column.name] = value
            record_dicts.append(record_dict)

        fields = _get_collection_fields(reg.schema, collection_name)

        return HTMLResponse(_multitenant_list_page(
            project_id=project_id,
            collection_name=collection_name,
            fields=fields,
            records=record_dicts,
            total=total,
            page=page,
            per_page=per_page,
            collections=reg.collections,
        ))

    @router.get("/p/{project_id}/{collection_name}/new", response_class=HTMLResponse)
    async def new_project_record_form(project_id: str, collection_name: str):
        """Show form to create a new record in a project."""
        reg = registry.get(project_id)
        if not reg:
            raise HTTPException(status_code=404, detail="Project not found")

        if collection_name not in reg.collections:
            raise HTTPException(status_code=404, detail="Collection not found")

        fields = _get_collection_fields(reg.schema, collection_name)

        # Use a modified form page for multi-tenant
        return HTMLResponse(_multitenant_form_page(
            project_id=project_id,
            collection_name=collection_name,
            fields=fields,
            record=None,
            collections=reg.collections,
        ))

    @router.get("/p/{project_id}/{collection_name}/{record_id}/edit", response_class=HTMLResponse)
    async def edit_project_record_form(
        project_id: str,
        collection_name: str,
        record_id: str,
        session: AsyncSession = Depends(get_session),
    ):
        """Show form to edit a record in a project."""
        reg = registry.get(project_id)
        if not reg:
            raise HTTPException(status_code=404, detail="Project not found")

        if collection_name not in reg.collections:
            raise HTTPException(status_code=404, detail="Collection not found")

        model = reg.models.get(collection_name)
        if not model:
            raise HTTPException(status_code=404, detail="Model not found")

        try:
            record_uuid = UUID(record_id)
            result = await session.execute(select(model).where(model.id == record_uuid))
            record = result.scalar_one_or_none()
        except (ValueError, Exception):
            record = None

        if not record:
            raise HTTPException(status_code=404, detail="Record not found")

        record_dict = {}
        for column in model.__table__.columns:
            value = getattr(record, column.name, None)
            if isinstance(value, UUID):
                value = str(value)
            record_dict[column.name] = value

        fields = _get_collection_fields(reg.schema, collection_name)

        return HTMLResponse(_multitenant_form_page(
            project_id=project_id,
            collection_name=collection_name,
            fields=fields,
            record=record_dict,
            collections=reg.collections,
        ))

    def _multitenant_form_page(
        project_id: str,
        collection_name: str,
        fields: list[dict[str, Any]],
        record: dict[str, Any] | None,
        collections: list[str],
    ) -> str:
        """Generate form page for multi-tenant mode."""
        is_edit = record is not None
        title = f"Edit {collection_name}" if is_edit else f"New {collection_name}"

        form_fields = ""
        for field in fields:
            if field['name'] in ('id', 'created_at', 'updated_at', 'password_hash'):
                continue

            field_name = field['name']
            field_type = field.get('type', 'text')
            required = field.get('required', False)
            value = record.get(field_name, '') if record else ''

            required_attr = 'required' if required else ''
            required_badge = '<span class="text-red-500">*</span>' if required else ''

            if field_type in ('text', 'string'):
                input_html = f'<input type="text" name="{field_name}" value="{value or ""}" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" {required_attr}>'
            elif field_type == 'email':
                input_html = f'<input type="email" name="{field_name}" value="{value or ""}" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" {required_attr}>'
            elif field_type == 'password':
                placeholder = "Leave blank to keep current password" if is_edit else ""
                input_html = f'<input type="password" name="{field_name}" placeholder="{placeholder}" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition">'
            elif field_type in ('integer', 'number'):
                input_html = f'<input type="number" name="{field_name}" value="{value or ""}" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" {required_attr}>'
            elif field_type in ('float', 'decimal'):
                input_html = f'<input type="number" step="0.01" name="{field_name}" value="{value or ""}" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" {required_attr}>'
            elif field_type == 'boolean':
                checked = 'checked' if value else ''
                input_html = f'''
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" name="{field_name}" value="true" class="sr-only peer" {checked}>
                        <div class="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                '''
            elif field_type == 'date':
                input_html = f'<input type="date" name="{field_name}" value="{value or ""}" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" {required_attr}>'
            elif field_type == 'datetime':
                input_html = f'<input type="datetime-local" name="{field_name}" value="{str(value)[:16] if value else ""}" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" {required_attr}>'
            elif field_type == 'enum':
                options = field.get('options', [])
                options_html = '<option value="">Select...</option>'
                for opt in options or []:
                    selected = 'selected' if opt == value else ''
                    options_html += f'<option value="{opt}" {selected}>{opt}</option>'
                input_html = f'<select name="{field_name}" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" {required_attr}>{options_html}</select>'
            elif field_type == 'file':
                current_file = ""
                if value:
                    current_file = f'''
                        <div class="mb-2 p-3 bg-gray-50 rounded-lg flex items-center gap-3">
                            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                            </svg>
                            <div class="flex-1 min-w-0">
                                <p class="text-sm font-medium text-gray-900 truncate">{value.split("/")[-1] if "/" in str(value) else value}</p>
                                <a href="{value}" target="_blank" class="text-xs text-indigo-600 hover:underline">View file</a>
                            </div>
                        </div>
                    '''
                input_html = f'''
                    {current_file}
                    <input type="hidden" name="{field_name}" id="{field_name}_url" value="{value or ""}">
                    <input type="file" id="{field_name}_file" class="w-full px-4 py-3 border border-gray-300 rounded-lg" onchange="uploadFile(this, '{field_name}')" {required_attr if not value else ""}>
                '''
            elif field_type == 'image':
                current_image = ""
                if value:
                    current_image = f'<div class="mb-2"><img src="{value}" alt="" class="max-w-xs h-32 object-cover rounded-lg border"></div>'
                input_html = f'''
                    {current_image}
                    <input type="hidden" name="{field_name}" id="{field_name}_url" value="{value or ""}">
                    <input type="file" id="{field_name}_file" accept="image/*" class="w-full px-4 py-3 border border-gray-300 rounded-lg" onchange="uploadFile(this, '{field_name}')" {required_attr if not value else ""}>
                '''
            else:
                input_html = f'<input type="text" name="{field_name}" value="{value or ""}" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" {required_attr}>'

            form_fields += f'''
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        {field_name.replace("_", " ").title()} {required_badge}
                    </label>
                    {input_html}
                </div>
            '''

        action_url = f"/admin/p/{project_id}/{collection_name}/{record['id']}" if is_edit else f"/admin/p/{project_id}/{collection_name}"
        method = "PUT" if is_edit else "POST"

        content = f'''
            <div class="mb-8">
                <a href="/admin/p/{project_id}/{collection_name}" class="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 transition mb-4">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                    </svg>
                    Back to {collection_name}
                </a>
                <h1 class="text-3xl font-bold text-gray-900">{title}</h1>
            </div>

            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-2xl">
                <form id="recordForm" class="space-y-6">
                    {form_fields}

                    <div class="flex gap-4 pt-4 border-t border-gray-200">
                        <button type="submit" class="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition">
                            {"Update" if is_edit else "Create"} {collection_name[:-1] if collection_name.endswith('s') else collection_name}
                        </button>
                        <a href="/admin/p/{project_id}/{collection_name}" class="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition">
                            Cancel
                        </a>
                    </div>
                </form>
            </div>

            <script>
                async function uploadFile(input, fieldName) {{
                    const file = input.files[0];
                    if (!file) return;

                    const urlInput = document.getElementById(fieldName + '_url');
                    const formData = new FormData();
                    formData.append('file', file);

                    try {{
                        const response = await fetch('/upload/public?folder=admin', {{
                            method: 'POST',
                            body: formData
                        }});

                        if (response.ok) {{
                            const result = await response.json();
                            urlInput.value = result.url;
                        }} else {{
                            alert('Upload failed');
                        }}
                    }} catch (e) {{
                        alert('Upload error: ' + e.message);
                    }}
                }}

                document.getElementById('recordForm').addEventListener('submit', async (e) => {{
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    const data = {{}};

                    for (const [key, value] of formData.entries()) {{
                        data[key] = value;
                    }}

                    e.target.querySelectorAll('input[type="checkbox"]').forEach(cb => {{
                        if (!formData.has(cb.name)) {{
                            data[cb.name] = false;
                        }} else {{
                            data[cb.name] = true;
                        }}
                    }});

                    e.target.querySelectorAll('input[type="number"]').forEach(input => {{
                        if (data[input.name] !== '') {{
                            data[input.name] = parseFloat(data[input.name]);
                        }}
                    }});

                    e.target.querySelectorAll('input[type="file"]').forEach(input => {{
                        delete data[input.name];
                    }});

                    try {{
                        const response = await fetch('{action_url}', {{
                            method: '{method}',
                            headers: {{ 'Content-Type': 'application/json' }},
                            body: JSON.stringify(data)
                        }});

                        if (response.ok) {{
                            window.location.href = '/admin/p/{project_id}/{collection_name}';
                        }} else {{
                            const error = await response.json();
                            alert('Error: ' + (error.detail || 'Failed to save'));
                        }}
                    }} catch (e) {{
                        alert('Error: ' + e.message);
                    }}
                }});
            </script>
        '''

        return multitenant_base_layout(project_id, title, content, collections, collection_name)

    @router.post("/p/{project_id}/{collection_name}")
    async def create_project_record(
        project_id: str,
        collection_name: str,
        request: Request,
        session: AsyncSession = Depends(get_session),
    ):
        """Create a new record in a project collection."""
        reg = registry.get(project_id)
        if not reg:
            raise HTTPException(status_code=404, detail="Project not found")

        if collection_name not in reg.collections:
            raise HTTPException(status_code=404, detail="Collection not found")

        model = reg.models.get(collection_name)
        if not model:
            raise HTTPException(status_code=404, detail="Model not found")

        try:
            data = await request.json()
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid JSON")

        collection = reg.schema.collections.get(collection_name)
        if collection and collection.auth and 'password' in data:
            from ..auth.password import hash_password
            data['password_hash'] = hash_password(data.pop('password'))

        cleaned_data = {k: v for k, v in data.items() if v != '' and v is not None}

        try:
            record = model(**cleaned_data)
            session.add(record)
            await session.commit()
            await session.refresh(record)

            return {"success": True, "id": str(record.id)}
        except Exception as e:
            await session.rollback()
            raise HTTPException(status_code=400, detail=str(e))

    @router.put("/p/{project_id}/{collection_name}/{record_id}")
    async def update_project_record(
        project_id: str,
        collection_name: str,
        record_id: str,
        request: Request,
        session: AsyncSession = Depends(get_session),
    ):
        """Update a record in a project collection."""
        reg = registry.get(project_id)
        if not reg:
            raise HTTPException(status_code=404, detail="Project not found")

        if collection_name not in reg.collections:
            raise HTTPException(status_code=404, detail="Collection not found")

        model = reg.models.get(collection_name)
        if not model:
            raise HTTPException(status_code=404, detail="Model not found")

        try:
            record_uuid = UUID(record_id)
            result = await session.execute(select(model).where(model.id == record_uuid))
            record = result.scalar_one_or_none()
        except (ValueError, Exception):
            record = None

        if not record:
            raise HTTPException(status_code=404, detail="Record not found")

        try:
            data = await request.json()
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid JSON")

        collection = reg.schema.collections.get(collection_name)
        if collection and collection.auth and 'password' in data:
            if data['password']:
                from ..auth.password import hash_password
                data['password_hash'] = hash_password(data['password'])
            del data['password']

        try:
            for key, value in data.items():
                if hasattr(record, key) and key not in ('id', 'created_at'):
                    if value == '':
                        value = None
                    setattr(record, key, value)

            await session.commit()
            await session.refresh(record)

            return {"success": True, "id": str(record.id)}
        except Exception as e:
            await session.rollback()
            raise HTTPException(status_code=400, detail=str(e))

    @router.delete("/p/{project_id}/{collection_name}/{record_id}")
    async def delete_project_record(
        project_id: str,
        collection_name: str,
        record_id: str,
        session: AsyncSession = Depends(get_session),
    ):
        """Delete a record from a project collection."""
        reg = registry.get(project_id)
        if not reg:
            raise HTTPException(status_code=404, detail="Project not found")

        if collection_name not in reg.collections:
            raise HTTPException(status_code=404, detail="Collection not found")

        model = reg.models.get(collection_name)
        if not model:
            raise HTTPException(status_code=404, detail="Model not found")

        try:
            record_uuid = UUID(record_id)
            result = await session.execute(select(model).where(model.id == record_uuid))
            record = result.scalar_one_or_none()
        except (ValueError, Exception):
            record = None

        if not record:
            raise HTTPException(status_code=404, detail="Record not found")

        try:
            await session.delete(record)
            await session.commit()
            return {"success": True}
        except Exception as e:
            await session.rollback()
            raise HTTPException(status_code=400, detail=str(e))

    return router
