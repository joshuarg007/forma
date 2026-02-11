"""WebSocket API for Real-time Collaboration"""
import json
import logging
from uuid import UUID

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import User, Project, ProjectMember
from app.core.security import decode_token
from app.services.websocket import collaboration_manager, WebSocketMessage

logger = logging.getLogger(__name__)

router = APIRouter(tags=["websocket"])


async def get_websocket_user(
    websocket: WebSocket,
    token: str = Query(...),
    db: Session = Depends(get_db)
) -> User:
    """Authenticate WebSocket connection using token query param."""
    try:
        payload = decode_token(token)
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")

        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")

        return user
    except Exception as e:
        logger.error(f"WebSocket auth failed: {e}")
        raise HTTPException(status_code=401, detail="Authentication failed")


async def verify_project_access(
    project_id: str,
    user: User,
    db: Session
) -> bool:
    """Verify user has access to the project."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        return False

    # Owner has access
    if str(project.user_id) == str(user.id):
        return True

    # Check membership
    member = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == user.id
    ).first()

    return member is not None


@router.websocket("/ws/project/{project_id}")
async def project_websocket(
    websocket: WebSocket,
    project_id: str,
    token: str = Query(...)
):
    """WebSocket endpoint for real-time project collaboration."""
    # Get database session
    from app.db.database import SessionLocal
    db = SessionLocal()

    try:
        # Authenticate user
        try:
            payload = decode_token(token)
            user_id = payload.get("sub")
            if not user_id:
                await websocket.close(code=4001, reason="Invalid token")
                return

            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                await websocket.close(code=4001, reason="User not found")
                return
        except Exception as e:
            logger.error(f"WebSocket auth failed: {e}")
            await websocket.close(code=4001, reason="Authentication failed")
            return

        # Verify project access
        if not await verify_project_access(project_id, user, db):
            await websocket.close(code=4003, reason="Access denied")
            return

        # Connect to collaboration room
        session = await collaboration_manager.connect(
            websocket=websocket,
            project_id=project_id,
            user_id=str(user.id),
            username=user.name or user.email
        )

        try:
            while True:
                # Receive message
                data = await websocket.receive_json()
                await collaboration_manager.handle_message(session, data)

        except WebSocketDisconnect:
            await collaboration_manager.disconnect(session)
        except Exception as e:
            logger.error(f"WebSocket error: {e}")
            await collaboration_manager.disconnect(session)

    finally:
        db.close()


@router.get("/ws/project/{project_id}/users")
async def get_project_collaborators(
    project_id: str,
    db: Session = Depends(get_db)
):
    """Get list of users currently connected to a project."""
    users = await collaboration_manager.get_project_users(project_id)
    return {"users": users, "count": len(users)}


@router.get("/ws/project/{project_id}/presence")
async def get_project_presence(
    project_id: str,
    page_id: str = None,
    db: Session = Depends(get_db)
):
    """Get detailed presence info for a project, optionally filtered by page."""
    users = await collaboration_manager.get_project_users(project_id)

    if page_id:
        users = [u for u in users if u.get("current_page_id") == page_id]

    return {
        "users": users,
        "count": len(users),
        "page_id": page_id,
        "selections": {
            u["selected_component_id"]: {
                "user_id": u["user_id"],
                "username": u["username"],
                "color": u["color"]
            }
            for u in users
            if u.get("selected_component_id")
        }
    }
