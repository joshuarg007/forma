'use client'

import { cn } from '@/lib/utils'
import type { ModuleProps } from '../types'

interface CartItem {
  name: string
  price: number
  quantity: number
  image?: string
}

interface CartSummaryProps extends ModuleProps {
  items?: CartItem[]
  currency?: string
  subtotal?: number
  shipping?: number
  tax?: number
  discount?: number
  discountCode?: string
  showItems?: boolean
  showDiscountInput?: boolean
  checkoutText?: string
  checkoutLink?: string
  variant?: 'simple' | 'detailed' | 'mini'
}

const defaultItems: CartItem[] = [
  { name: 'Wireless Headphones', price: 199.99, quantity: 1, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100' },
  { name: 'Smart Watch', price: 299.99, quantity: 1, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100' },
  { name: 'USB-C Cable', price: 19.99, quantity: 2 },
]

export default function CartSummary({
  id,
  className,
  styles,
  items = defaultItems,
  currency = '$',
  subtotal,
  shipping = 9.99,
  tax,
  discount = 0,
  discountCode,
  showItems = true,
  showDiscountInput = true,
  checkoutText = 'Proceed to Checkout',
  checkoutLink = '#',
  variant = 'detailed',
}: CartSummaryProps) {
  // Calculate subtotal if not provided
  const calculatedSubtotal = subtotal ?? items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  // Calculate tax if not provided (assume 10%)
  const calculatedTax = tax ?? calculatedSubtotal * 0.1
  // Calculate total
  const total = calculatedSubtotal + shipping + calculatedTax - discount

  if (variant === 'mini') {
    return (
      <div
        id={id}
        className={cn('bg-white rounded-xl shadow-lg p-4 w-80', className)}
        style={styles}
      >
        <div className="flex items-center justify-between mb-4">
          <span className="font-semibold text-gray-900">Cart ({items.length})</span>
          <a href="#" className="text-sm text-indigo-600 hover:text-indigo-700">View All</a>
        </div>

        {/* Mini item list */}
        <div className="space-y-3 mb-4">
          {items.slice(0, 3).map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              {item.image ? (
                <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
              ) : (
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                <p className="text-sm text-gray-500">x{item.quantity}</p>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {currency}{(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between mb-4">
            <span className="font-semibold text-gray-900">Total</span>
            <span className="text-xl font-bold text-gray-900">{currency}{total.toFixed(2)}</span>
          </div>
          <a
            href={checkoutLink}
            className="block w-full py-2.5 bg-indigo-600 text-white text-center font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            {checkoutText}
          </a>
        </div>
      </div>
    )
  }

  if (variant === 'simple') {
    return (
      <div
        id={id}
        className={cn('bg-white rounded-2xl shadow-lg p-6', className)}
        style={styles}
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal ({items.length} items)</span>
            <span className="font-medium text-gray-900">{currency}{calculatedSubtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Shipping</span>
            <span className="font-medium text-gray-900">{currency}{shipping.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Tax</span>
            <span className="font-medium text-gray-900">{currency}{calculatedTax.toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span className="font-medium">-{currency}{discount.toFixed(2)}</span>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 mt-4 pt-4">
          <div className="flex justify-between">
            <span className="font-semibold text-gray-900">Total</span>
            <span className="text-xl font-bold text-gray-900">{currency}{total.toFixed(2)}</span>
          </div>
        </div>

        <a
          href={checkoutLink}
          className="block w-full mt-6 py-3 bg-indigo-600 text-white text-center font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
        >
          {checkoutText}
        </a>
      </div>
    )
  }

  // Detailed variant (default)
  return (
    <div
      id={id}
      className={cn('bg-white rounded-2xl shadow-lg', className)}
      style={styles}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Shopping Cart</h3>
        <p className="text-sm text-gray-500 mt-1">{items.length} items in your cart</p>
      </div>

      {/* Items */}
      {showItems && (
        <div className="p-6 space-y-4 max-h-80 overflow-y-auto">
          {items.map((item, index) => (
            <div key={index} className="flex gap-4">
              {item.image ? (
                <img src={item.image} alt={item.name} className="w-20 h-20 rounded-lg object-cover" />
              ) : (
                <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              )}
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{item.name}</h4>
                <p className="text-sm text-gray-500 mt-1">Qty: {item.quantity}</p>
                <p className="font-medium text-gray-900 mt-1">
                  {currency}{(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
              <button className="p-1 text-gray-400 hover:text-red-500 transition-colors self-start">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Discount Code */}
      {showDiscountInput && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Discount code"
              defaultValue={discountCode}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
            <button className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors">
              Apply
            </button>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="p-6 bg-gray-50 space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium text-gray-900">{currency}{calculatedSubtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Shipping</span>
          <span className="font-medium text-gray-900">{currency}{shipping.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Tax</span>
          <span className="font-medium text-gray-900">{currency}{calculatedTax.toFixed(2)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount</span>
            <span className="font-medium">-{currency}{discount.toFixed(2)}</span>
          </div>
        )}
        <div className="border-t border-gray-200 pt-3 mt-3">
          <div className="flex justify-between">
            <span className="font-semibold text-gray-900">Total</span>
            <span className="text-2xl font-bold text-gray-900">{currency}{total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Checkout Button */}
      <div className="p-6 pt-0">
        <a
          href={checkoutLink}
          className="block w-full py-3 bg-indigo-600 text-white text-center font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
        >
          {checkoutText}
        </a>
        <p className="text-center text-sm text-gray-500 mt-3">
          <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Secure checkout powered by Stripe
        </p>
      </div>
    </div>
  )
}

CartSummary.displayName = 'CartSummary'

CartSummary.config = {
  id: 'cart-summary',
  name: 'Cart Summary',
  category: 'ecommerce',
  description: 'Shopping cart summary with checkout',
  defaultProps: {
    items: defaultItems,
    currency: '$',
    shipping: 9.99,
    discount: 0,
    showItems: true,
    showDiscountInput: true,
    checkoutText: 'Proceed to Checkout',
    checkoutLink: '#',
    variant: 'detailed',
  },
  editableFields: [
    { name: 'items', label: 'Cart Items', type: 'array' },
    { name: 'currency', label: 'Currency', type: 'text', defaultValue: '$' },
    { name: 'subtotal', label: 'Subtotal (Override)', type: 'number' },
    { name: 'shipping', label: 'Shipping', type: 'number', defaultValue: 9.99 },
    { name: 'tax', label: 'Tax (Override)', type: 'number' },
    { name: 'discount', label: 'Discount', type: 'number', defaultValue: 0 },
    { name: 'discountCode', label: 'Discount Code', type: 'text' },
    { name: 'showItems', label: 'Show Items', type: 'boolean', defaultValue: true },
    { name: 'showDiscountInput', label: 'Show Discount Input', type: 'boolean', defaultValue: true },
    { name: 'checkoutText', label: 'Checkout Text', type: 'text', defaultValue: 'Proceed to Checkout' },
    { name: 'checkoutLink', label: 'Checkout Link', type: 'url' },
    { name: 'variant', label: 'Variant', type: 'select', options: ['simple', 'detailed', 'mini'], defaultValue: 'detailed' },
  ],
}
