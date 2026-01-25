'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { pageStyles } from '@/lib/theme'
import { Menu, X } from 'lucide-react'

const navLinks = [
  { href: '/features', label: 'Features' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export default function Nav() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className={pageStyles.nav.wrapper}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logos/forma-logo-mark.png"
            alt="FORMA - AI-Powered React App Builder"
            width={128}
            height={118}
            className="h-8 w-auto md:hidden"
          />
          <Image
            src="/logos/forma-logo-full.png"
            alt="FORMA - AI-Powered React App Builder"
            width={360}
            height={98}
            className="h-8 w-auto hidden md:block"
          />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={pathname === link.href ? pageStyles.nav.linkActive : pageStyles.nav.link}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden sm:flex items-center gap-4">
          <Link href="/auth" className={pageStyles.nav.link}>
            Sign In
          </Link>
          <span className="rgb-border-nav">
            <Link href="/auth?mode=register" className="block px-4 py-2 rounded-lg bg-violet-500/20 text-white font-medium hover:bg-violet-500/30 transition">
              Get Started
            </Link>
          </span>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-white/70 hover:text-white transition"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-forma-950/95 backdrop-blur-lg">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-lg transition ${
                  pathname === link.href
                    ? 'bg-violet-500/20 text-white'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 mt-4 border-t border-white/10 space-y-2">
              <Link
                href="/auth"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 rounded-lg text-white/70 hover:bg-white/5 hover:text-white transition"
              >
                Sign In
              </Link>
              <Link
                href="/auth?mode=register"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 rounded-lg bg-violet-500 text-white font-medium text-center hover:bg-violet-600 transition"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .rgb-border-nav {
          padding: 1px;
          border-radius: 0.55rem;
          background: linear-gradient(90deg, rgba(139,92,246,0.45), rgba(236,72,153,0.45), rgba(34,211,238,0.45), rgba(139,92,246,0.45));
          background-size: 300% 100%;
          animation: rgbMove 24s linear infinite;
        }
        @keyframes rgbMove {
          0% { background-position: 0% 50%; }
          100% { background-position: 300% 50%; }
        }
      `}</style>
    </nav>
  )
}
