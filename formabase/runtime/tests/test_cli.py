"""Tests for CLI commands."""

import json
from pathlib import Path

import pytest
from typer.testing import CliRunner

from forma_runtime.cli import app


runner = CliRunner()


class TestCLIVersion:
    """Tests for version command."""

    def test_version(self):
        """Test version command."""
        result = runner.invoke(app, ["version"])

        assert result.exit_code == 0
        assert "Forma Runtime" in result.output
        assert "Axion Deep Labs" in result.output


class TestCLICheck:
    """Tests for check command."""

    def test_check_valid_schema(self, blog_schema_path):
        """Test checking a valid schema."""
        result = runner.invoke(app, ["check", "-s", str(blog_schema_path)])

        assert result.exit_code == 0
        assert "Schema is valid" in result.output

    def test_check_missing_file(self, tmp_path):
        """Test checking a missing file."""
        result = runner.invoke(app, ["check", "-s", str(tmp_path / "missing.json")])

        assert result.exit_code == 1
        assert "not found" in result.output

    def test_check_invalid_json(self, tmp_path):
        """Test checking invalid JSON."""
        bad_file = tmp_path / "bad.json"
        bad_file.write_text("{ invalid }")

        result = runner.invoke(app, ["check", "-s", str(bad_file)])

        assert result.exit_code == 1


class TestCLIInfo:
    """Tests for info command."""

    def test_info_shows_schema_details(self, blog_schema_path):
        """Test info command shows schema details."""
        result = runner.invoke(app, ["info", "-s", str(blog_schema_path)])

        assert result.exit_code == 0
        assert "test-blog" in result.output
        assert "user" in result.output
        assert "post" in result.output
        assert "category" in result.output


class TestCLIInit:
    """Tests for init command."""

    def test_init_blank_template(self, tmp_path):
        """Test initializing with blank template."""
        result = runner.invoke(app, [
            "init", "my-project",
            "--template", "blank",
            "--dir", str(tmp_path)
        ])

        assert result.exit_code == 0
        assert "Project created" in result.output

        # Check files created
        project_dir = tmp_path / "my-project"
        assert (project_dir / "schema.json").exists()
        assert (project_dir / ".env").exists()
        assert (project_dir / ".gitignore").exists()

    def test_init_blog_template(self, tmp_path):
        """Test initializing with blog template."""
        result = runner.invoke(app, [
            "init", "my-blog",
            "--template", "blog",
            "--dir", str(tmp_path)
        ])

        assert result.exit_code == 0

        # Check schema has blog collections
        schema_path = tmp_path / "my-blog" / "schema.json"
        schema = json.loads(schema_path.read_text())

        assert "user" in schema["collections"]
        assert "post" in schema["collections"]
        assert "comment" in schema["collections"]
        assert "category" in schema["collections"]

    def test_init_saas_template(self, tmp_path):
        """Test initializing with saas template."""
        result = runner.invoke(app, [
            "init", "my-saas",
            "--template", "saas",
            "--dir", str(tmp_path)
        ])

        assert result.exit_code == 0

        schema_path = tmp_path / "my-saas" / "schema.json"
        schema = json.loads(schema_path.read_text())

        assert "user" in schema["collections"]
        assert "organization" in schema["collections"]
        assert "project" in schema["collections"]

    def test_init_ecommerce_template(self, tmp_path):
        """Test initializing with ecommerce template."""
        result = runner.invoke(app, [
            "init", "my-shop",
            "--template", "ecommerce",
            "--dir", str(tmp_path)
        ])

        assert result.exit_code == 0

        schema_path = tmp_path / "my-shop" / "schema.json"
        schema = json.loads(schema_path.read_text())

        assert "user" in schema["collections"]
        assert "product" in schema["collections"]
        assert "category" in schema["collections"]
        assert "order" in schema["collections"]
        assert "order_item" in schema["collections"]

    def test_init_invalid_template(self, tmp_path):
        """Test initializing with invalid template."""
        result = runner.invoke(app, [
            "init", "test",
            "--template", "invalid",
            "--dir", str(tmp_path)
        ])

        assert result.exit_code == 1
        assert "Unknown template" in result.output

    def test_init_generates_jwt_secret(self, tmp_path):
        """Test that init generates a JWT secret in .env."""
        runner.invoke(app, [
            "init", "test-project",
            "--dir", str(tmp_path)
        ])

        env_path = tmp_path / "test-project" / ".env"
        env_content = env_path.read_text()

        assert "JWT_SECRET=" in env_content
        # JWT secret should be at least 32 chars
        jwt_line = [l for l in env_content.split("\n") if l.startswith("JWT_SECRET=")][0]
        jwt_secret = jwt_line.split("=")[1]
        assert len(jwt_secret) >= 32


class TestCLIMigrate:
    """Tests for migrate command."""

    def test_migrate_dry_run(self, blog_schema_path):
        """Test migrate with dry run."""
        result = runner.invoke(app, [
            "migrate",
            "-s", str(blog_schema_path),
            "--dry-run"
        ])

        assert result.exit_code == 0
        assert "Dry run" in result.output
        assert "Generated Models" in result.output

    def test_migrate_shows_models(self, blog_schema_path):
        """Test migrate shows generated models."""
        result = runner.invoke(app, [
            "migrate",
            "-s", str(blog_schema_path),
            "--dry-run"
        ])

        assert "User" in result.output
        assert "Post" in result.output
        assert "Category" in result.output


class TestCLIHelp:
    """Tests for help output."""

    def test_main_help(self):
        """Test main help output."""
        result = runner.invoke(app, ["--help"])

        assert result.exit_code == 0
        assert "serve" in result.output
        assert "dev" in result.output
        assert "migrate" in result.output
        assert "validate" in result.output
        assert "init" in result.output
        assert "check" in result.output
        assert "info" in result.output

    def test_serve_help(self):
        """Test serve command help."""
        result = runner.invoke(app, ["serve", "--help"])

        assert result.exit_code == 0
        assert "--schema" in result.output
        assert "--port" in result.output
        assert "--host" in result.output

    def test_init_help(self):
        """Test init command help."""
        result = runner.invoke(app, ["init", "--help"])

        assert result.exit_code == 0
        assert "--template" in result.output
        assert "blank" in result.output
        assert "blog" in result.output
        assert "saas" in result.output
        assert "ecommerce" in result.output
