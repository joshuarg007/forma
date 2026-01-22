'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { ModuleProps } from '../types'

interface ProductCardProps extends ModuleProps {
  name?: string
  price?: number
  originalPrice?: number
  currency?: string
  image?: string
  images?: string[]
  description?: string
  rating?: number
  reviewCount?: number
  badge?: string
  badgeColor?: 'red' | 'green' | 'blue' | 'yellow' | 'purple'
  inStock?: boolean
  variant?: 'simple' | 'detailed' | 'horizontal'
  showRating?: boolean
  showAddToCart?: boolean
  showWishlist?: boolean
  href?: string
}

const badgeColors = {
  red: 'bg-red-500',
  green: 'bg-green-500',
  blue: 'bg-blue-500',
  yellow: 'bg-yellow-500',
  purple: 'bg-purple-500',
}

const StarIcon = ({ filled }: { filled: boolean }) => (
  <svg
    className={cn('w-4 h-4', filled ? 'text-yellow-400' : 'text-gray-300')}
    fill="currentColor"
    viewBox="0 0 20 20"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
)

export default function ProductCard({
  id,
  className,
  styles,
  name = 'Premium Wireless Headphones',
  price = 199.99,
  originalPrice,
  currency = '$',
  image = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
  images,
  description = 'High-quality wireless headphones with active noise cancellation.',
  rating = 4.5,
  reviewCount = 128,
  badge,
  badgeColor = 'red',
  inStock = true,
  variant = 'simple',
  showRating = true,
  showAddToCart = true,
  showWishlist = true,
  href = '#',
}: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const allImages = images && images.length > 0 ? images : [image]

  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0

  if (variant === 'horizontal') {
    return (
      <div
        id={id}
        className={cn('flex gap-6 p-4 bg-white rounded-2xl shadow-lg', className)}
        style={styles}
      >
        {/* Image */}
        <div className="relative w-48 h-48 flex-shrink-0">
          <img
            src={allImages[currentImageIndex]}
            alt={name}
            className="w-full h-full object-cover rounded-xl"
          />
          {badge && (
            <span className={cn(
              'absolute top-2 left-2 px-2 py-1 text-xs font-bold text-white rounded',
              badgeColors[badgeColor]
            )}>
              {badge}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col">
          <a href={href} className="group">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
              {name}
            </h3>
          </a>

          {showRating && (
            <div className="flex items-center gap-2 mt-1">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarIcon key={star} filled={star <= Math.round(rating)} />
                ))}
              </div>
              <span className="text-sm text-gray-500">({reviewCount})</span>
            </div>
          )}

          <p className="text-gray-600 text-sm mt-2 line-clamp-2">{description}</p>

          <div className="mt-auto pt-4 flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900">
                {currency}{price.toFixed(2)}
              </span>
              {originalPrice && (
                <span className="text-sm text-gray-400 line-through">
                  {currency}{originalPrice.toFixed(2)}
                </span>
              )}
            </div>

            {showAddToCart && (
              <button
                className={cn(
                  'px-4 py-2 rounded-lg font-medium transition-colors',
                  inStock
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                )}
                disabled={!inStock}
              >
                {inStock ? 'Add to Cart' : 'Out of Stock'}
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'detailed') {
    return (
      <div
        id={id}
        className={cn('bg-white rounded-2xl shadow-lg overflow-hidden', className)}
        style={styles}
      >
        {/* Image */}
        <div className="relative aspect-square group">
          <img
            src={allImages[currentImageIndex]}
            alt={name}
            className="w-full h-full object-cover"
          />

          {/* Image navigation */}
          {allImages.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {allImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={cn(
                    'w-2 h-2 rounded-full transition-all',
                    index === currentImageIndex ? 'bg-white w-4' : 'bg-white/50'
                  )}
                />
              ))}
            </div>
          )}

          {/* Badge */}
          {badge && (
            <span className={cn(
              'absolute top-3 left-3 px-2.5 py-1 text-xs font-bold text-white rounded-full',
              badgeColors[badgeColor]
            )}>
              {badge}
            </span>
          )}

          {/* Discount */}
          {discount > 0 && (
            <span className="absolute top-3 right-3 px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
              -{discount}%
            </span>
          )}

          {/* Wishlist */}
          {showWishlist && (
            <button
              onClick={() => setIsWishlisted(!isWishlisted)}
              className="absolute top-3 right-3 p-2 bg-white/90 rounded-full shadow-md hover:bg-white transition-colors"
              style={{ right: discount > 0 ? '4rem' : '0.75rem' }}
            >
              <svg
                className={cn('w-5 h-5', isWishlisted ? 'text-red-500 fill-current' : 'text-gray-600')}
                fill={isWishlisted ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          )}

          {/* Quick add overlay */}
          <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="w-full py-2 bg-white text-gray-900 font-medium rounded-lg hover:bg-gray-100 transition-colors">
              Quick View
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <a href={href} className="group">
            <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
              {name}
            </h3>
          </a>

          {showRating && (
            <div className="flex items-center gap-2 mt-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarIcon key={star} filled={star <= Math.round(rating)} />
                ))}
              </div>
              <span className="text-sm text-gray-500">({reviewCount})</span>
            </div>
          )}

          <p className="text-gray-600 text-sm mt-2 line-clamp-2">{description}</p>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-gray-900">
                {currency}{price.toFixed(2)}
              </span>
              {originalPrice && (
                <span className="text-sm text-gray-400 line-through">
                  {currency}{originalPrice.toFixed(2)}
                </span>
              )}
            </div>

            {showAddToCart && (
              <button
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  inStock
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                )}
                disabled={!inStock}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Simple variant (default)
  return (
    <div
      id={id}
      className={cn('bg-white rounded-2xl shadow-lg overflow-hidden group', className)}
      style={styles}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={allImages[currentImageIndex]}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Badge */}
        {badge && (
          <span className={cn(
            'absolute top-3 left-3 px-2.5 py-1 text-xs font-bold text-white rounded-full',
            badgeColors[badgeColor]
          )}>
            {badge}
          </span>
        )}

        {/* Wishlist */}
        {showWishlist && (
          <button
            onClick={() => setIsWishlisted(!isWishlisted)}
            className="absolute top-3 right-3 p-2 bg-white/90 rounded-full shadow-md hover:bg-white transition-colors opacity-0 group-hover:opacity-100"
          >
            <svg
              className={cn('w-5 h-5', isWishlisted ? 'text-red-500 fill-current' : 'text-gray-600')}
              fill={isWishlisted ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <a href={href}>
          <h3 className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors line-clamp-1">
            {name}
          </h3>
        </a>

        {showRating && (
          <div className="flex items-center gap-1 mt-1">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon key={star} filled={star <= Math.round(rating)} />
              ))}
            </div>
            <span className="text-xs text-gray-500">({reviewCount})</span>
          </div>
        )}

        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-lg font-bold text-gray-900">
            {currency}{price.toFixed(2)}
          </span>
          {originalPrice && (
            <span className="text-sm text-gray-400 line-through">
              {currency}{originalPrice.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

ProductCard.displayName = 'ProductCard'

ProductCard.config = {
  id: 'product-card',
  name: 'Product Card',
  category: 'ecommerce',
  description: 'E-commerce product card with variants',
  defaultProps: {
    name: 'Premium Wireless Headphones',
    price: 199.99,
    currency: '$',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
    description: 'High-quality wireless headphones with active noise cancellation.',
    rating: 4.5,
    reviewCount: 128,
    inStock: true,
    variant: 'simple',
    showRating: true,
    showAddToCart: true,
    showWishlist: true,
    href: '#',
  },
  editableFields: [
    { name: 'name', label: 'Product Name', type: 'text' },
    { name: 'price', label: 'Price', type: 'number' },
    { name: 'originalPrice', label: 'Original Price', type: 'number' },
    { name: 'currency', label: 'Currency', type: 'text', defaultValue: '$' },
    { name: 'image', label: 'Image', type: 'image' },
    { name: 'images', label: 'Images', type: 'array' },
    { name: 'description', label: 'Description', type: 'textarea' },
    { name: 'rating', label: 'Rating', type: 'number', defaultValue: 4.5 },
    { name: 'reviewCount', label: 'Review Count', type: 'number' },
    { name: 'badge', label: 'Badge', type: 'text' },
    { name: 'badgeColor', label: 'Badge Color', type: 'select', options: ['red', 'green', 'blue', 'yellow', 'purple'], defaultValue: 'red' },
    { name: 'inStock', label: 'In Stock', type: 'boolean', defaultValue: true },
    { name: 'variant', label: 'Variant', type: 'select', options: ['simple', 'detailed', 'horizontal'], defaultValue: 'simple' },
    { name: 'showRating', label: 'Show Rating', type: 'boolean', defaultValue: true },
    { name: 'showAddToCart', label: 'Show Add to Cart', type: 'boolean', defaultValue: true },
    { name: 'showWishlist', label: 'Show Wishlist', type: 'boolean', defaultValue: true },
    { name: 'href', label: 'Link', type: 'url' },
  ],
}
