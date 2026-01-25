"""Main CLI application for Forma Runtime."""

import asyncio
from pathlib import Path

import typer
from rich.console import Console
from rich.table import Table

app = typer.Typer(
    name="forma-runtime",
    help="Forma Runtime - Auto-generated backend from schema",
    add_completion=False,
)
console = Console()


@app.command()
def serve(
    schema: Path = typer.Option(
        Path("schema.json"),
        "--schema",
        "-s",
        help="Path to schema.json file",
    ),
    host: str = typer.Option(
        "0.0.0.0",
        "--host",
        "-h",
        help="Host to bind to",
    ),
    port: int = typer.Option(
        8000,
        "--port",
        "-p",
        help="Port to bind to",
    ),
    reload: bool = typer.Option(
        False,
        "--reload",
        "-r",
        help="Enable auto-reload for development",
    ),
):
    """Start the Forma Runtime server."""
    import uvicorn

    from ..config import settings

    # Verify schema exists
    if not schema.exists():
        console.print(f"[red]Error:[/red] Schema file not found: {schema}")
        raise typer.Exit(1)

    # Update settings
    settings.schema_path = str(schema)
    settings.host = host
    settings.port = port

    console.print(f"[blue]Starting Forma Runtime...[/blue]")
    console.print(f"  Schema: {schema}")
    console.print(f"  Server: http://{host}:{port}")
    console.print(f"  Docs:   http://{host}:{port}/docs")
    console.print()

    uvicorn.run(
        "forma_runtime.main:app",
        host=host,
        port=port,
        reload=reload,
    )


@app.command()
def migrate(
    schema: Path = typer.Option(
        Path("schema.json"),
        "--schema",
        "-s",
        help="Path to schema.json file",
    ),
    dry_run: bool = typer.Option(
        False,
        "--dry-run",
        help="Show what would be done without making changes",
    ),
):
    """Apply database migrations based on schema."""
    asyncio.run(_migrate(schema, dry_run))


async def _migrate(schema_path: Path, dry_run: bool):
    """Async migration implementation."""
    from ..config import settings
    from ..db import MigrationManager, ModelFactory, get_engine
    from ..schema import SchemaParseError, SchemaParser, SchemaValidationError

    # Verify schema exists
    if not schema_path.exists():
        console.print(f"[red]Error:[/red] Schema file not found: {schema_path}")
        raise typer.Exit(1)

    console.print(f"[blue]Parsing schema:[/blue] {schema_path}")

    # Parse schema
    try:
        parser = SchemaParser(schema_path)
        schema = parser.parse()
    except SchemaParseError as e:
        console.print(f"[red]Parse error:[/red] {e}")
        raise typer.Exit(1)
    except SchemaValidationError as e:
        console.print(f"[red]Validation error:[/red] {e}")
        raise typer.Exit(1)

    console.print(f"[green]✓[/green] Schema version: {schema.version}")
    console.print(f"[green]✓[/green] App name: {schema.name}")
    console.print(f"[green]✓[/green] Collections: {', '.join(schema.collections.keys())}")
    console.print()

    # Generate models
    console.print("[blue]Generating models...[/blue]")
    factory = ModelFactory(schema)
    models = factory.generate_models()

    # Show model info
    table = Table(title="Generated Models")
    table.add_column("Collection", style="cyan")
    table.add_column("Model", style="green")
    table.add_column("Fields", style="yellow")

    for name, model in models.items():
        fields = [col.name for col in model.__table__.columns]
        table.add_row(name, model.__name__, ", ".join(fields))

    console.print(table)
    console.print()

    if dry_run:
        console.print("[yellow]Dry run - no changes applied[/yellow]")
        return

    # Run migrations
    console.print(f"[blue]Applying migrations...[/blue]")
    console.print(f"  Database: {settings.database_url}")

    engine = get_engine()
    manager = MigrationManager(engine, models)

    try:
        actions = await manager.auto_migrate()

        if actions:
            for action in actions:
                console.print(f"  [green]✓[/green] {action}")
        else:
            console.print("  [dim]No changes needed[/dim]")

        console.print()
        console.print("[green]✓ Migrations applied successfully[/green]")
    finally:
        from ..db import dispose_engine

        await dispose_engine()


@app.command()
def info(
    schema: Path = typer.Option(
        Path("schema.json"),
        "--schema",
        "-s",
        help="Path to schema.json file",
    ),
):
    """Show information about the schema."""
    from ..schema import SchemaParseError, SchemaParser, SchemaValidationError

    # Verify schema exists
    if not schema.exists():
        console.print(f"[red]Error:[/red] Schema file not found: {schema}")
        raise typer.Exit(1)

    # Parse schema
    try:
        parser = SchemaParser(schema)
        schema_def = parser.parse()
    except (SchemaParseError, SchemaValidationError) as e:
        console.print(f"[red]Error:[/red] {e}")
        raise typer.Exit(1)

    # Display info
    console.print(f"\n[bold]Schema: {schema_def.name}[/bold]")
    console.print(f"Version: {schema_def.version}\n")

    # Collections table
    for coll_name, collection in schema_def.collections.items():
        table = Table(title=f"Collection: {coll_name}")
        table.add_column("Field", style="cyan")
        table.add_column("Type", style="green")
        table.add_column("Required", style="yellow")
        table.add_column("Options", style="dim")

        for field_name, field in collection.fields.items():
            options = []
            if field.unique:
                options.append("unique")
            if field.default is not None:
                options.append(f"default={field.default}")
            if field.target:
                options.append(f"→ {field.target}")

            table.add_row(
                field_name,
                field.type.value,
                "✓" if field.required else "",
                ", ".join(options) if options else "",
            )

        console.print(table)
        console.print()


@app.command()
def check(
    schema: Path = typer.Option(
        Path("schema.json"),
        "--schema",
        "-s",
        help="Path to schema.json file",
    ),
):
    """Check schema for errors without applying changes."""
    from ..schema import SchemaParseError, SchemaParser, SchemaValidationError

    if not schema.exists():
        console.print(f"[red]Error:[/red] Schema file not found: {schema}")
        raise typer.Exit(1)

    try:
        parser = SchemaParser(schema)
        schema_def = parser.parse()
        console.print(f"[green]✓[/green] Schema is valid")
        console.print(f"  Name: {schema_def.name}")
        console.print(f"  Version: {schema_def.version}")
        console.print(f"  Collections: {len(schema_def.collections)}")

        # Check for auth collection
        auth = schema_def.get_auth_collection()
        if auth:
            console.print(f"  Auth collection: {auth[0]}")
        else:
            console.print(f"  Auth collection: [dim]none[/dim]")

    except SchemaParseError as e:
        console.print(f"[red]Parse error:[/red] {e}")
        raise typer.Exit(1)
    except SchemaValidationError as e:
        console.print(f"[red]Validation error:[/red] {e}")
        raise typer.Exit(1)


@app.command()
def version():
    """Show version information."""
    console.print("Forma Runtime v0.1.0")


@app.command()
def describe(
    description: str = typer.Argument(..., help="Natural language description of your app"),
    output: Path = typer.Option(
        Path("schema.json"),
        "--output",
        "-o",
        help="Output file path",
    ),
    model: str = typer.Option(
        "qwen2.5-coder:32b",
        "--model",
        "-m",
        help="Ollama model to use",
    ),
    use_cortex: bool = typer.Option(
        True,
        "--cortex/--no-cortex",
        help="Use Cortex for context from past schemas",
    ),
    stream: bool = typer.Option(
        True,
        "--stream/--no-stream",
        help="Stream output as it generates",
    ),
):
    """Generate schema.json from natural language description.

    Uses local Ollama with your RTX 4090 for zero-cost AI generation.

    Examples:
        formabase describe "blog with users, posts, and comments"
        formabase describe "e-commerce with products, orders, and reviews" -o shop.json
        formabase describe "saas with orgs, users, and projects" --model qwen2.5-coder:7b
    """
    import json

    from rich.live import Live
    from rich.panel import Panel
    from rich.spinner import Spinner
    from rich.syntax import Syntax

    from ..ai import SchemaGenerator
    from ..ai.schema_generator import get_cortex_context

    console.print("\n[bold blue]━━━ Formabase AI Schema Generator ━━━[/bold blue]\n")
    console.print(f"[dim]Description:[/dim] {description}")
    console.print(f"[dim]Model:[/dim]       {model}")
    console.print(f"[dim]Output:[/dim]      {output}\n")

    # Get Cortex context if available
    context = None
    if use_cortex:
        console.print("[yellow]Checking Cortex for similar schemas...[/yellow]")
        context = get_cortex_context(description)
        if context:
            console.print(f"[green]✓ Found {len(context)} similar schemas for context[/green]\n")
        else:
            console.print("[dim]No similar schemas found, generating from scratch[/dim]\n")

    # Initialize generator
    try:
        generator = SchemaGenerator(model=model)
    except Exception as e:
        console.print(f"[red]Error initializing Ollama:[/red] {e}")
        console.print("\n[yellow]Make sure Ollama is running:[/yellow]")
        console.print("  ollama serve")
        console.print(f"  ollama pull {model}")
        raise typer.Exit(1)

    # Generate schema
    console.print("[bold]Generating schema...[/bold]\n")

    if stream:
        # Stream the output
        full_content = ""
        with Live(console=console, refresh_per_second=4) as live:
            try:
                for chunk in generator.generate_stream(description, context=context):
                    full_content += chunk
                    # Try to format as JSON if valid
                    try:
                        parsed = json.loads(full_content)
                        syntax = Syntax(
                            json.dumps(parsed, indent=2),
                            "json",
                            theme="monokai",
                            word_wrap=True,
                        )
                        live.update(Panel(syntax, title="Generated Schema", border_style="green"))
                    except json.JSONDecodeError:
                        # Show raw content while generating
                        live.update(Panel(full_content, title="Generating...", border_style="yellow"))
            except Exception as e:
                console.print(f"\n[red]Generation error:[/red] {e}")
                raise typer.Exit(1)

        # Parse the final result
        try:
            schema_dict = generator._extract_json(full_content)
            schema_dict = generator._validate_and_fix(schema_dict)
        except Exception as e:
            console.print(f"\n[red]Parse error:[/red] {e}")
            console.print("\n[dim]Raw output:[/dim]")
            console.print(full_content)
            raise typer.Exit(1)
    else:
        # Non-streaming generation with spinner
        with console.status("[bold green]Generating schema..."):
            try:
                schema_dict = generator.generate(description, context=context)
            except Exception as e:
                console.print(f"[red]Error:[/red] {e}")
                raise typer.Exit(1)

        # Display result
        syntax = Syntax(
            json.dumps(schema_dict, indent=2),
            "json",
            theme="monokai",
            word_wrap=True,
        )
        console.print(Panel(syntax, title="Generated Schema", border_style="green"))

    # Write to file
    with open(output, "w") as f:
        json.dump(schema_dict, f, indent=2)

    # Summary
    collections = schema_dict.get("collections", {})
    console.print(f"\n[bold green]✓ Schema saved to {output}[/bold green]")
    console.print(f"  Collections: {len(collections)}")
    for name, coll in collections.items():
        fields = coll.get("fields", {})
        auth = " [auth]" if coll.get("auth") else ""
        console.print(f"    • {name}{auth} ({len(fields)} fields)")

    console.print("\n[bold]Next steps:[/bold]")
    console.print(f"  formabase dev -s {output}")
    console.print()


@app.command()
def dev(
    schema: Path = typer.Option(
        Path("schema.json"),
        "--schema",
        "-s",
        help="Path to schema.json file",
    ),
    port: int = typer.Option(
        8000,
        "--port",
        "-p",
        help="Port to bind to",
    ),
):
    """Start development server with hot-reload and auto-migration.

    Watches schema.json for changes and auto-migrates the database.
    """
    import os
    import signal
    import subprocess
    import sys
    import threading
    import time

    from watchdog.events import FileSystemEventHandler
    from watchdog.observers import Observer

    from ..config import settings
    from ..schema import SchemaParser

    # Verify schema exists
    if not schema.exists():
        console.print(f"[red]Error:[/red] Schema file not found: {schema}")
        raise typer.Exit(1)

    schema_path = schema.resolve()
    settings.schema_path = str(schema_path)

    # Parse and display schema info
    try:
        parser = SchemaParser(schema_path)
        schema_def = parser.parse()
    except Exception as e:
        console.print(f"[red]Schema error:[/red] {e}")
        raise typer.Exit(1)

    # Run initial migration
    console.print("[bold blue]━━━ Formabase Dev Server ━━━[/bold blue]\n")
    console.print(f"[dim]Schema:[/dim]   {schema_path}")
    console.print(f"[dim]Database:[/dim] {settings.database_url}\n")

    console.print("[yellow]Running initial migration...[/yellow]")
    asyncio.run(_run_migration(schema_path))
    console.print("[green]✓ Database ready[/green]\n")

    # Display endpoints
    _print_endpoints(schema_def, port)

    # Watchdog handler for schema changes
    class SchemaChangeHandler(FileSystemEventHandler):
        def __init__(self):
            self.last_modified = 0

        def on_modified(self, event):
            if event.src_path == str(schema_path):
                # Debounce - ignore if modified within 1 second
                now = time.time()
                if now - self.last_modified < 1:
                    return
                self.last_modified = now

                console.print("\n[yellow]Schema changed - re-migrating...[/yellow]")
                try:
                    asyncio.run(_run_migration(schema_path))
                    console.print("[green]✓ Migration complete[/green]")

                    # Re-parse and show updated endpoints
                    parser = SchemaParser(schema_path)
                    schema_def = parser.parse()
                    _print_endpoints(schema_def, port)
                except Exception as e:
                    console.print(f"[red]Migration error:[/red] {e}")

    # Start schema watcher
    observer = Observer()
    handler = SchemaChangeHandler()
    observer.schedule(handler, str(schema_path.parent), recursive=False)
    observer.start()

    console.print("[bold green]Server starting...[/bold green]")
    console.print("[dim]Press Ctrl+C to stop[/dim]\n")

    # Start uvicorn with reload
    try:
        import uvicorn

        uvicorn.run(
            "forma_runtime.main:app",
            host="0.0.0.0",
            port=port,
            reload=True,
            reload_dirs=[str(schema_path.parent)],
            log_level="info",
        )
    except KeyboardInterrupt:
        pass
    finally:
        observer.stop()
        observer.join()
        console.print("\n[yellow]Server stopped[/yellow]")


async def _run_migration(schema_path: Path):
    """Run migration for the given schema."""
    from ..config import settings
    from ..db import MigrationManager, ModelFactory, get_engine, dispose_engine
    from ..schema import SchemaParser

    parser = SchemaParser(schema_path)
    schema = parser.parse()

    factory = ModelFactory(schema)
    models = factory.generate_models()

    engine = get_engine()
    manager = MigrationManager(engine, models)

    try:
        await manager.auto_migrate()
    finally:
        await dispose_engine()


def _print_endpoints(schema_def, port: int):
    """Print a nice summary of available endpoints."""
    from rich.panel import Panel
    from rich.table import Table

    table = Table(show_header=True, header_style="bold cyan", box=None)
    table.add_column("Method", style="green", width=8)
    table.add_column("Endpoint", style="white")
    table.add_column("Description", style="dim")

    # Health
    table.add_row("GET", f"http://localhost:{port}/health", "Health check")
    table.add_row("GET", f"http://localhost:{port}/docs", "Swagger UI")
    table.add_row("GET", f"http://localhost:{port}/graphql", "GraphQL Playground")
    table.add_row("", "", "")

    # Auth endpoints
    if schema_def.get_auth_collection():
        table.add_row("POST", f"/api/auth/register", "Create account")
        table.add_row("POST", f"/api/auth/login", "Login")
        table.add_row("GET", f"/api/auth/me", "Current user")
        table.add_row("", "", "")

    # Collection endpoints
    for name in schema_def.collections.keys():
        table.add_row("GET", f"/api/{name}", f"List {name}s")
        table.add_row("POST", f"/api/{name}", f"Create {name}")
        table.add_row("GET", f"/api/{name}/{{id}}", f"Get {name}")
        table.add_row("PUT", f"/api/{name}/{{id}}", f"Update {name}")
        table.add_row("DELETE", f"/api/{name}/{{id}}", f"Delete {name}")
        table.add_row("", "", "")

    console.print(Panel(table, title="[bold]API Endpoints[/bold]", border_style="blue"))


@app.command()
def init(
    name: str = typer.Argument("my-app", help="Project name"),
    template: str = typer.Option(
        "blank",
        "--template",
        "-t",
        help="Template: blank, blog, saas, ecommerce",
    ),
    directory: Path = typer.Option(
        Path("."),
        "--dir",
        "-d",
        help="Directory to create project in",
    ),
):
    """Initialize a new Formabase project.

    Creates schema.json, .env, and .gitignore.
    """
    import secrets

    project_dir = directory / name if name != "." else directory
    project_dir.mkdir(parents=True, exist_ok=True)

    # Generate schema based on template
    templates = {
        "blank": {
            "version": "1.0",
            "name": name,
            "collections": {
                "user": {
                    "auth": True,
                    "timestamps": True,
                    "fields": {
                        "email": {"type": "email", "required": True, "unique": True},
                        "name": {"type": "text", "required": True},
                        "role": {
                            "type": "enum",
                            "options": ["admin", "user"],
                            "default": "user",
                        },
                    },
                }
            },
        },
        "blog": {
            "version": "1.0",
            "name": name,
            "collections": {
                "user": {
                    "auth": True,
                    "timestamps": True,
                    "fields": {
                        "email": {"type": "email", "required": True, "unique": True},
                        "name": {"type": "text", "required": True},
                        "bio": {"type": "text"},
                        "avatar": {"type": "file", "accept": ["image/*"]},
                        "role": {
                            "type": "enum",
                            "options": ["admin", "author", "user"],
                            "default": "user",
                        },
                    },
                },
                "post": {
                    "timestamps": True,
                    "fields": {
                        "title": {"type": "text", "required": True, "maxLength": 200},
                        "slug": {"type": "text", "unique": True},
                        "content": {"type": "richtext"},
                        "excerpt": {"type": "text", "maxLength": 500},
                        "author": {
                            "type": "relation",
                            "target": "user",
                            "relation": "many-to-one",
                            "required": True,
                        },
                        "status": {
                            "type": "enum",
                            "options": ["draft", "published", "archived"],
                            "default": "draft",
                        },
                        "publishedAt": {"type": "datetime", "nullable": True},
                    },
                },
                "category": {
                    "timestamps": True,
                    "fields": {
                        "name": {"type": "text", "required": True},
                        "slug": {"type": "text", "unique": True},
                        "description": {"type": "text"},
                    },
                },
                "comment": {
                    "timestamps": True,
                    "fields": {
                        "content": {"type": "text", "required": True},
                        "author": {
                            "type": "relation",
                            "target": "user",
                            "relation": "many-to-one",
                            "required": True,
                        },
                        "post": {
                            "type": "relation",
                            "target": "post",
                            "relation": "many-to-one",
                            "required": True,
                        },
                    },
                },
            },
        },
        "saas": {
            "version": "1.0",
            "name": name,
            "collections": {
                "user": {
                    "auth": True,
                    "timestamps": True,
                    "fields": {
                        "email": {"type": "email", "required": True, "unique": True},
                        "name": {"type": "text", "required": True},
                        "role": {
                            "type": "enum",
                            "options": ["admin", "member"],
                            "default": "member",
                        },
                        "organization": {
                            "type": "relation",
                            "target": "organization",
                            "relation": "many-to-one",
                        },
                    },
                },
                "organization": {
                    "timestamps": True,
                    "fields": {
                        "name": {"type": "text", "required": True},
                        "slug": {"type": "text", "unique": True},
                        "plan": {
                            "type": "enum",
                            "options": ["free", "pro", "enterprise"],
                            "default": "free",
                        },
                        "stripeCustomerId": {"type": "text"},
                    },
                },
                "project": {
                    "timestamps": True,
                    "fields": {
                        "name": {"type": "text", "required": True},
                        "description": {"type": "text"},
                        "organization": {
                            "type": "relation",
                            "target": "organization",
                            "relation": "many-to-one",
                            "required": True,
                        },
                        "status": {
                            "type": "enum",
                            "options": ["active", "archived"],
                            "default": "active",
                        },
                    },
                },
            },
        },
        "ecommerce": {
            "version": "1.0",
            "name": name,
            "collections": {
                "user": {
                    "auth": True,
                    "timestamps": True,
                    "fields": {
                        "email": {"type": "email", "required": True, "unique": True},
                        "name": {"type": "text", "required": True},
                        "role": {
                            "type": "enum",
                            "options": ["admin", "customer"],
                            "default": "customer",
                        },
                    },
                },
                "product": {
                    "timestamps": True,
                    "fields": {
                        "name": {"type": "text", "required": True},
                        "slug": {"type": "text", "unique": True},
                        "description": {"type": "richtext"},
                        "price": {"type": "integer", "required": True, "min": 0},
                        "image": {"type": "file", "accept": ["image/*"]},
                        "category": {
                            "type": "relation",
                            "target": "category",
                            "relation": "many-to-one",
                        },
                        "stock": {"type": "integer", "default": 0, "min": 0},
                        "status": {
                            "type": "enum",
                            "options": ["draft", "active", "archived"],
                            "default": "draft",
                        },
                    },
                },
                "category": {
                    "timestamps": True,
                    "fields": {
                        "name": {"type": "text", "required": True},
                        "slug": {"type": "text", "unique": True},
                    },
                },
                "order": {
                    "timestamps": True,
                    "fields": {
                        "user": {
                            "type": "relation",
                            "target": "user",
                            "relation": "many-to-one",
                            "required": True,
                        },
                        "status": {
                            "type": "enum",
                            "options": ["pending", "paid", "shipped", "delivered", "cancelled"],
                            "default": "pending",
                        },
                        "total": {"type": "integer", "required": True},
                        "shippingAddress": {"type": "json"},
                    },
                },
            },
        },
    }

    if template not in templates:
        console.print(f"[red]Error:[/red] Unknown template '{template}'")
        console.print(f"Available: {', '.join(templates.keys())}")
        raise typer.Exit(1)

    import json

    schema_content = templates[template]

    # Write schema.json
    schema_file = project_dir / "schema.json"
    with open(schema_file, "w") as f:
        json.dump(schema_content, f, indent=2)

    # Write .env
    env_file = project_dir / ".env"
    jwt_secret = secrets.token_urlsafe(32)
    env_content = f"""# Formabase Configuration
DATABASE_URL=sqlite:///./app.db
JWT_SECRET={jwt_secret}
DEBUG=true
"""
    with open(env_file, "w") as f:
        f.write(env_content)

    # Write .gitignore
    gitignore_file = project_dir / ".gitignore"
    gitignore_content = """# Database
*.db
*.db-journal

# Environment
.env
.env.local

# Python
__pycache__/
*.pyc
.venv/
venv/

# Uploads
uploads/

# IDE
.idea/
.vscode/
"""
    with open(gitignore_file, "w") as f:
        f.write(gitignore_content)

    # Success message
    console.print(f"\n[bold green]✓ Project created:[/bold green] {project_dir}\n")
    console.print("Files created:")
    console.print(f"  [cyan]schema.json[/cyan] - {template} template with {len(schema_content['collections'])} collections")
    console.print(f"  [cyan].env[/cyan]         - Environment variables")
    console.print(f"  [cyan].gitignore[/cyan]   - Git ignore rules")
    console.print()
    console.print("[bold]Next steps:[/bold]")
    console.print(f"  cd {project_dir.name}")
    console.print("  formabase dev")
    console.print()


if __name__ == "__main__":
    app()
