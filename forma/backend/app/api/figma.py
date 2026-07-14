"""Figma Integration API for design import"""
import json
import logging
import re
import httpx
from uuid import UUID, uuid4
from typing import List, Optional, Dict, Any
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from app.db.database import get_db
from app.db.models import User, Project, FigmaImport, FigmaImportStatus
from app.core.security import get_current_user
from app.core.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/projects/{project_id}/figma", tags=["figma"])


# Pydantic models
class FigmaConnectRequest(BaseModel):
    """Request to connect Figma account"""
    access_token: str


class FigmaFileImportRequest(BaseModel):
    """Request to import a Figma file"""
    file_key: str
    node_ids: Optional[List[str]] = None  # Specific frames to import
    import_assets: bool = True
    import_styles: bool = True
    import_components: bool = True
    target_page_id: Optional[str] = None


class FigmaNodeSelection(BaseModel):
    """Selection of nodes from Figma file"""
    node_id: str
    name: str
    type: str
    selected: bool = True


class FigmaFilePreviewResponse(BaseModel):
    """Preview of Figma file structure"""
    file_key: str
    name: str
    last_modified: str
    version: str
    pages: List[Dict[str, Any]]
    components: Dict[str, Any]
    styles: Dict[str, Any]


class FigmaImportResponse(BaseModel):
    """Response for import status"""
    import_id: str
    status: str
    progress: int
    message: Optional[str] = None
    result: Optional[Dict[str, Any]] = None


# Figma API client
class FigmaClient:
    """Client for Figma API"""

    BASE_URL = "https://api.figma.com/v1"

    def __init__(self, access_token: str):
        self.access_token = access_token
        self.headers = {"X-Figma-Token": access_token}

    async def get_file(self, file_key: str, node_ids: Optional[List[str]] = None) -> Dict:
        """Get Figma file data"""
        async with httpx.AsyncClient() as client:
            params = {}
            if node_ids:
                params["ids"] = ",".join(node_ids)

            response = await client.get(
                f"{self.BASE_URL}/files/{file_key}",
                headers=self.headers,
                params=params,
                timeout=60.0
            )

            if response.status_code == 403:
                raise HTTPException(status_code=403, detail="Invalid Figma token or no access to file")
            elif response.status_code == 404:
                raise HTTPException(status_code=404, detail="Figma file not found")

            response.raise_for_status()
            return response.json()

    async def get_file_nodes(self, file_key: str, node_ids: List[str]) -> Dict:
        """Get specific nodes from Figma file"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.BASE_URL}/files/{file_key}/nodes",
                headers=self.headers,
                params={"ids": ",".join(node_ids)},
                timeout=60.0
            )
            response.raise_for_status()
            return response.json()

    async def get_images(
        self,
        file_key: str,
        node_ids: List[str],
        format: str = "png",
        scale: float = 2.0
    ) -> Dict:
        """Export nodes as images"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.BASE_URL}/images/{file_key}",
                headers=self.headers,
                params={
                    "ids": ",".join(node_ids),
                    "format": format,
                    "scale": scale
                },
                timeout=120.0
            )
            response.raise_for_status()
            return response.json()

    async def get_file_styles(self, file_key: str) -> Dict:
        """Get styles from Figma file"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.BASE_URL}/files/{file_key}/styles",
                headers=self.headers,
                timeout=30.0
            )
            response.raise_for_status()
            return response.json()

    async def get_file_components(self, file_key: str) -> Dict:
        """Get components from Figma file"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.BASE_URL}/files/{file_key}/components",
                headers=self.headers,
                timeout=30.0
            )
            response.raise_for_status()
            return response.json()

    async def get_me(self) -> Dict:
        """Get current user info"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.BASE_URL}/me",
                headers=self.headers,
                timeout=10.0
            )
            response.raise_for_status()
            return response.json()


# Figma to React converter
class FigmaToReactConverter:
    """Convert Figma nodes to React components"""

    def __init__(self):
        self.components = []
        self.styles = {}
        self.assets = []

    def convert_node(self, node: Dict, parent_styles: Dict = None) -> Dict:
        """Convert a Figma node to Forma component format"""
        node_type = node.get("type", "")

        converter = {
            "FRAME": self._convert_frame,
            "GROUP": self._convert_group,
            "RECTANGLE": self._convert_rectangle,
            "TEXT": self._convert_text,
            "VECTOR": self._convert_vector,
            "ELLIPSE": self._convert_ellipse,
            "LINE": self._convert_line,
            "COMPONENT": self._convert_component,
            "INSTANCE": self._convert_instance,
            "BOOLEAN_OPERATION": self._convert_boolean,
        }.get(node_type, self._convert_generic)

        return converter(node, parent_styles)

    def _get_base_styles(self, node: Dict) -> Dict:
        """Extract common styles from node"""
        styles = {}

        # Position and size
        if "absoluteBoundingBox" in node:
            box = node["absoluteBoundingBox"]
            styles["width"] = f"{box['width']}px"
            styles["height"] = f"{box['height']}px"

        # Background fills
        if "fills" in node:
            for fill in node.get("fills", []):
                if fill.get("type") == "SOLID" and fill.get("visible", True):
                    color = fill.get("color", {})
                    opacity = fill.get("opacity", 1)
                    styles["backgroundColor"] = self._rgba_to_css(color, opacity)
                    break
                elif fill.get("type") == "GRADIENT_LINEAR":
                    styles["background"] = self._gradient_to_css(fill)

        # Border/stroke
        if "strokes" in node and node.get("strokes"):
            for stroke in node["strokes"]:
                if stroke.get("type") == "SOLID" and stroke.get("visible", True):
                    color = stroke.get("color", {})
                    styles["borderColor"] = self._rgba_to_css(color)
                    break

        if "strokeWeight" in node:
            styles["borderWidth"] = f"{node['strokeWeight']}px"
            styles["borderStyle"] = "solid"

        # Border radius
        if "cornerRadius" in node:
            styles["borderRadius"] = f"{node['cornerRadius']}px"
        elif "rectangleCornerRadii" in node:
            radii = node["rectangleCornerRadii"]
            styles["borderRadius"] = f"{radii[0]}px {radii[1]}px {radii[2]}px {radii[3]}px"

        # Effects (shadows)
        if "effects" in node:
            for effect in node.get("effects", []):
                if effect.get("type") == "DROP_SHADOW" and effect.get("visible", True):
                    color = effect.get("color", {})
                    offset = effect.get("offset", {"x": 0, "y": 0})
                    radius = effect.get("radius", 0)
                    styles["boxShadow"] = f"{offset['x']}px {offset['y']}px {radius}px {self._rgba_to_css(color)}"
                    break

        # Opacity
        if "opacity" in node and node["opacity"] < 1:
            styles["opacity"] = node["opacity"]

        return styles

    def _convert_frame(self, node: Dict, parent_styles: Dict = None) -> Dict:
        """Convert FRAME to div with flex layout"""
        styles = self._get_base_styles(node)

        # Layout mode
        if node.get("layoutMode") == "HORIZONTAL":
            styles["display"] = "flex"
            styles["flexDirection"] = "row"
        elif node.get("layoutMode") == "VERTICAL":
            styles["display"] = "flex"
            styles["flexDirection"] = "column"

        # Gap
        if "itemSpacing" in node:
            styles["gap"] = f"{node['itemSpacing']}px"

        # Padding
        if "paddingLeft" in node:
            styles["paddingLeft"] = f"{node['paddingLeft']}px"
        if "paddingRight" in node:
            styles["paddingRight"] = f"{node['paddingRight']}px"
        if "paddingTop" in node:
            styles["paddingTop"] = f"{node['paddingTop']}px"
        if "paddingBottom" in node:
            styles["paddingBottom"] = f"{node['paddingBottom']}px"

        # Alignment
        align_map = {
            "MIN": "flex-start",
            "CENTER": "center",
            "MAX": "flex-end",
            "SPACE_BETWEEN": "space-between",
        }

        if "primaryAxisAlignItems" in node:
            styles["justifyContent"] = align_map.get(node["primaryAxisAlignItems"], "flex-start")
        if "counterAxisAlignItems" in node:
            styles["alignItems"] = align_map.get(node["counterAxisAlignItems"], "flex-start")

        # Convert children
        children = []
        for child in node.get("children", []):
            children.append(self.convert_node(child, styles))

        return {
            "id": str(uuid4()),
            "type": "div",
            "figmaId": node.get("id"),
            "name": node.get("name", "Frame"),
            "props": {
                "className": self._name_to_class(node.get("name", "")),
            },
            "styles": styles,
            "children": children,
        }

    def _convert_group(self, node: Dict, parent_styles: Dict = None) -> Dict:
        """Convert GROUP to div"""
        styles = self._get_base_styles(node)
        styles["position"] = "relative"

        children = []
        for child in node.get("children", []):
            children.append(self.convert_node(child, styles))

        return {
            "id": str(uuid4()),
            "type": "div",
            "figmaId": node.get("id"),
            "name": node.get("name", "Group"),
            "props": {},
            "styles": styles,
            "children": children,
        }

    def _convert_rectangle(self, node: Dict, parent_styles: Dict = None) -> Dict:
        """Convert RECTANGLE to div"""
        styles = self._get_base_styles(node)

        return {
            "id": str(uuid4()),
            "type": "div",
            "figmaId": node.get("id"),
            "name": node.get("name", "Rectangle"),
            "props": {},
            "styles": styles,
            "children": [],
        }

    def _convert_text(self, node: Dict, parent_styles: Dict = None) -> Dict:
        """Convert TEXT to span/p"""
        styles = self._get_base_styles(node)

        # Typography
        if "style" in node:
            text_style = node["style"]

            if "fontFamily" in text_style:
                styles["fontFamily"] = text_style["fontFamily"]
            if "fontSize" in text_style:
                styles["fontSize"] = f"{text_style['fontSize']}px"
            if "fontWeight" in text_style:
                styles["fontWeight"] = text_style["fontWeight"]
            if "letterSpacing" in text_style:
                styles["letterSpacing"] = f"{text_style['letterSpacing']}px"
            if "lineHeightPx" in text_style:
                styles["lineHeight"] = f"{text_style['lineHeightPx']}px"
            if "textAlignHorizontal" in text_style:
                styles["textAlign"] = text_style["textAlignHorizontal"].lower()
            if "textDecoration" in text_style:
                styles["textDecoration"] = text_style["textDecoration"].lower()

        # Text color from fills
        if "fills" in node:
            for fill in node.get("fills", []):
                if fill.get("type") == "SOLID" and fill.get("visible", True):
                    color = fill.get("color", {})
                    styles["color"] = self._rgba_to_css(color)
                    break

        return {
            "id": str(uuid4()),
            "type": "text",
            "figmaId": node.get("id"),
            "name": node.get("name", "Text"),
            "props": {
                "text": node.get("characters", ""),
            },
            "styles": styles,
            "children": [],
        }

    def _convert_vector(self, node: Dict, parent_styles: Dict = None) -> Dict:
        """Convert VECTOR to img (will need asset export)"""
        styles = self._get_base_styles(node)

        self.assets.append({
            "figmaId": node.get("id"),
            "name": node.get("name", "Vector"),
            "type": "vector",
        })

        return {
            "id": str(uuid4()),
            "type": "img",
            "figmaId": node.get("id"),
            "name": node.get("name", "Vector"),
            "props": {
                "src": f"{{assets.{self._name_to_var(node.get('name', 'vector'))}}}",
                "alt": node.get("name", ""),
            },
            "styles": styles,
            "children": [],
            "needsAssetExport": True,
        }

    def _convert_ellipse(self, node: Dict, parent_styles: Dict = None) -> Dict:
        """Convert ELLIPSE to div with border-radius"""
        styles = self._get_base_styles(node)
        styles["borderRadius"] = "50%"

        return {
            "id": str(uuid4()),
            "type": "div",
            "figmaId": node.get("id"),
            "name": node.get("name", "Ellipse"),
            "props": {},
            "styles": styles,
            "children": [],
        }

    def _convert_line(self, node: Dict, parent_styles: Dict = None) -> Dict:
        """Convert LINE to hr or div"""
        styles = self._get_base_styles(node)
        styles["height"] = "1px"

        return {
            "id": str(uuid4()),
            "type": "hr",
            "figmaId": node.get("id"),
            "name": node.get("name", "Line"),
            "props": {},
            "styles": styles,
            "children": [],
        }

    def _convert_component(self, node: Dict, parent_styles: Dict = None) -> Dict:
        """Convert COMPONENT (master component)"""
        # Same as frame
        return self._convert_frame(node, parent_styles)

    def _convert_instance(self, node: Dict, parent_styles: Dict = None) -> Dict:
        """Convert INSTANCE (component instance)"""
        # Same as frame but mark as instance
        result = self._convert_frame(node, parent_styles)
        result["isInstance"] = True
        result["componentId"] = node.get("componentId")
        return result

    def _convert_boolean(self, node: Dict, parent_styles: Dict = None) -> Dict:
        """Convert BOOLEAN_OPERATION to img (complex shape)"""
        return self._convert_vector(node, parent_styles)

    def _convert_generic(self, node: Dict, parent_styles: Dict = None) -> Dict:
        """Generic converter for unknown types"""
        styles = self._get_base_styles(node)

        children = []
        for child in node.get("children", []):
            children.append(self.convert_node(child, styles))

        return {
            "id": str(uuid4()),
            "type": "div",
            "figmaId": node.get("id"),
            "name": node.get("name", "Unknown"),
            "props": {},
            "styles": styles,
            "children": children,
        }

    def _rgba_to_css(self, color: Dict, opacity: float = 1.0) -> str:
        """Convert Figma color to CSS rgba"""
        r = int(color.get("r", 0) * 255)
        g = int(color.get("g", 0) * 255)
        b = int(color.get("b", 0) * 255)
        a = color.get("a", 1) * opacity

        if a == 1:
            return f"rgb({r}, {g}, {b})"
        return f"rgba({r}, {g}, {b}, {a:.2f})"

    def _gradient_to_css(self, fill: Dict) -> str:
        """Convert Figma gradient to CSS"""
        stops = fill.get("gradientStops", [])
        if not stops:
            return "transparent"

        colors = []
        for stop in stops:
            color = self._rgba_to_css(stop.get("color", {}))
            position = stop.get("position", 0) * 100
            colors.append(f"{color} {position:.0f}%")

        return f"linear-gradient(180deg, {', '.join(colors)})"

    def _name_to_class(self, name: str) -> str:
        """Convert Figma name to CSS class"""
        # Remove special chars, convert to kebab-case
        name = re.sub(r"[^\w\s-]", "", name)
        name = re.sub(r"\s+", "-", name)
        return name.lower()

    def _name_to_var(self, name: str) -> str:
        """Convert name to valid variable name"""
        name = re.sub(r"[^\w\s]", "", name)
        name = re.sub(r"\s+", "_", name)
        return name.lower()

    def extract_design_tokens(self, file_data: Dict) -> Dict:
        """Extract design tokens from Figma file"""
        tokens = {
            "colors": {},
            "typography": {},
            "spacing": {},
            "shadows": {},
        }

        # Extract from styles
        styles = file_data.get("styles", {})
        for style_id, style in styles.items():
            style_type = style.get("styleType")
            name = style.get("name", style_id)

            if style_type == "FILL":
                # Color token
                tokens["colors"][self._name_to_var(name)] = style
            elif style_type == "TEXT":
                # Typography token
                tokens["typography"][self._name_to_var(name)] = style
            elif style_type == "EFFECT":
                # Shadow token
                tokens["shadows"][self._name_to_var(name)] = style

        return tokens


# API Endpoints
@router.post("/connect")
async def connect_figma(
    project_id: UUID,
    request: FigmaConnectRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Connect Figma account to project"""
    # Verify project access
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Verify token
    client = FigmaClient(request.access_token)
    try:
        user_info = await client.get_me()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid Figma token: {str(e)}")

    # Store token (in production, encrypt this)
    project.figma_token = request.access_token
    project.figma_user_id = user_info.get("id")
    project.figma_user_email = user_info.get("email")
    db.commit()

    return {
        "connected": True,
        "user": {
            "id": user_info.get("id"),
            "email": user_info.get("email"),
            "handle": user_info.get("handle"),
            "img_url": user_info.get("img_url"),
        }
    }


@router.delete("/disconnect")
async def disconnect_figma(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Disconnect Figma account from project"""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    project.figma_token = None
    project.figma_user_id = None
    project.figma_user_email = None
    db.commit()

    return {"disconnected": True}


@router.get("/preview/{file_key}")
async def preview_figma_file(
    project_id: UUID,
    file_key: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Preview Figma file structure before import"""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()

    if not project or not project.figma_token:
        raise HTTPException(status_code=400, detail="Figma not connected")

    client = FigmaClient(project.figma_token)

    try:
        file_data = await client.get_file(file_key)
        components = await client.get_file_components(file_key)
        styles = await client.get_file_styles(file_key)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Extract page structure
    pages = []
    document = file_data.get("document", {})
    for page in document.get("children", []):
        page_info = {
            "id": page.get("id"),
            "name": page.get("name"),
            "frames": []
        }

        for child in page.get("children", []):
            if child.get("type") in ["FRAME", "COMPONENT"]:
                page_info["frames"].append({
                    "id": child.get("id"),
                    "name": child.get("name"),
                    "type": child.get("type"),
                    "width": child.get("absoluteBoundingBox", {}).get("width"),
                    "height": child.get("absoluteBoundingBox", {}).get("height"),
                })

        pages.append(page_info)

    return {
        "file_key": file_key,
        "name": file_data.get("name"),
        "last_modified": file_data.get("lastModified"),
        "version": file_data.get("version"),
        "pages": pages,
        "components": components.get("meta", {}).get("components", {}),
        "styles": styles.get("meta", {}).get("styles", {}),
    }


@router.post("/import")
async def import_figma_file(
    project_id: UUID,
    request: FigmaFileImportRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Start Figma file import"""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()

    if not project or not project.figma_token:
        raise HTTPException(status_code=400, detail="Figma not connected")

    # Create import record
    figma_import = FigmaImport(
        id=uuid4(),
        project_id=project_id,
        user_id=current_user.id,
        file_key=request.file_key,
        node_ids=request.node_ids,
        status=FigmaImportStatus.PENDING,
        import_assets=request.import_assets,
        import_styles=request.import_styles,
        import_components=request.import_components,
        target_page_id=request.target_page_id,
    )

    db.add(figma_import)
    db.commit()
    db.refresh(figma_import)

    # Start background import
    background_tasks.add_task(
        process_figma_import,
        str(figma_import.id),
        project.figma_token,
        request.file_key,
        request.node_ids,
        request.import_assets,
        request.import_styles,
    )

    return {
        "import_id": str(figma_import.id),
        "status": figma_import.status.value,
        "message": "Import started"
    }


@router.get("/import/{import_id}")
async def get_import_status(
    project_id: UUID,
    import_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get import status"""
    figma_import = db.query(FigmaImport).filter(
        FigmaImport.id == import_id,
        FigmaImport.project_id == project_id
    ).first()

    if not figma_import:
        raise HTTPException(status_code=404, detail="Import not found")

    return {
        "import_id": str(figma_import.id),
        "status": figma_import.status.value,
        "progress": figma_import.progress,
        "message": figma_import.message,
        "result": figma_import.result,
        "error": figma_import.error,
        "created_at": figma_import.created_at.isoformat(),
        "completed_at": figma_import.completed_at.isoformat() if figma_import.completed_at else None,
    }


@router.get("/imports")
async def list_imports(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all Figma imports for project"""
    imports = db.query(FigmaImport).filter(
        FigmaImport.project_id == project_id
    ).order_by(FigmaImport.created_at.desc()).limit(20).all()

    return {
        "imports": [
            {
                "import_id": str(i.id),
                "file_key": i.file_key,
                "status": i.status.value,
                "progress": i.progress,
                "created_at": i.created_at.isoformat(),
                "completed_at": i.completed_at.isoformat() if i.completed_at else None,
            }
            for i in imports
        ]
    }


# Background task for processing import
async def process_figma_import(
    import_id: str,
    figma_token: str,
    file_key: str,
    node_ids: Optional[List[str]],
    import_assets: bool,
    import_styles: bool,
):
    """Process Figma import in background"""
    from app.db.database import SessionLocal

    db = SessionLocal()
    try:
        figma_import = db.query(FigmaImport).filter(
            FigmaImport.id == import_id
        ).first()

        if not figma_import:
            return

        figma_import.status = FigmaImportStatus.PROCESSING
        figma_import.progress = 10
        figma_import.message = "Fetching Figma file..."
        db.commit()

        # Fetch file data
        client = FigmaClient(figma_token)
        file_data = await client.get_file(file_key, node_ids)

        figma_import.progress = 30
        figma_import.message = "Converting designs..."
        db.commit()

        # Convert to Forma components
        converter = FigmaToReactConverter()
        components = []

        document = file_data.get("document", {})
        for page in document.get("children", []):
            for frame in page.get("children", []):
                if frame.get("type") in ["FRAME", "COMPONENT"]:
                    component = converter.convert_node(frame)
                    components.append(component)

        figma_import.progress = 60
        figma_import.message = "Extracting design tokens..."
        db.commit()

        # Extract design tokens
        tokens = converter.extract_design_tokens(file_data)

        figma_import.progress = 80
        figma_import.message = "Exporting assets..."
        db.commit()

        # Export assets if needed
        assets = {}
        if import_assets and converter.assets:
            asset_ids = [a["figmaId"] for a in converter.assets]
            if asset_ids:
                try:
                    images = await client.get_images(file_key, asset_ids)
                    assets = images.get("images", {})
                except Exception as e:
                    logger.warning(f"Failed to export assets: {e}")

        figma_import.progress = 100
        figma_import.status = FigmaImportStatus.COMPLETED
        figma_import.message = "Import complete"
        figma_import.completed_at = datetime.utcnow()
        figma_import.result = {
            "components": components,
            "tokens": tokens,
            "assets": assets,
            "componentCount": len(components),
        }
        db.commit()

    except Exception as e:
        logger.error(f"Figma import failed: {e}")
        figma_import.status = FigmaImportStatus.FAILED
        figma_import.error = str(e)
        figma_import.completed_at = datetime.utcnow()
        db.commit()
    finally:
        db.close()
