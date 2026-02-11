'use client'

import Link from 'next/link'
import Image from 'next/image'
import { pageStyles } from '@/lib/theme'

const footerLinks = {
  product: [
    { href: '/features', label: 'Features' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/marketplace', label: 'Marketplace' },
  ],
  company: [
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
    { href: '/faq', label: 'FAQ' },
  ],
  legal: [
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms of Service' },
  ],
}

export default function Footer() {
  return (
    <footer className={pageStyles.footer.wrapper}>
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Image
                src="/logos/forma-logo-full.png"
                alt="FORMA - AI-Powered React App Builder"
                width={550}
                height={584}
                className="h-7 w-auto"
              />
            </Link>
            <p className={pageStyles.footer.copyright}>
              AI-powered React development platform.
            </p>
          </div>
          <div>
            <h4 className={pageStyles.footer.heading}>Product</h4>
            <ul className="space-y-2 text-sm">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={pageStyles.footer.link}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className={pageStyles.footer.heading}>Company</h4>
            <ul className="space-y-2 text-sm">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={pageStyles.footer.link}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className={pageStyles.footer.heading}>Legal</h4>
            <ul className="space-y-2 text-sm">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={pageStyles.footer.link}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className={pageStyles.footer.copyright}>
            &copy; {new Date().getFullYear()} FORMA. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
