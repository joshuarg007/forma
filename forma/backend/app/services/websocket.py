"""WebSocket Manager for Real-time Collaboration"""
import json
import logging
from typing import Dict, List, Set, Optional
from dataclasses import dataclass, field
from datetime import datetime
import asyncio

from fastapi import WebSocket, WebSocketDisconnect
from pydantic import BaseModel

logger = logging.getLogger(__name__)


@dataclass
class UserSession:
    """Represents a connected user session."""
    user_id: str
    username: str
    websocket: WebSocket
    project_id: str
    connected_at: datetime = field(default_factory=datetime.utcnow)
    cursor_position: Optional[dict] = None


class WebSocketMessage(BaseModel):
    """WebSocket message format."""
    type: str  # "cursor_move", "component_update", "component_add", "component_delete", "chat", "presence"
    payload: dict
    sender_id: Optional[str] = None
    timestamp: Optional[str] = None


class CollaborationManager:
    """Manage WebSocket connections for real-time collaboration."""

    def __init__(self):
        # project_id -> set of UserSession
        self.project_connections: Dict[str, Dict[str, UserSession]] = {}
        # Lock for thread-safe operations
        self._lock = asyncio.Lock()

    async def connect(
        self,
        websocket: WebSocket,
        project_id: str,
        user_id: str,
        username: str
    ) -> UserSession:
        """Connect a user to a project room."""
        await websocket.accept()

        session = UserSession(
            user_id=user_id,
            username=username,
            websocket=websocket,
            project_id=project_id
        )

        async with self._lock:
            if project_id not in self.project_connections:
                self.project_connections[project_id] = {}
            self.project_connections[project_id][user_id] = session

        # Broadcast presence to others
        await self.broadcast_to_project(
            project_id,
            WebSocketMessage(
                type="presence",
                payload={
                    "action": "join",
                    "user_id": user_id,
                    "username": username,
                    "users": await self.get_project_users(project_id)
                },
                sender_id=user_id
            ),
            exclude_user=user_id
        )

        # Send current users to the new connection
        await self.send_to_user(
            session,
            WebSocketMessage(
                type="presence",
                payload={
                    "action": "init",
                    "users": await self.get_project_users(project_id)
                }
            )
        )

        logger.info(f"User {username} connected to project {project_id}")
        return session

    async def disconnect(self, session: UserSession):
        """Disconnect a user from a project room."""
        project_id = session.project_id
        user_id = session.user_id

        async with self._lock:
            if project_id in self.project_connections:
                self.project_connections[project_id].pop(user_id, None)
                if not self.project_connections[project_id]:
                    del self.project_connections[project_id]

        # Broadcast departure to others
        await self.broadcast_to_project(
            project_id,
            WebSocketMessage(
                type="presence",
                payload={
                    "action": "leave",
                    "user_id": user_id,
                    "username": session.username,
                    "users": await self.get_project_users(project_id)
                },
                sender_id=user_id
            )
        )

        logger.info(f"User {session.username} disconnected from project {project_id}")

    async def get_project_users(self, project_id: str) -> List[dict]:
        """Get all users connected to a project."""
        async with self._lock:
            if project_id not in self.project_connections:
                return []
            return [
                {
                    "user_id": session.user_id,
                    "username": session.username,
                    "cursor_position": session.cursor_position
                }
                for session in self.project_connections[project_id].values()
            ]

    async def send_to_user(self, session: UserSession, message: WebSocketMessage):
        """Send a message to a specific user."""
        try:
            message.timestamp = datetime.utcnow().isoformat()
            await session.websocket.send_json(message.model_dump())
        except Exception as e:
            logger.error(f"Error sending to user {session.user_id}: {e}")

    async def broadcast_to_project(
        self,
        project_id: str,
        message: WebSocketMessage,
        exclude_user: Optional[str] = None
    ):
        """Broadcast a message to all users in a project."""
        async with self._lock:
            if project_id not in self.project_connections:
                return

            sessions = list(self.project_connections[project_id].values())

        message.timestamp = datetime.utcnow().isoformat()
        message_data = message.model_dump()

        for session in sessions:
            if exclude_user and session.user_id == exclude_user:
                continue
            try:
                await session.websocket.send_json(message_data)
            except Exception as e:
                logger.error(f"Error broadcasting to user {session.user_id}: {e}")

    async def handle_message(self, session: UserSession, data: dict):
        """Handle incoming WebSocket message."""
        try:
            message = WebSocketMessage(**data)
            message.sender_id = session.user_id

            if message.type == "cursor_move":
                # Update cursor position and broadcast
                session.cursor_position = message.payload.get("position")
                await self.broadcast_to_project(
                    session.project_id,
                    message,
                    exclude_user=session.user_id
                )

            elif message.type == "component_update":
                # Broadcast component update to all other users
                await self.broadcast_to_project(
                    session.project_id,
                    message,
                    exclude_user=session.user_id
                )

            elif message.type == "component_add":
                # Broadcast new component to all other users
                await self.broadcast_to_project(
                    session.project_id,
                    message,
                    exclude_user=session.user_id
                )

            elif message.type == "component_delete":
                # Broadcast component deletion to all other users
                await self.broadcast_to_project(
                    session.project_id,
                    message,
                    exclude_user=session.user_id
                )

            elif message.type == "component_reorder":
                # Broadcast component reordering
                await self.broadcast_to_project(
                    session.project_id,
                    message,
                    exclude_user=session.user_id
                )

            elif message.type == "chat":
                # Broadcast chat message to everyone (including sender)
                message.payload["username"] = session.username
                await self.broadcast_to_project(session.project_id, message)

            elif message.type == "ping":
                # Respond to ping
                await self.send_to_user(
                    session,
                    WebSocketMessage(type="pong", payload={})
                )

            else:
                logger.warning(f"Unknown message type: {message.type}")

        except Exception as e:
            logger.error(f"Error handling message: {e}")
            await self.send_to_user(
                session,
                WebSocketMessage(
                    type="error",
                    payload={"message": "Failed to process message"}
                )
            )


# Singleton instance
collaboration_manager = CollaborationManager()
