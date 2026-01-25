"""HTML templates for Admin UI."""

from typing import Any


def base_layout(title: str, content: str, collections: list[str], active_collection: str | None = None) -> str:
    """Base HTML layout with sidebar navigation."""
    nav_items = ""
    for coll in collections:
        active_class = "bg-indigo-700 text-white" if coll == active_collection else "text-indigo-100 hover:bg-indigo-600"
        nav_items += f'''
            <a href="/admin/{coll}" class="flex items-center gap-3 px-4 py-3 rounded-lg {active_class} transition">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                </svg>
                <span class="capitalize">{coll}</span>
            </a>
        '''

    return f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} - Formabase Admin</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body {{ font-family: 'Inter', sans-serif; }}
        .table-container {{ max-height: calc(100vh - 300px); }}
    </style>
</head>
<body class="bg-gray-50 min-h-screen">
    <div class="flex min-h-screen">
        <!-- Sidebar -->
        <aside class="w-64 bg-indigo-800 text-white flex flex-col fixed h-full">
            <div class="p-6 border-b border-indigo-700">
                <a href="/admin" class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                        <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"/>
                        </svg>
                    </div>
                    <div>
                        <h1 class="font-bold text-lg">Formabase</h1>
                        <p class="text-xs text-indigo-300">Admin Panel</p>
                    </div>
                </a>
            </div>

            <nav class="flex-1 p-4 space-y-1 overflow-y-auto">
                <p class="px-4 py-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider">Collections</p>
                {nav_items}
            </nav>

            <div class="p-4 border-t border-indigo-700">
                <a href="/docs" target="_blank" class="flex items-center gap-2 px-4 py-2 text-indigo-200 hover:text-white transition">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                    </svg>
                    API Docs
                </a>
            </div>
        </aside>

        <!-- Main Content -->
        <main class="flex-1 ml-64 p-8">
            {content}
        </main>
    </div>
</body>
</html>'''


def dashboard_page(collections: list[dict[str, Any]]) -> str:
    """Dashboard page showing collection stats."""
    cards = ""
    for coll in collections:
        cards += f'''
            <a href="/admin/{coll['name']}" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition group">
                <div class="flex items-center justify-between mb-4">
                    <div class="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center group-hover:bg-indigo-200 transition">
                        <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                        </svg>
                    </div>
                    <span class="text-3xl font-bold text-gray-900">{coll['count']}</span>
                </div>
                <h3 class="text-lg font-semibold text-gray-900 capitalize">{coll['name']}</h3>
                <p class="text-sm text-gray-500 mt-1">{coll['field_count']} fields</p>
            </a>
        '''

    content = f'''
        <div class="mb-8">
            <h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p class="text-gray-500 mt-2">Manage your data collections</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {cards}
        </div>
    '''

    return base_layout("Dashboard", content, [c['name'] for c in collections])


def collection_list_page(
    collection_name: str,
    fields: list[dict[str, Any]],
    records: list[dict[str, Any]],
    total: int,
    page: int,
    per_page: int,
    collections: list[str],
) -> str:
    """Collection list view with data table."""
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
                        <a href="/admin/{collection_name}/{row_id}/edit" class="p-2 text-gray-400 hover:text-indigo-600 transition" title="Edit">
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
            <div class="flex items-center justify-between mt-6">
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
            <a href="/admin/{collection_name}/new" class="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
                Add {collection_name[:-1] if collection_name.endswith('s') else collection_name}
            </a>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="overflow-x-auto table-container">
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
                    const response = await fetch('/admin/{collection_name}/' + deleteId, {{
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

    return base_layout(collection_name.title(), content, collections, collection_name)


def record_form_page(
    collection_name: str,
    fields: list[dict[str, Any]],
    record: dict[str, Any] | None,
    collections: list[str],
    error: str | None = None,
) -> str:
    """Create/Edit form for a record."""
    is_edit = record is not None
    title = f"Edit {collection_name}" if is_edit else f"New {collection_name}"

    # Build form fields
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

        # Determine input type based on field type
        if field_type == 'text' or field_type == 'string':
            input_html = f'<input type="text" name="{field_name}" value="{value or ""}" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" {required_attr}>'
        elif field_type == 'email':
            input_html = f'<input type="email" name="{field_name}" value="{value or ""}" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" {required_attr}>'
        elif field_type == 'password':
            placeholder = "Leave blank to keep current password" if is_edit else ""
            input_html = f'<input type="password" name="{field_name}" placeholder="{placeholder}" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition">'
        elif field_type == 'integer' or field_type == 'number':
            input_html = f'<input type="number" name="{field_name}" value="{value or ""}" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" {required_attr}>'
        elif field_type == 'float' or field_type == 'decimal':
            input_html = f'<input type="number" step="0.01" name="{field_name}" value="{value or ""}" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" {required_attr}>'
        elif field_type == 'boolean':
            checked = 'checked' if value else ''
            input_html = f'''
                <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" name="{field_name}" value="true" class="sr-only peer" {checked}>
                    <div class="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
            '''
        elif field_type == 'date':
            input_html = f'<input type="date" name="{field_name}" value="{value or ""}" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" {required_attr}>'
        elif field_type == 'datetime':
            input_html = f'<input type="datetime-local" name="{field_name}" value="{str(value)[:16] if value else ""}" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" {required_attr}>'
        elif field_type == 'enum':
            options = field.get('options', [])
            options_html = '<option value="">Select...</option>'
            for opt in options:
                selected = 'selected' if opt == value else ''
                options_html += f'<option value="{opt}" {selected}>{opt}</option>'
            input_html = f'<select name="{field_name}" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" {required_attr}>{options_html}</select>'
        elif field_type == 'file':
            # File upload with preview of current file
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
                <div class="relative">
                    <input type="file" id="{field_name}_file" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100" onchange="uploadFile(this, '{field_name}')" {required_attr if not value else ""}>
                    <div id="{field_name}_progress" class="hidden mt-2">
                        <div class="w-full bg-gray-200 rounded-full h-2">
                            <div id="{field_name}_progressbar" class="bg-indigo-600 h-2 rounded-full transition-all" style="width: 0%"></div>
                        </div>
                    </div>
                </div>
            '''
        elif field_type == 'image':
            # Image upload with preview
            current_image = ""
            if value:
                current_image = f'''
                    <div class="mb-2">
                        <img src="{value}" alt="Current image" class="max-w-xs h-32 object-cover rounded-lg border border-gray-200">
                    </div>
                '''
            input_html = f'''
                {current_image}
                <input type="hidden" name="{field_name}" id="{field_name}_url" value="{value or ""}">
                <div class="relative">
                    <input type="file" id="{field_name}_file" accept="image/*" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100" onchange="uploadFile(this, '{field_name}')" {required_attr if not value else ""}>
                    <div id="{field_name}_progress" class="hidden mt-2">
                        <div class="w-full bg-gray-200 rounded-full h-2">
                            <div id="{field_name}_progressbar" class="bg-indigo-600 h-2 rounded-full transition-all" style="width: 0%"></div>
                        </div>
                    </div>
                    <div id="{field_name}_preview" class="hidden mt-2">
                        <img id="{field_name}_previewimg" class="max-w-xs h-32 object-cover rounded-lg border border-gray-200">
                    </div>
                </div>
            '''
        elif field_type == 'relation':
            # For relations, we'd need to fetch related records - simplified for now
            input_html = f'<input type="text" name="{field_name}" value="{value or ""}" placeholder="Enter ID" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition">'
        elif field_type == 'json':
            json_value = str(value) if value else '{}'
            input_html = f'<textarea name="{field_name}" rows="4" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition font-mono text-sm" {required_attr}>{json_value}</textarea>'
        else:
            # Default to text input
            input_html = f'<input type="text" name="{field_name}" value="{value or ""}" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" {required_attr}>'

        form_fields += f'''
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                    {field_name.replace("_", " ").title()} {required_badge}
                </label>
                {input_html}
            </div>
        '''

    error_html = ""
    if error:
        error_html = f'''
            <div class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <p class="font-medium">Error</p>
                <p class="text-sm">{error}</p>
            </div>
        '''

    action_url = f"/admin/{collection_name}/{record['id']}" if is_edit else f"/admin/{collection_name}"
    method = "PUT" if is_edit else "POST"

    content = f'''
        <div class="mb-8">
            <a href="/admin/{collection_name}" class="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 transition mb-4">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                </svg>
                Back to {collection_name}
            </a>
            <h1 class="text-3xl font-bold text-gray-900">{title}</h1>
        </div>

        {error_html}

        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-2xl">
            <form id="recordForm" class="space-y-6">
                {form_fields}

                <div class="flex gap-4 pt-4 border-t border-gray-200">
                    <button type="submit" class="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition">
                        {("Update" if is_edit else "Create")} {collection_name[:-1] if collection_name.endswith('s') else collection_name}
                    </button>
                    <a href="/admin/{collection_name}" class="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition">
                        Cancel
                    </a>
                </div>
            </form>
        </div>

        <script>
            // File upload function
            async function uploadFile(input, fieldName) {{
                const file = input.files[0];
                if (!file) return;

                const progressDiv = document.getElementById(fieldName + '_progress');
                const progressBar = document.getElementById(fieldName + '_progressbar');
                const urlInput = document.getElementById(fieldName + '_url');
                const previewDiv = document.getElementById(fieldName + '_preview');
                const previewImg = document.getElementById(fieldName + '_previewimg');

                // Show progress
                progressDiv.classList.remove('hidden');
                progressBar.style.width = '10%';

                try {{
                    const formData = new FormData();
                    formData.append('file', file);

                    progressBar.style.width = '30%';

                    const response = await fetch('/upload/public?folder=admin', {{
                        method: 'POST',
                        body: formData
                    }});

                    progressBar.style.width = '90%';

                    if (response.ok) {{
                        const result = await response.json();
                        urlInput.value = result.url;
                        progressBar.style.width = '100%';

                        // Show image preview if applicable
                        if (previewDiv && file.type.startsWith('image/')) {{
                            previewImg.src = result.url;
                            previewDiv.classList.remove('hidden');
                        }}

                        // Hide progress after success
                        setTimeout(() => {{
                            progressDiv.classList.add('hidden');
                        }}, 500);
                    }} else {{
                        const error = await response.json();
                        alert('Upload failed: ' + (error.detail || 'Unknown error'));
                        progressDiv.classList.add('hidden');
                    }}
                }} catch (e) {{
                    alert('Upload error: ' + e.message);
                    progressDiv.classList.add('hidden');
                }}
            }}

            document.getElementById('recordForm').addEventListener('submit', async (e) => {{
                e.preventDefault();
                const formData = new FormData(e.target);
                const data = {{}};

                // Handle checkboxes and convert form data
                for (const [key, value] of formData.entries()) {{
                    data[key] = value;
                }}

                // Set unchecked checkboxes to false
                e.target.querySelectorAll('input[type="checkbox"]').forEach(cb => {{
                    if (!formData.has(cb.name)) {{
                        data[cb.name] = false;
                    }} else {{
                        data[cb.name] = true;
                    }}
                }});

                // Convert number fields
                e.target.querySelectorAll('input[type="number"]').forEach(input => {{
                    if (data[input.name] !== '') {{
                        data[input.name] = parseFloat(data[input.name]);
                    }}
                }});

                // Exclude file inputs (we use hidden URL fields instead)
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
                        window.location.href = '/admin/{collection_name}';
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

    return base_layout(title, content, collections, collection_name)


def projects_page(projects: list[dict[str, Any]]) -> str:
    """Projects list page for multi-tenant admin."""
    cards = ""
    for project in projects:
        cards += f'''
            <a href="/admin/p/{project['id']}" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition group">
                <div class="flex items-center justify-between mb-4">
                    <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition">
                        <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                        </svg>
                    </div>
                    <span class="text-lg font-bold text-gray-900">{project['collection_count']}</span>
                </div>
                <h3 class="text-lg font-semibold text-gray-900 truncate">{project['id'][:8]}...</h3>
                <p class="text-sm text-gray-500 mt-1">{project['collection_count']} collection{"s" if project['collection_count'] != 1 else ""}</p>
            </a>
        '''

    if not projects:
        cards = '''
            <div class="col-span-full text-center py-12">
                <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
                </svg>
                <h3 class="text-xl font-semibold text-gray-900 mb-2">No Projects Registered</h3>
                <p class="text-gray-500">Deploy a backend from the Forma Builder to see it here.</p>
            </div>
        '''

    return f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Projects - Formabase Admin</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body {{ font-family: 'Inter', sans-serif; }}
    </style>
</head>
<body class="bg-gray-50 min-h-screen">
    <div class="flex min-h-screen">
        <!-- Sidebar -->
        <aside class="w-64 bg-indigo-800 text-white flex flex-col fixed h-full">
            <div class="p-6 border-b border-indigo-700">
                <a href="/admin" class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                        <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"/>
                        </svg>
                    </div>
                    <div>
                        <h1 class="font-bold text-lg">Formabase</h1>
                        <p class="text-xs text-indigo-300">Multi-Tenant Admin</p>
                    </div>
                </a>
            </div>

            <nav class="flex-1 p-4 space-y-1 overflow-y-auto">
                <p class="px-4 py-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider">Projects</p>
                <a href="/admin" class="flex items-center gap-3 px-4 py-3 rounded-lg bg-indigo-700 text-white transition">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                    </svg>
                    <span>All Projects</span>
                </a>
            </nav>

            <div class="p-4 border-t border-indigo-700">
                <a href="/docs" target="_blank" class="flex items-center gap-2 px-4 py-2 text-indigo-200 hover:text-white transition">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                    </svg>
                    API Docs
                </a>
            </div>
        </aside>

        <!-- Main Content -->
        <main class="flex-1 ml-64 p-8">
            <div class="mb-8">
                <h1 class="text-3xl font-bold text-gray-900">Registered Projects</h1>
                <p class="text-gray-500 mt-2">Select a project to manage its data</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {cards}
            </div>
        </main>
    </div>
</body>
</html>'''


def multitenant_dashboard_page(project_id: str, collections: list[dict[str, Any]]) -> str:
    """Dashboard page for a specific project in multi-tenant mode."""
    cards = ""
    for coll in collections:
        cards += f'''
            <a href="/admin/p/{project_id}/{coll['name']}" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition group">
                <div class="flex items-center justify-between mb-4">
                    <div class="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center group-hover:bg-indigo-200 transition">
                        <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                        </svg>
                    </div>
                    <span class="text-3xl font-bold text-gray-900">{coll['count']}</span>
                </div>
                <h3 class="text-lg font-semibold text-gray-900 capitalize">{coll['name']}</h3>
                <p class="text-sm text-gray-500 mt-1">{coll['field_count']} fields</p>
            </a>
        '''

    return multitenant_base_layout(project_id, "Dashboard", cards, [c['name'] for c in collections])


def multitenant_base_layout(
    project_id: str,
    title: str,
    content: str,
    collections: list[str],
    active_collection: str | None = None
) -> str:
    """Base layout for multi-tenant project admin."""
    nav_items = ""
    for coll in collections:
        active_class = "bg-indigo-700 text-white" if coll == active_collection else "text-indigo-100 hover:bg-indigo-600"
        nav_items += f'''
            <a href="/admin/p/{project_id}/{coll}" class="flex items-center gap-3 px-4 py-3 rounded-lg {active_class} transition">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                </svg>
                <span class="capitalize">{coll}</span>
            </a>
        '''

    return f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} - {project_id[:8]} - Formabase Admin</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body {{ font-family: 'Inter', sans-serif; }}
        .table-container {{ max-height: calc(100vh - 300px); }}
    </style>
</head>
<body class="bg-gray-50 min-h-screen">
    <div class="flex min-h-screen">
        <!-- Sidebar -->
        <aside class="w-64 bg-indigo-800 text-white flex flex-col fixed h-full">
            <div class="p-6 border-b border-indigo-700">
                <a href="/admin/p/{project_id}" class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                        <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"/>
                        </svg>
                    </div>
                    <div>
                        <h1 class="font-bold text-lg">Formabase</h1>
                        <p class="text-xs text-indigo-300 font-mono">{project_id[:8]}...</p>
                    </div>
                </a>
            </div>

            <div class="px-4 pt-4">
                <a href="/admin" class="flex items-center gap-2 px-3 py-2 text-indigo-300 hover:text-white text-sm transition">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                    </svg>
                    All Projects
                </a>
            </div>

            <nav class="flex-1 p-4 space-y-1 overflow-y-auto">
                <p class="px-4 py-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider">Collections</p>
                {nav_items}
            </nav>

            <div class="p-4 border-t border-indigo-700">
                <a href="/docs" target="_blank" class="flex items-center gap-2 px-4 py-2 text-indigo-200 hover:text-white transition">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                    </svg>
                    API Docs
                </a>
            </div>
        </aside>

        <!-- Main Content -->
        <main class="flex-1 ml-64 p-8">
            {content}
        </main>
    </div>
</body>
</html>'''
