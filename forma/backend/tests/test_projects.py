"""Tests for projects API."""
import pytest
from fastapi.testclient import TestClient


class TestProjects:
    """Test project endpoints."""

    def test_create_project(self, client: TestClient, auth_headers):
        """Test creating a new project."""
        response = client.post(
            "/api/projects",
            json={
                "name": "My New Project",
                "description": "A great project",
            },
            headers=auth_headers,
        )
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "My New Project"
        assert data["description"] == "A great project"
        assert "id" in data

    def test_create_project_no_auth(self, client: TestClient):
        """Test creating project without authentication."""
        response = client.post(
            "/api/projects",
            json={"name": "Test Project"},
        )
        assert response.status_code == 401

    def test_list_projects(self, client: TestClient, auth_headers, test_project):
        """Test listing user's projects."""
        response = client.get("/api/projects", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "projects" in data
        assert len(data["projects"]) >= 1
        assert any(p["id"] == str(test_project.id) for p in data["projects"])

    def test_get_project(self, client: TestClient, auth_headers, test_project):
        """Test getting a specific project."""
        response = client.get(
            f"/api/projects/{test_project.id}",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == str(test_project.id)
        assert data["name"] == test_project.name

    def test_get_project_not_found(self, client: TestClient, auth_headers):
        """Test getting non-existent project."""
        from uuid import uuid4

        response = client.get(
            f"/api/projects/{uuid4()}",
            headers=auth_headers,
        )
        assert response.status_code == 404

    def test_get_project_not_owner(
        self, client: TestClient, test_project, second_user_token
    ):
        """Test getting project owned by another user."""
        response = client.get(
            f"/api/projects/{test_project.id}",
            headers={"Authorization": f"Bearer {second_user_token}"},
        )
        assert response.status_code == 404

    def test_update_project(self, client: TestClient, auth_headers, test_project):
        """Test updating a project."""
        response = client.put(
            f"/api/projects/{test_project.id}",
            json={
                "name": "Updated Name",
                "description": "Updated description",
            },
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Updated Name"
        assert data["description"] == "Updated description"

    def test_delete_project(self, client: TestClient, auth_headers, test_project):
        """Test deleting a project."""
        response = client.delete(
            f"/api/projects/{test_project.id}",
            headers=auth_headers,
        )
        assert response.status_code == 204

        # Verify it's deleted
        response = client.get(
            f"/api/projects/{test_project.id}",
            headers=auth_headers,
        )
        assert response.status_code == 404


class TestComponents:
    """Test component endpoints."""

    def test_create_component(self, client: TestClient, auth_headers, test_project):
        """Test creating a component."""
        response = client.post(
            f"/api/projects/{test_project.id}/components",
            json={
                "name": "HeroSection",
                "intent": "A hero section with title and CTA",
                "code": "export default function HeroSection() { return <div>Hero</div> }",
            },
            headers=auth_headers,
        )
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "HeroSection"
        assert "id" in data

    def test_list_components(self, client: TestClient, auth_headers, test_project):
        """Test listing components."""
        # Create a component first
        client.post(
            f"/api/projects/{test_project.id}/components",
            json={
                "name": "TestComponent",
                "code": "export default function Test() { return <div>Test</div> }",
            },
            headers=auth_headers,
        )

        response = client.get(
            f"/api/projects/{test_project.id}/components",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    def test_update_component(self, client: TestClient, auth_headers, test_project):
        """Test updating a component."""
        # Create a component
        create_response = client.post(
            f"/api/projects/{test_project.id}/components",
            json={
                "name": "OldName",
                "code": "export default function Old() { return <div>Old</div> }",
            },
            headers=auth_headers,
        )
        component_id = create_response.json()["id"]

        # Update it
        response = client.put(
            f"/api/projects/{test_project.id}/components/{component_id}",
            json={
                "name": "NewName",
                "code": "export default function New() { return <div>New</div> }",
            },
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "NewName"

    def test_delete_component(self, client: TestClient, auth_headers, test_project):
        """Test deleting a component."""
        # Create a component
        create_response = client.post(
            f"/api/projects/{test_project.id}/components",
            json={
                "name": "ToDelete",
                "code": "export default function ToDelete() { return null }",
            },
            headers=auth_headers,
        )
        component_id = create_response.json()["id"]

        # Delete it
        response = client.delete(
            f"/api/projects/{test_project.id}/components/{component_id}",
            headers=auth_headers,
        )
        assert response.status_code == 204
