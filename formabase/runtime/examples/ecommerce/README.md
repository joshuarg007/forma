# E-Commerce Example

A complete e-commerce backend with products, orders, customers, and reviews.

## Features

- Product catalog with categories and variants
- Shopping cart with session support
- Order management with status tracking
- Customer addresses
- Product reviews and ratings
- Coupon/discount system
- Inventory tracking

## Quick Start

```bash
# Start the development server
forma-runtime dev -s schema.json

# Or start in production mode
forma-runtime serve -s schema.json --port 8000
```

## Data Model

```
User (auth)
  ├── Address
  ├── Order
  │     └── OrderItem
  ├── Cart
  └── Review

Category (hierarchical)
  └── Product
        ├── ProductVariant
        ├── OrderItem
        └── Review

Coupon
```

## API Endpoints

### Products
- `GET /api/product` - List products (with search, filtering)
- `GET /api/product/{id}` - Get product details
- `GET /api/product_variant?product={id}` - Get variants

### Categories
- `GET /api/category` - List categories
- `GET /api/product?category={id}` - Products by category

### Cart
- `GET /api/cart?session_id={id}` - Get cart
- `POST /api/cart` - Create/update cart
- `DELETE /api/cart/{id}` - Clear cart

### Orders
- `POST /api/order` - Create order
- `GET /api/order` - List user's orders (authenticated)
- `GET /api/order/{id}` - Get order details

### Reviews
- `GET /api/review?product={id}` - List product reviews
- `POST /api/review` - Create review (authenticated)

### Coupons (Admin)
- `GET /api/coupon` - List coupons
- `POST /api/coupon` - Create coupon

## Example Usage

```bash
# Browse products
curl "http://localhost:8000/api/product?status=active&limit=20"

# Search products
curl "http://localhost:8000/api/product?search=laptop"

# Get product details
curl "http://localhost:8000/api/product/1"

# Register a customer
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "customer@example.com", "password": "secret123", "name": "Jane Customer"}'

# Create an order
curl -X POST http://localhost:8000/api/order \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "order_number": "ORD-001",
    "email": "customer@example.com",
    "shipping_address": {
      "name": "Jane Customer",
      "address1": "123 Main St",
      "city": "New York",
      "state": "NY",
      "postal_code": "10001",
      "country": "US"
    },
    "subtotal": 9999,
    "total": 10999
  }'

# Add a review
curl -X POST http://localhost:8000/api/review \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "product": 1,
    "rating": 5,
    "title": "Great product!",
    "content": "Exactly what I was looking for."
  }'
```

## Price Format

All prices are stored as integers in cents (e.g., $99.99 = 9999).

## Order Status Flow

```
pending → confirmed → processing → shipped → delivered
                                     ↓
                                 cancelled
                                     ↓
                                 refunded
```
