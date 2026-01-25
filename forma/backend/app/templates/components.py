"""Native Component Library Templates for FORMA"""

from typing import Dict, List, Any

# =============================================================================
# NAVBAR TEMPLATES
# =============================================================================

NAVBAR_SIMPLE = {
    "id": "navbar-simple",
    "name": "Simple Navbar",
    "category": "navbar",
    "description": "Clean, minimal navigation bar with logo and links",
    "tags": ["navbar", "navigation", "header", "minimal"],
    "preview_image": None,
    "code": '''export default function Navbar() {
  return (
    <nav className="w-full bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <span className="text-xl font-bold text-gray-900">Logo</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-gray-600 hover:text-gray-900 transition">Home</a>
            <a href="#" className="text-gray-600 hover:text-gray-900 transition">About</a>
            <a href="#" className="text-gray-600 hover:text-gray-900 transition">Services</a>
            <a href="#" className="text-gray-600 hover:text-gray-900 transition">Contact</a>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <button className="px-4 py-2 text-gray-600 hover:text-gray-900 transition">
              Sign In
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Get Started
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}''',
    "styles": ""
}

NAVBAR_CENTERED = {
    "id": "navbar-centered",
    "name": "Centered Navbar",
    "category": "navbar",
    "description": "Navigation with centered logo and links on sides",
    "tags": ["navbar", "navigation", "header", "centered"],
    "preview_image": None,
    "code": '''export default function NavbarCentered() {
  return (
    <nav className="w-full bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="hidden md:flex items-center space-x-6">
            <a href="#" className="text-gray-600 hover:text-gray-900 transition">Products</a>
            <a href="#" className="text-gray-600 hover:text-gray-900 transition">Solutions</a>
          </div>
          <div className="flex items-center">
            <span className="text-2xl font-bold text-gray-900">BRAND</span>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <a href="#" className="text-gray-600 hover:text-gray-900 transition">Pricing</a>
            <a href="#" className="text-gray-600 hover:text-gray-900 transition">Contact</a>
          </div>
        </div>
      </div>
    </nav>
  )
}''',
    "styles": ""
}

NAVBAR_DARK = {
    "id": "navbar-dark",
    "name": "Dark Navbar",
    "category": "navbar",
    "description": "Sleek dark navigation bar with gradient accent",
    "tags": ["navbar", "navigation", "header", "dark", "modern"],
    "preview_image": None,
    "code": '''export default function NavbarDark() {
  return (
    <nav className="w-full bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <span className="text-xl font-bold text-white">Logo</span>
            <div className="hidden md:flex items-center space-x-6">
              <a href="#" className="text-gray-300 hover:text-white transition">Features</a>
              <a href="#" className="text-gray-300 hover:text-white transition">Pricing</a>
              <a href="#" className="text-gray-300 hover:text-white transition">Docs</a>
              <a href="#" className="text-gray-300 hover:text-white transition">Blog</a>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <button className="px-4 py-2 text-gray-300 hover:text-white transition">
              Log In
            </button>
            <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:opacity-90 transition">
              Sign Up Free
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}''',
    "styles": ""
}

NAVBAR_WITH_DROPDOWN = {
    "id": "navbar-dropdown",
    "name": "Navbar with Dropdown",
    "category": "navbar",
    "description": "Navigation with dropdown menus for nested content",
    "tags": ["navbar", "navigation", "header", "dropdown", "menu"],
    "preview_image": None,
    "code": '''import { useState } from 'react'

export default function NavbarDropdown() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="w-full bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <span className="text-xl font-bold text-gray-900">Logo</span>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <a href="#" className="text-gray-600 hover:text-gray-900 transition">Home</a>
            <div className="relative">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center text-gray-600 hover:text-gray-900 transition"
              >
                Products
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                  <a href="#" className="block px-4 py-2 text-gray-600 hover:bg-gray-50">Product 1</a>
                  <a href="#" className="block px-4 py-2 text-gray-600 hover:bg-gray-50">Product 2</a>
                  <a href="#" className="block px-4 py-2 text-gray-600 hover:bg-gray-50">Product 3</a>
                </div>
              )}
            </div>
            <a href="#" className="text-gray-600 hover:text-gray-900 transition">About</a>
            <a href="#" className="text-gray-600 hover:text-gray-900 transition">Contact</a>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Get Started
          </button>
        </div>
      </div>
    </nav>
  )
}''',
    "styles": ""
}

# =============================================================================
# FOOTER TEMPLATES
# =============================================================================

FOOTER_SIMPLE = {
    "id": "footer-simple",
    "name": "Simple Footer",
    "category": "footer",
    "description": "Minimal footer with copyright and basic links",
    "tags": ["footer", "minimal", "simple"],
    "preview_image": None,
    "code": '''export default function Footer() {
  return (
    <footer className="w-full bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-600 mb-4 md:mb-0">
            © 2024 Company Name. All rights reserved.
          </div>
          <div className="flex items-center space-x-6">
            <a href="#" className="text-gray-500 hover:text-gray-700 transition">Privacy</a>
            <a href="#" className="text-gray-500 hover:text-gray-700 transition">Terms</a>
            <a href="#" className="text-gray-500 hover:text-gray-700 transition">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  )
}''',
    "styles": ""
}

FOOTER_MULTICOLUMN = {
    "id": "footer-multicolumn",
    "name": "Multi-Column Footer",
    "category": "footer",
    "description": "Full footer with multiple link columns and newsletter",
    "tags": ["footer", "links", "newsletter", "comprehensive"],
    "preview_image": None,
    "code": '''export default function FooterMultiColumn() {
  return (
    <footer className="w-full bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition">Features</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition">Pricing</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition">Integrations</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition">API</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition">About</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition">Blog</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition">Careers</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition">Press</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition">Documentation</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition">Help Center</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition">Community</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition">Tutorials</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Newsletter</h3>
            <p className="text-gray-400 mb-4">Stay updated with our latest news.</p>
            <div className="flex">
              <input
                type="email"
                placeholder="Enter email"
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-l-lg focus:outline-none focus:border-blue-500"
              />
              <button className="px-4 py-2 bg-blue-600 rounded-r-lg hover:bg-blue-700 transition">
                Subscribe
              </button>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-400 mb-4 md:mb-0">
            © 2024 Company Name. All rights reserved.
          </div>
          <div className="flex items-center space-x-4">
            <a href="#" className="text-gray-400 hover:text-white transition">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}''',
    "styles": ""
}

FOOTER_CENTERED = {
    "id": "footer-centered",
    "name": "Centered Footer",
    "category": "footer",
    "description": "Centered footer with social icons and links",
    "tags": ["footer", "centered", "social", "minimal"],
    "preview_image": None,
    "code": '''export default function FooterCentered() {
  return (
    <footer className="w-full bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold text-gray-900 mb-6">BRAND</span>
          <div className="flex items-center space-x-8 mb-6">
            <a href="#" className="text-gray-600 hover:text-gray-900 transition">About</a>
            <a href="#" className="text-gray-600 hover:text-gray-900 transition">Blog</a>
            <a href="#" className="text-gray-600 hover:text-gray-900 transition">Careers</a>
            <a href="#" className="text-gray-600 hover:text-gray-900 transition">Press</a>
            <a href="#" className="text-gray-600 hover:text-gray-900 transition">Support</a>
          </div>
          <div className="flex items-center space-x-6 mb-6">
            <a href="#" className="text-gray-400 hover:text-gray-600 transition">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-600 transition">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-600 transition">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>
          </div>
          <div className="text-gray-500 text-sm">
            © 2024 Brand Name. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  )
}''',
    "styles": ""
}

# =============================================================================
# HERO SECTION TEMPLATES
# =============================================================================

HERO_CENTERED = {
    "id": "hero-centered",
    "name": "Centered Hero",
    "category": "hero",
    "description": "Classic centered hero with headline, subtext, and CTA buttons",
    "tags": ["hero", "centered", "cta", "landing"],
    "preview_image": None,
    "code": '''export default function HeroCentered() {
  return (
    <section className="w-full bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Build something amazing
          <span className="text-blue-600"> together</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          The modern platform for teams to collaborate, create, and ship products faster than ever before.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button className="px-8 py-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">
            Get Started Free
          </button>
          <button className="px-8 py-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition">
            Learn More
          </button>
        </div>
        <p className="mt-6 text-sm text-gray-500">
          No credit card required · Free 14-day trial
        </p>
      </div>
    </section>
  )
}''',
    "styles": ""
}

HERO_SPLIT = {
    "id": "hero-split",
    "name": "Split Hero",
    "category": "hero",
    "description": "Two-column hero with text and image/graphic",
    "tags": ["hero", "split", "image", "landing"],
    "preview_image": None,
    "code": '''export default function HeroSplit() {
  return (
    <section className="w-full bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              New Release
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mt-6 mb-6">
              The future of work is here
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Streamline your workflow with our all-in-one platform. Designed for teams who want to move fast and build great things.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">
                Start Building
              </button>
              <button className="px-6 py-3 flex items-center justify-center gap-2 text-gray-700 hover:text-gray-900 transition">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                Watch Demo
              </button>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl h-96 flex items-center justify-center">
            <span className="text-white text-lg">Your Image Here</span>
          </div>
        </div>
      </div>
    </section>
  )
}''',
    "styles": ""
}

HERO_GRADIENT = {
    "id": "hero-gradient",
    "name": "Gradient Hero",
    "category": "hero",
    "description": "Bold gradient background hero section",
    "tags": ["hero", "gradient", "bold", "modern"],
    "preview_image": None,
    "code": '''export default function HeroGradient() {
  return (
    <section className="w-full bg-gradient-to-br from-purple-700 via-blue-600 to-cyan-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
          Transform your ideas into reality
        </h1>
        <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8">
          Join thousands of creators who are building the next generation of digital products.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button className="px-8 py-4 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition">
            Get Started
          </button>
          <button className="px-8 py-4 border-2 border-white text-white rounded-lg font-medium hover:bg-white/10 transition">
            See Examples
          </button>
        </div>
      </div>
    </section>
  )
}''',
    "styles": ""
}

HERO_MINIMAL = {
    "id": "hero-minimal",
    "name": "Minimal Hero",
    "category": "hero",
    "description": "Clean, typography-focused hero section",
    "tags": ["hero", "minimal", "clean", "typography"],
    "preview_image": None,
    "code": '''export default function HeroMinimal() {
  return (
    <section className="w-full bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <h1 className="text-5xl md:text-7xl font-light text-gray-900 mb-8 leading-tight">
          Simple tools for
          <br />
          <span className="font-semibold">complex problems</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl">
          We build software that helps teams work smarter, not harder.
        </p>
        <a href="#" className="inline-flex items-center text-lg text-gray-900 font-medium hover:text-blue-600 transition">
          Explore our products
          <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </a>
      </div>
    </section>
  )
}''',
    "styles": ""
}

# =============================================================================
# SIDEBAR TEMPLATES
# =============================================================================

SIDEBAR_SIMPLE = {
    "id": "sidebar-simple",
    "name": "Simple Sidebar",
    "category": "sidebar",
    "description": "Basic sidebar navigation with icons",
    "tags": ["sidebar", "navigation", "dashboard", "simple"],
    "preview_image": None,
    "code": '''export default function Sidebar() {
  const menuItems = [
    { icon: '🏠', label: 'Dashboard', active: true },
    { icon: '📊', label: 'Analytics', active: false },
    { icon: '👥', label: 'Users', active: false },
    { icon: '📁', label: 'Projects', active: false },
    { icon: '⚙️', label: 'Settings', active: false },
  ]

  return (
    <aside className="w-64 h-screen bg-white border-r border-gray-200">
      <div className="p-6">
        <span className="text-xl font-bold text-gray-900">Dashboard</span>
      </div>
      <nav className="px-4">
        {menuItems.map((item, index) => (
          <a
            key={index}
            href="#"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition ${
              item.active
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </a>
        ))}
      </nav>
    </aside>
  )
}''',
    "styles": ""
}

SIDEBAR_DARK = {
    "id": "sidebar-dark",
    "name": "Dark Sidebar",
    "category": "sidebar",
    "description": "Dark themed sidebar with sections",
    "tags": ["sidebar", "navigation", "dashboard", "dark"],
    "preview_image": None,
    "code": '''export default function SidebarDark() {
  return (
    <aside className="w-64 h-screen bg-gray-900 text-white">
      <div className="p-6 border-b border-gray-800">
        <span className="text-xl font-bold">AppName</span>
      </div>
      <nav className="p-4">
        <div className="mb-6">
          <span className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Main
          </span>
          <div className="mt-2 space-y-1">
            <a href="#" className="flex items-center gap-3 px-4 py-2 rounded-lg bg-gray-800 text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Dashboard</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>Analytics</span>
            </a>
          </div>
        </div>
        <div className="mb-6">
          <span className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Management
          </span>
          <div className="mt-2 space-y-1">
            <a href="#" className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span>Team</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <span>Projects</span>
            </a>
          </div>
        </div>
      </nav>
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
          <div>
            <p className="font-medium text-sm">John Doe</p>
            <p className="text-xs text-gray-500">john@example.com</p>
          </div>
        </div>
      </div>
    </aside>
  )
}''',
    "styles": ""
}

SIDEBAR_COLLAPSIBLE = {
    "id": "sidebar-collapsible",
    "name": "Collapsible Sidebar",
    "category": "sidebar",
    "description": "Sidebar that can collapse to icons only",
    "tags": ["sidebar", "navigation", "collapsible", "responsive"],
    "preview_image": None,
    "code": '''import { useState } from 'react'

export default function SidebarCollapsible() {
  const [collapsed, setCollapsed] = useState(false)

  const menuItems = [
    { icon: '🏠', label: 'Home' },
    { icon: '📊', label: 'Reports' },
    { icon: '👥', label: 'Users' },
    { icon: '💬', label: 'Messages' },
    { icon: '⚙️', label: 'Settings' },
  ]

  return (
    <aside className={`h-screen bg-white border-r border-gray-200 transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!collapsed && <span className="text-xl font-bold">Menu</span>}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-gray-100 transition"
        >
          <svg className={`w-5 h-5 transition-transform ${collapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      </div>
      <nav className="p-4">
        {menuItems.map((item, index) => (
          <a
            key={index}
            href="#"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-600 hover:bg-gray-100 transition ${collapsed ? 'justify-center' : ''}`}
            title={collapsed ? item.label : undefined}
          >
            <span className="text-xl">{item.icon}</span>
            {!collapsed && <span className="font-medium">{item.label}</span>}
          </a>
        ))}
      </nav>
    </aside>
  )
}''',
    "styles": ""
}

# =============================================================================
# SECTION TEMPLATES
# =============================================================================

SECTION_FEATURES = {
    "id": "section-features",
    "name": "Features Grid",
    "category": "section",
    "description": "Three-column feature showcase grid",
    "tags": ["section", "features", "grid", "cards"],
    "preview_image": None,
    "code": '''export default function FeaturesSection() {
  const features = [
    {
      icon: '⚡',
      title: 'Lightning Fast',
      description: 'Built with performance in mind. Load times under 100ms guaranteed.'
    },
    {
      icon: '🔒',
      title: 'Secure by Default',
      description: 'Enterprise-grade security with end-to-end encryption.'
    },
    {
      icon: '🎨',
      title: 'Beautiful Design',
      description: 'Crafted with attention to every pixel and interaction.'
    },
    {
      icon: '📱',
      title: 'Mobile Ready',
      description: 'Responsive design that works perfectly on any device.'
    },
    {
      icon: '🔧',
      title: 'Easy Integration',
      description: 'Connect with your favorite tools in just a few clicks.'
    },
    {
      icon: '📊',
      title: 'Real-time Analytics',
      description: 'Get insights into your performance with detailed reports.'
    },
  ]

  return (
    <section className="w-full bg-gray-50 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything you need
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Powerful features to help you build, deploy, and scale your projects.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}''',
    "styles": ""
}

SECTION_TESTIMONIALS = {
    "id": "section-testimonials",
    "name": "Testimonials",
    "category": "section",
    "description": "Customer testimonial cards section",
    "tags": ["section", "testimonials", "social proof", "cards"],
    "preview_image": None,
    "code": '''export default function TestimonialsSection() {
  const testimonials = [
    {
      quote: "This product has completely transformed how our team works. We've seen a 40% increase in productivity.",
      author: "Sarah Johnson",
      role: "CEO, TechCorp",
      avatar: "SJ"
    },
    {
      quote: "The best investment we've made this year. The support team is incredible and the features are exactly what we needed.",
      author: "Michael Chen",
      role: "CTO, StartupXYZ",
      avatar: "MC"
    },
    {
      quote: "I've tried many similar products, but this one stands out for its simplicity and power. Highly recommended!",
      author: "Emily Davis",
      role: "Designer, Creative Co",
      avatar: "ED"
    },
  ]

  return (
    <section className="w-full bg-white py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Loved by teams worldwide
          </h2>
          <p className="text-xl text-gray-600">
            See what our customers have to say about us.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((item, index) => (
            <div key={index} className="bg-gray-50 p-8 rounded-xl">
              <p className="text-gray-700 mb-6 italic">"{item.quote}"</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                  {item.avatar}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{item.author}</p>
                  <p className="text-sm text-gray-500">{item.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}''',
    "styles": ""
}

SECTION_PRICING = {
    "id": "section-pricing",
    "name": "Pricing Cards",
    "category": "section",
    "description": "Three-tier pricing comparison section",
    "tags": ["section", "pricing", "cards", "comparison"],
    "preview_image": None,
    "code": '''export default function PricingSection() {
  const plans = [
    {
      name: 'Starter',
      price: '$9',
      period: '/month',
      description: 'Perfect for individuals and small projects.',
      features: ['5 Projects', '10GB Storage', 'Basic Analytics', 'Email Support'],
      highlighted: false
    },
    {
      name: 'Pro',
      price: '$29',
      period: '/month',
      description: 'Best for growing teams and businesses.',
      features: ['Unlimited Projects', '100GB Storage', 'Advanced Analytics', 'Priority Support', 'API Access'],
      highlighted: true
    },
    {
      name: 'Enterprise',
      price: '$99',
      period: '/month',
      description: 'For large organizations with custom needs.',
      features: ['Everything in Pro', 'Unlimited Storage', 'Custom Integrations', 'Dedicated Support', 'SLA'],
      highlighted: false
    },
  ]

  return (
    <section className="w-full bg-gray-50 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-xl text-gray-600">
            Choose the plan that works best for you.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`rounded-xl p-8 ${
                plan.highlighted
                  ? 'bg-blue-600 text-white ring-4 ring-blue-600 ring-offset-2'
                  : 'bg-white border border-gray-200'
              }`}
            >
              <h3 className={`text-xl font-semibold mb-2 ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                {plan.name}
              </h3>
              <div className="mb-4">
                <span className={`text-4xl font-bold ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                  {plan.price}
                </span>
                <span className={plan.highlighted ? 'text-blue-100' : 'text-gray-500'}>
                  {plan.period}
                </span>
              </div>
              <p className={`mb-6 ${plan.highlighted ? 'text-blue-100' : 'text-gray-600'}`}>
                {plan.description}
              </p>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <svg className={`w-5 h-5 ${plan.highlighted ? 'text-blue-200' : 'text-green-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className={plan.highlighted ? 'text-white' : 'text-gray-700'}>{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                className={`w-full py-3 rounded-lg font-medium transition ${
                  plan.highlighted
                    ? 'bg-white text-blue-600 hover:bg-blue-50'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Get Started
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}''',
    "styles": ""
}

SECTION_CTA = {
    "id": "section-cta",
    "name": "Call to Action",
    "category": "section",
    "description": "Bold call-to-action banner section",
    "tags": ["section", "cta", "banner", "conversion"],
    "preview_image": None,
    "code": '''export default function CTASection() {
  return (
    <section className="w-full bg-blue-600 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Ready to get started?
        </h2>
        <p className="text-xl text-blue-100 mb-8">
          Join thousands of satisfied customers who have already transformed their workflow.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button className="px-8 py-4 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition">
            Start Free Trial
          </button>
          <button className="px-8 py-4 border-2 border-white text-white rounded-lg font-medium hover:bg-white/10 transition">
            Contact Sales
          </button>
        </div>
      </div>
    </section>
  )
}''',
    "styles": ""
}

SECTION_STATS = {
    "id": "section-stats",
    "name": "Statistics",
    "category": "section",
    "description": "Key metrics and statistics display",
    "tags": ["section", "stats", "metrics", "numbers"],
    "preview_image": None,
    "code": '''export default function StatsSection() {
  const stats = [
    { value: '10M+', label: 'Active Users' },
    { value: '99.9%', label: 'Uptime' },
    { value: '150+', label: 'Countries' },
    { value: '24/7', label: 'Support' },
  ]

  return (
    <section className="w-full bg-gray-900 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, index) => (
            <div key={index}>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                {stat.value}
              </div>
              <div className="text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}''',
    "styles": ""
}

SECTION_FAQ = {
    "id": "section-faq",
    "name": "FAQ Accordion",
    "category": "section",
    "description": "Frequently asked questions with accordion",
    "tags": ["section", "faq", "accordion", "support"],
    "preview_image": None,
    "code": '''import { useState } from 'react'

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0)

  const faqs = [
    {
      question: 'How do I get started?',
      answer: 'Getting started is easy! Simply sign up for a free account, and you can begin using our platform immediately. We also offer a comprehensive onboarding guide to help you make the most of our features.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for enterprise customers. All payments are processed securely through Stripe.'
    },
    {
      question: 'Can I cancel my subscription at any time?',
      answer: 'Yes, you can cancel your subscription at any time. If you cancel, you will continue to have access until the end of your billing period. We do not offer refunds for partial months.'
    },
    {
      question: 'Do you offer customer support?',
      answer: 'We offer 24/7 customer support via email and live chat. Enterprise customers also get access to dedicated phone support and a personal account manager.'
    },
  ]

  return (
    <section className="w-full bg-white py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600">
            Got questions? We've got answers.
          </p>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition"
              >
                <span className="font-medium text-gray-900">{faq.question}</span>
                <svg
                  className={`w-5 h-5 text-gray-500 transition-transform ${openIndex === index ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openIndex === index && (
                <div className="px-6 py-4 text-gray-600">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}''',
    "styles": ""
}

# =============================================================================
# THEME CONFIGURATIONS
# =============================================================================

THEMES = {
    "light": {
        "id": "theme-light",
        "name": "Light Theme",
        "description": "Clean light theme with neutral colors",
        "colors": {
            "background": "#ffffff",
            "foreground": "#111827",
            "primary": "#3b82f6",
            "primary-foreground": "#ffffff",
            "secondary": "#f3f4f6",
            "secondary-foreground": "#111827",
            "accent": "#f3f4f6",
            "accent-foreground": "#111827",
            "muted": "#f3f4f6",
            "muted-foreground": "#6b7280",
            "border": "#e5e7eb",
            "card": "#ffffff",
            "card-foreground": "#111827"
        }
    },
    "dark": {
        "id": "theme-dark",
        "name": "Dark Theme",
        "description": "Modern dark theme for reduced eye strain",
        "colors": {
            "background": "#0f172a",
            "foreground": "#f8fafc",
            "primary": "#3b82f6",
            "primary-foreground": "#ffffff",
            "secondary": "#1e293b",
            "secondary-foreground": "#f8fafc",
            "accent": "#1e293b",
            "accent-foreground": "#f8fafc",
            "muted": "#1e293b",
            "muted-foreground": "#94a3b8",
            "border": "#334155",
            "card": "#1e293b",
            "card-foreground": "#f8fafc"
        }
    },
    "midnight": {
        "id": "theme-midnight",
        "name": "Midnight Theme",
        "description": "Deep purple dark theme",
        "colors": {
            "background": "#0d0d1a",
            "foreground": "#f8fafc",
            "primary": "#8b5cf6",
            "primary-foreground": "#ffffff",
            "secondary": "#1a1a2e",
            "secondary-foreground": "#f8fafc",
            "accent": "#1a1a2e",
            "accent-foreground": "#f8fafc",
            "muted": "#1a1a2e",
            "muted-foreground": "#a78bfa",
            "border": "#2d2d4a",
            "card": "#1a1a2e",
            "card-foreground": "#f8fafc"
        }
    },
    "forest": {
        "id": "theme-forest",
        "name": "Forest Theme",
        "description": "Nature-inspired green theme",
        "colors": {
            "background": "#0f1f0f",
            "foreground": "#f0fdf4",
            "primary": "#22c55e",
            "primary-foreground": "#ffffff",
            "secondary": "#14532d",
            "secondary-foreground": "#f0fdf4",
            "accent": "#14532d",
            "accent-foreground": "#f0fdf4",
            "muted": "#14532d",
            "muted-foreground": "#86efac",
            "border": "#166534",
            "card": "#14532d",
            "card-foreground": "#f0fdf4"
        }
    },
    "ocean": {
        "id": "theme-ocean",
        "name": "Ocean Theme",
        "description": "Calming blue ocean theme",
        "colors": {
            "background": "#0c1929",
            "foreground": "#f0f9ff",
            "primary": "#0ea5e9",
            "primary-foreground": "#ffffff",
            "secondary": "#0f2942",
            "secondary-foreground": "#f0f9ff",
            "accent": "#0f2942",
            "accent-foreground": "#f0f9ff",
            "muted": "#0f2942",
            "muted-foreground": "#7dd3fc",
            "border": "#164e63",
            "card": "#0f2942",
            "card-foreground": "#f0f9ff"
        }
    }
}

# =============================================================================
# STYLE PRESETS
# =============================================================================

STYLE_PRESETS = {
    "rounded": {
        "id": "style-rounded",
        "name": "Rounded",
        "description": "Soft, rounded corners throughout",
        "borderRadius": "0.75rem"
    },
    "sharp": {
        "id": "style-sharp",
        "name": "Sharp",
        "description": "Clean, sharp edges",
        "borderRadius": "0"
    },
    "pill": {
        "id": "style-pill",
        "name": "Pill",
        "description": "Fully rounded pill shapes",
        "borderRadius": "9999px"
    },
    "subtle": {
        "id": "style-subtle",
        "name": "Subtle",
        "description": "Slightly rounded corners",
        "borderRadius": "0.25rem"
    }
}

# =============================================================================
# EXPORT ALL TEMPLATES
# =============================================================================

ALL_TEMPLATES: List[Dict[str, Any]] = [
    # Navbars
    NAVBAR_SIMPLE,
    NAVBAR_CENTERED,
    NAVBAR_DARK,
    NAVBAR_WITH_DROPDOWN,
    # Footers
    FOOTER_SIMPLE,
    FOOTER_MULTICOLUMN,
    FOOTER_CENTERED,
    # Heroes
    HERO_CENTERED,
    HERO_SPLIT,
    HERO_GRADIENT,
    HERO_MINIMAL,
    # Sidebars
    SIDEBAR_SIMPLE,
    SIDEBAR_DARK,
    SIDEBAR_COLLAPSIBLE,
    # Sections
    SECTION_FEATURES,
    SECTION_TESTIMONIALS,
    SECTION_PRICING,
    SECTION_CTA,
    SECTION_STATS,
    SECTION_FAQ,
]

def get_templates_by_category(category: str) -> List[Dict[str, Any]]:
    """Get all templates in a specific category."""
    return [t for t in ALL_TEMPLATES if t["category"] == category]

def get_template_by_id(template_id: str) -> Dict[str, Any] | None:
    """Get a specific template by its ID."""
    for template in ALL_TEMPLATES:
        if template["id"] == template_id:
            return template
    return None

def get_all_categories() -> List[str]:
    """Get list of all available categories."""
    return list(set(t["category"] for t in ALL_TEMPLATES))

def get_theme(theme_id: str) -> Dict[str, Any] | None:
    """Get a theme configuration by ID."""
    return THEMES.get(theme_id)

def get_all_themes() -> Dict[str, Dict[str, Any]]:
    """Get all theme configurations."""
    return THEMES

def get_style_preset(preset_id: str) -> Dict[str, Any] | None:
    """Get a style preset by ID."""
    return STYLE_PRESETS.get(preset_id)

def get_all_style_presets() -> Dict[str, Dict[str, Any]]:
    """Get all style presets."""
    return STYLE_PRESETS
