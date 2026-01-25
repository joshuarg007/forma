# Blog Example

A simple blog application with users, posts, categories, and comments.

## Collections

- **user** - Blog authors and readers (auth enabled)
- **post** - Blog posts with status, categories, and rich content
- **category** - Post categories
- **comment** - Comments on posts

## Quick Start

```bash
# From the runtime root directory
cd ~/formabase/runtime

# Run migrations
python -m forma_runtime.cli migrate --schema examples/blog/schema.json

# Start server
python -m forma_runtime.cli serve --schema examples/blog/schema.json --port 8000

# Or with debug mode (auto-migrate)
DEBUG=true python -m forma_runtime.cli serve --schema examples/blog/schema.json
```

## API Endpoints

### REST API

```
# Auth
POST /api/auth/register   - Register new user
POST /api/auth/login      - Login
GET  /api/auth/me         - Get current user

# Posts
GET    /api/posts         - List posts
POST   /api/posts         - Create post
GET    /api/posts/:id     - Get post
PUT    /api/posts/:id     - Update post
DELETE /api/posts/:id     - Delete post

# Categories
GET    /api/categorys     - List categories
POST   /api/categorys     - Create category
...

# Comments
GET    /api/comments      - List comments
POST   /api/comments      - Create comment
...
```

### GraphQL

Access GraphQL playground at: `http://localhost:8000/graphql`

```graphql
# Query
query {
  posts(limit: 10, orderBy: "created_at", orderDir: "desc") {
    id
    title
    slug
    content
    status
    created_at
  }
}

# Mutation
mutation {
  create_Post(data: {
    title: "My First Post"
    slug: "my-first-post"
    content: "Hello world!"
    author: 1
    status: "draft"
  }) {
    id
    title
  }
}
```

## Test Data

```bash
# Register a user
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@blog.com","password":"secret123","name":"Admin"}'

# Create a category
curl -X POST http://localhost:8000/api/categorys \
  -H "Content-Type: application/json" \
  -d '{"name":"Technology","slug":"technology"}'

# Create a post (use the token from register response)
curl -X POST http://localhost:8000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title":"Getting Started",
    "slug":"getting-started",
    "content":"<p>Welcome to my blog!</p>",
    "author":1,
    "category":1,
    "status":"published"
  }'
```
