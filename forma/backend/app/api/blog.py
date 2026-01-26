"""Blog/CMS API - Posts, Categories, and Comments"""
import re
from datetime import datetime
from typing import Optional, List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import desc, or_

from app.db.database import get_db
from app.db.models import (
    User, Project, BlogPost, BlogCategory, BlogComment,
    BlogPostStatus, SiteUser
)
from app.core.security import get_current_user_required


router = APIRouter(prefix="/api/blog", tags=["blog"])

# Public router for deployed sites
public_router = APIRouter(prefix="/api/posts", tags=["blog-public"])


# =============================================================================
# SCHEMAS
# =============================================================================

class CategoryCreate(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    color: Optional[str] = None
    icon: Optional[str] = None
    parent_id: Optional[str] = None


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    color: Optional[str] = None
    icon: Optional[str] = None
    parent_id: Optional[str] = None


class PostCreate(BaseModel):
    title: str
    slug: str
    excerpt: Optional[str] = None
    content: Optional[str] = None
    featured_image: Optional[str] = None
    category_id: Optional[str] = None
    tags: List[str] = []
    status: str = "draft"
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    allow_comments: bool = True
    is_featured: bool = False


class PostUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    excerpt: Optional[str] = None
    content: Optional[str] = None
    featured_image: Optional[str] = None
    category_id: Optional[str] = None
    tags: Optional[List[str]] = None
    status: Optional[str] = None
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    allow_comments: Optional[bool] = None
    is_featured: Optional[bool] = None
    scheduled_for: Optional[datetime] = None


class CommentCreate(BaseModel):
    content: str
    author_name: Optional[str] = None
    author_email: Optional[str] = None
    author_website: Optional[str] = None
    parent_id: Optional[str] = None


# =============================================================================
# HELPERS
# =============================================================================

def calculate_reading_time(content: str) -> int:
    """Calculate reading time in minutes."""
    if not content:
        return 0
    # Average reading speed: 200 words per minute
    word_count = len(content.split())
    return max(1, round(word_count / 200))


def render_markdown(content: str) -> str:
    """Simple markdown to HTML conversion."""
    if not content:
        return ""

    html = content

    # Headers
    html = re.sub(r'^### (.+)$', r'<h3>\1</h3>', html, flags=re.MULTILINE)
    html = re.sub(r'^## (.+)$', r'<h2>\1</h2>', html, flags=re.MULTILINE)
    html = re.sub(r'^# (.+)$', r'<h1>\1</h1>', html, flags=re.MULTILINE)

    # Bold and italic
    html = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', html)
    html = re.sub(r'\*(.+?)\*', r'<em>\1</em>', html)

    # Links
    html = re.sub(r'\[(.+?)\]\((.+?)\)', r'<a href="\2">\1</a>', html)

    # Images
    html = re.sub(r'!\[(.+?)\]\((.+?)\)', r'<img src="\2" alt="\1" />', html)

    # Code blocks
    html = re.sub(r'```(\w+)?\n(.*?)\n```', r'<pre><code>\2</code></pre>', html, flags=re.DOTALL)
    html = re.sub(r'`(.+?)`', r'<code>\1</code>', html)

    # Lists
    html = re.sub(r'^- (.+)$', r'<li>\1</li>', html, flags=re.MULTILINE)
    html = re.sub(r'(<li>.*</li>)+', r'<ul>\g<0></ul>', html)

    # Paragraphs
    html = re.sub(r'\n\n', '</p><p>', html)
    html = f'<p>{html}</p>'

    return html


# =============================================================================
# CATEGORY ENDPOINTS (Authenticated)
# =============================================================================

@router.get("/projects/{project_id}/categories")
async def list_categories(
    project_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    """List all categories for a project."""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == user.id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    categories = db.query(BlogCategory).filter(
        BlogCategory.project_id == project_id
    ).order_by(BlogCategory.position).all()

    return {
        "categories": [
            {
                "id": str(c.id),
                "name": c.name,
                "slug": c.slug,
                "description": c.description,
                "color": c.color,
                "icon": c.icon,
                "parent_id": str(c.parent_id) if c.parent_id else None,
                "post_count": len(c.posts)
            }
            for c in categories
        ]
    }


@router.post("/projects/{project_id}/categories")
async def create_category(
    project_id: UUID,
    data: CategoryCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    """Create a new category."""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == user.id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    category = BlogCategory(
        project_id=project_id,
        name=data.name,
        slug=data.slug,
        description=data.description,
        color=data.color,
        icon=data.icon,
        parent_id=UUID(data.parent_id) if data.parent_id else None
    )

    db.add(category)
    db.commit()
    db.refresh(category)

    return {"id": str(category.id), "message": "Category created"}


@router.put("/projects/{project_id}/categories/{category_id}")
async def update_category(
    project_id: UUID,
    category_id: UUID,
    data: CategoryUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    """Update a category."""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == user.id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    category = db.query(BlogCategory).filter(
        BlogCategory.id == category_id,
        BlogCategory.project_id == project_id
    ).first()

    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if field == "parent_id" and value:
            value = UUID(value)
        setattr(category, field, value)

    db.commit()

    return {"message": "Category updated"}


@router.delete("/projects/{project_id}/categories/{category_id}")
async def delete_category(
    project_id: UUID,
    category_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    """Delete a category."""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == user.id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    category = db.query(BlogCategory).filter(
        BlogCategory.id == category_id,
        BlogCategory.project_id == project_id
    ).first()

    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    # Move posts to uncategorized
    db.query(BlogPost).filter(BlogPost.category_id == category_id).update(
        {"category_id": None}
    )

    db.delete(category)
    db.commit()

    return {"message": "Category deleted"}


# =============================================================================
# POST ENDPOINTS (Authenticated)
# =============================================================================

@router.get("/projects/{project_id}/posts")
async def list_posts(
    project_id: UUID,
    status: Optional[str] = None,
    category_id: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 20,
    offset: int = 0,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    """List all posts for a project."""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == user.id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    query = db.query(BlogPost).filter(BlogPost.project_id == project_id)

    if status:
        query = query.filter(BlogPost.status == status)
    if category_id:
        query = query.filter(BlogPost.category_id == category_id)
    if search:
        query = query.filter(
            or_(
                BlogPost.title.ilike(f"%{search}%"),
                BlogPost.content.ilike(f"%{search}%")
            )
        )

    total = query.count()
    posts = query.order_by(desc(BlogPost.created_at)).offset(offset).limit(limit).all()

    return {
        "posts": [
            {
                "id": str(p.id),
                "title": p.title,
                "slug": p.slug,
                "excerpt": p.excerpt,
                "featured_image": p.featured_image,
                "status": p.status.value if p.status else "draft",
                "category": {
                    "id": str(p.category.id),
                    "name": p.category.name,
                    "slug": p.category.slug
                } if p.category else None,
                "tags": p.tags or [],
                "is_featured": p.is_featured,
                "view_count": p.view_count,
                "comment_count": p.comment_count,
                "published_at": p.published_at.isoformat() if p.published_at else None,
                "created_at": p.created_at.isoformat()
            }
            for p in posts
        ],
        "total": total
    }


@router.post("/projects/{project_id}/posts")
async def create_post(
    project_id: UUID,
    data: PostCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    """Create a new post."""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == user.id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Check for duplicate slug
    existing = db.query(BlogPost).filter(
        BlogPost.project_id == project_id,
        BlogPost.slug == data.slug
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Post slug already exists")

    post = BlogPost(
        project_id=project_id,
        title=data.title,
        slug=data.slug,
        excerpt=data.excerpt,
        content=data.content,
        content_html=render_markdown(data.content) if data.content else None,
        featured_image=data.featured_image,
        category_id=UUID(data.category_id) if data.category_id else None,
        tags=data.tags,
        status=BlogPostStatus(data.status),
        meta_title=data.meta_title or data.title,
        meta_description=data.meta_description or data.excerpt,
        allow_comments=data.allow_comments,
        is_featured=data.is_featured,
        reading_time_minutes=calculate_reading_time(data.content) if data.content else 0
    )

    if data.status == "published":
        post.published_at = datetime.utcnow()

    db.add(post)
    db.commit()
    db.refresh(post)

    return {"id": str(post.id), "slug": post.slug, "message": "Post created"}


@router.get("/projects/{project_id}/posts/{post_id}")
async def get_post(
    project_id: UUID,
    post_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    """Get a single post."""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == user.id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    post = db.query(BlogPost).filter(
        BlogPost.id == post_id,
        BlogPost.project_id == project_id
    ).first()

    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    return {
        "id": str(post.id),
        "title": post.title,
        "slug": post.slug,
        "excerpt": post.excerpt,
        "content": post.content,
        "content_html": post.content_html,
        "featured_image": post.featured_image,
        "category": {
            "id": str(post.category.id),
            "name": post.category.name,
            "slug": post.category.slug
        } if post.category else None,
        "tags": post.tags or [],
        "status": post.status.value if post.status else "draft",
        "meta_title": post.meta_title,
        "meta_description": post.meta_description,
        "og_image": post.og_image,
        "allow_comments": post.allow_comments,
        "is_featured": post.is_featured,
        "is_pinned": post.is_pinned,
        "view_count": post.view_count,
        "like_count": post.like_count,
        "comment_count": post.comment_count,
        "reading_time_minutes": post.reading_time_minutes,
        "published_at": post.published_at.isoformat() if post.published_at else None,
        "scheduled_for": post.scheduled_for.isoformat() if post.scheduled_for else None,
        "created_at": post.created_at.isoformat(),
        "updated_at": post.updated_at.isoformat()
    }


@router.put("/projects/{project_id}/posts/{post_id}")
async def update_post(
    project_id: UUID,
    post_id: UUID,
    data: PostUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    """Update a post."""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == user.id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    post = db.query(BlogPost).filter(
        BlogPost.id == post_id,
        BlogPost.project_id == project_id
    ).first()

    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    update_data = data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        if field == "content" and value:
            post.content = value
            post.content_html = render_markdown(value)
            post.reading_time_minutes = calculate_reading_time(value)
        elif field == "status":
            post.status = BlogPostStatus(value)
            if value == "published" and not post.published_at:
                post.published_at = datetime.utcnow()
        elif field == "category_id":
            post.category_id = UUID(value) if value else None
        else:
            setattr(post, field, value)

    db.commit()

    return {"message": "Post updated"}


@router.delete("/projects/{project_id}/posts/{post_id}")
async def delete_post(
    project_id: UUID,
    post_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    """Delete a post."""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == user.id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    post = db.query(BlogPost).filter(
        BlogPost.id == post_id,
        BlogPost.project_id == project_id
    ).first()

    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    db.delete(post)
    db.commit()

    return {"message": "Post deleted"}


# =============================================================================
# PUBLIC BLOG ENDPOINTS (For deployed sites)
# =============================================================================

@public_router.get("/{project_id}")
async def public_list_posts(
    project_id: UUID,
    category: Optional[str] = None,
    tag: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 10,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """Public post listing for deployed sites."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Site not found")

    query = db.query(BlogPost).filter(
        BlogPost.project_id == project_id,
        BlogPost.status == BlogPostStatus.PUBLISHED
    )

    if category:
        query = query.join(BlogCategory).filter(BlogCategory.slug == category)
    if tag:
        query = query.filter(BlogPost.tags.contains([tag]))
    if search:
        query = query.filter(
            or_(
                BlogPost.title.ilike(f"%{search}%"),
                BlogPost.excerpt.ilike(f"%{search}%")
            )
        )

    total = query.count()

    # Featured/pinned posts first
    posts = query.order_by(
        desc(BlogPost.is_pinned),
        desc(BlogPost.is_featured),
        desc(BlogPost.published_at)
    ).offset(offset).limit(limit).all()

    return {
        "posts": [
            {
                "id": str(p.id),
                "title": p.title,
                "slug": p.slug,
                "excerpt": p.excerpt,
                "featured_image": p.featured_image,
                "category": {
                    "name": p.category.name,
                    "slug": p.category.slug
                } if p.category else None,
                "tags": p.tags or [],
                "author": {
                    "name": p.author.name,
                    "avatar": p.author.avatar_url
                } if p.author else None,
                "is_featured": p.is_featured,
                "reading_time_minutes": p.reading_time_minutes,
                "published_at": p.published_at.isoformat() if p.published_at else None
            }
            for p in posts
        ],
        "total": total,
        "has_more": offset + limit < total
    }


@public_router.get("/{project_id}/{post_slug}")
async def public_get_post(
    project_id: UUID,
    post_slug: str,
    db: Session = Depends(get_db)
):
    """Get a single post for deployed sites."""
    post = db.query(BlogPost).filter(
        BlogPost.project_id == project_id,
        BlogPost.slug == post_slug,
        BlogPost.status == BlogPostStatus.PUBLISHED
    ).first()

    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    # Increment view count
    post.view_count = (post.view_count or 0) + 1
    db.commit()

    # Get related posts
    related = []
    if post.category_id:
        related = db.query(BlogPost).filter(
            BlogPost.project_id == project_id,
            BlogPost.category_id == post.category_id,
            BlogPost.id != post.id,
            BlogPost.status == BlogPostStatus.PUBLISHED
        ).limit(3).all()

    return {
        "id": str(post.id),
        "title": post.title,
        "slug": post.slug,
        "excerpt": post.excerpt,
        "content_html": post.content_html,
        "featured_image": post.featured_image,
        "category": {
            "name": post.category.name,
            "slug": post.category.slug
        } if post.category else None,
        "tags": post.tags or [],
        "author": {
            "name": post.author.name,
            "avatar": post.author.avatar_url,
            "bio": post.author.custom_data.get("bio") if post.author and post.author.custom_data else None
        } if post.author else None,
        "meta_title": post.meta_title,
        "meta_description": post.meta_description,
        "og_image": post.og_image or post.featured_image,
        "allow_comments": post.allow_comments,
        "reading_time_minutes": post.reading_time_minutes,
        "view_count": post.view_count,
        "like_count": post.like_count,
        "comment_count": post.comment_count,
        "published_at": post.published_at.isoformat() if post.published_at else None,
        "related_posts": [
            {
                "title": r.title,
                "slug": r.slug,
                "featured_image": r.featured_image,
                "excerpt": r.excerpt
            }
            for r in related
        ]
    }


@public_router.get("/{project_id}/categories")
async def public_list_categories(
    project_id: UUID,
    db: Session = Depends(get_db)
):
    """List categories for deployed sites."""
    categories = db.query(BlogCategory).filter(
        BlogCategory.project_id == project_id
    ).order_by(BlogCategory.position).all()

    return {
        "categories": [
            {
                "name": c.name,
                "slug": c.slug,
                "description": c.description,
                "color": c.color,
                "post_count": db.query(BlogPost).filter(
                    BlogPost.category_id == c.id,
                    BlogPost.status == BlogPostStatus.PUBLISHED
                ).count()
            }
            for c in categories
        ]
    }


@public_router.post("/{project_id}/{post_slug}/comments")
async def public_add_comment(
    project_id: UUID,
    post_slug: str,
    data: CommentCreate,
    request: Request,
    db: Session = Depends(get_db)
):
    """Add a comment to a post."""
    post = db.query(BlogPost).filter(
        BlogPost.project_id == project_id,
        BlogPost.slug == post_slug,
        BlogPost.status == BlogPostStatus.PUBLISHED
    ).first()

    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    if not post.allow_comments:
        raise HTTPException(status_code=400, detail="Comments are disabled for this post")

    # Check for authenticated user
    author_id = None
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        from app.api.site_auth import get_session_from_token
        token = auth_header.split(" ")[1]
        session = get_session_from_token(db, token)
        if session:
            author_id = session.user.id
            data.author_name = session.user.name
            data.author_email = session.user.email

    comment = BlogComment(
        post_id=post.id,
        author_id=author_id,
        parent_id=UUID(data.parent_id) if data.parent_id else None,
        author_name=data.author_name,
        author_email=data.author_email,
        author_website=data.author_website,
        content=data.content,
        is_approved=author_id is not None,  # Auto-approve for authenticated users
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent")
    )

    db.add(comment)
    post.comment_count = (post.comment_count or 0) + 1
    db.commit()

    return {
        "id": str(comment.id),
        "message": "Comment submitted" if not comment.is_approved else "Comment added"
    }


@public_router.get("/{project_id}/{post_slug}/comments")
async def public_list_comments(
    project_id: UUID,
    post_slug: str,
    db: Session = Depends(get_db)
):
    """List approved comments for a post."""
    post = db.query(BlogPost).filter(
        BlogPost.project_id == project_id,
        BlogPost.slug == post_slug,
        BlogPost.status == BlogPostStatus.PUBLISHED
    ).first()

    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    comments = db.query(BlogComment).filter(
        BlogComment.post_id == post.id,
        BlogComment.is_approved == True,
        BlogComment.parent_id == None
    ).order_by(BlogComment.created_at).all()

    def serialize_comment(c):
        return {
            "id": str(c.id),
            "author_name": c.author_name or (c.author.name if c.author else "Anonymous"),
            "author_avatar": c.author.avatar_url if c.author else None,
            "content": c.content,
            "created_at": c.created_at.isoformat(),
            "replies": [serialize_comment(r) for r in c.replies if r.is_approved]
        }

    return {
        "comments": [serialize_comment(c) for c in comments],
        "total": len(comments)
    }


# =============================================================================
# RSS FEED
# =============================================================================

@public_router.get("/{project_id}/feed.xml")
async def get_rss_feed(
    project_id: UUID,
    db: Session = Depends(get_db)
):
    """Generate RSS feed for blog."""
    from fastapi.responses import Response

    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Site not found")

    posts = db.query(BlogPost).filter(
        BlogPost.project_id == project_id,
        BlogPost.status == BlogPostStatus.PUBLISHED
    ).order_by(desc(BlogPost.published_at)).limit(20).all()

    items = []
    for post in posts:
        pub_date = post.published_at.strftime("%a, %d %b %Y %H:%M:%S +0000") if post.published_at else ""
        items.append(f"""
    <item>
      <title><![CDATA[{post.title}]]></title>
      <link>https://site.forma.app/blog/{post.slug}</link>
      <description><![CDATA[{post.excerpt or ''}]]></description>
      <pubDate>{pub_date}</pubDate>
      <guid>https://site.forma.app/blog/{post.slug}</guid>
    </item>""")

    rss = f"""<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>{project.name}</title>
    <link>https://site.forma.app</link>
    <description>{project.description or ''}</description>
    <language>en-us</language>
    {"".join(items)}
  </channel>
</rss>"""

    return Response(content=rss, media_type="application/xml")
