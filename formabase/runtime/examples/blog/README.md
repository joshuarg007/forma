# Blog Example

A complete blog backend with users, posts, comments, categories, and tags.

## Features

- User authentication with roles (admin, author, reader)
- Posts with rich text content, categories, and tags
- Nested comments with moderation
- Automatic slug generation
- Soft delete for posts and comments
- Full-text search on posts

## Quick Start

```bash
# Start the development server
forma-runtime dev -s schema.json

# Or start in production mode
forma-runtime serve -s schema.json --port 8000
```

## API Endpoints

### Users
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Posts
- `GET /api/post` - List posts (with pagination, search)
- `GET /api/post/{id}` - Get single post
- `POST /api/post` - Create post (requires auth)
- `PUT /api/post/{id}` - Update post
- `DELETE /api/post/{id}` - Delete post (soft delete)

### Categories & Tags
- `GET /api/category` - List categories
- `GET /api/tag` - List tags

### Comments
- `GET /api/comment?post={id}` - List comments for a post
- `POST /api/comment` - Create comment (requires auth)

## Example Usage

```bash
# Register a user
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "author@example.com", "password": "secret123", "name": "John Author"}'

# Create a post (with the returned token)
curl -X POST http://localhost:8000/api/post \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "My First Post",
    "content": "<p>Hello, world!</p>",
    "status": "published"
  }'

# Search posts
curl "http://localhost:8000/api/post?search=hello"
```

## GraphQL

Access the GraphQL endpoint at `/graphql`:

```graphql
query {
  posts(limit: 10) {
    id
    title
    author {
      name
    }
    category {
      name
    }
  }
}
```
