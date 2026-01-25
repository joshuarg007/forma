'use client'

import { ReactNode } from 'react'
import Nav from './Nav'
import Footer from './Footer'
import CustomCursor from '@/components/ui/CustomCursor'
import { pageStyles } from '@/lib/theme'

interface MarketingLayoutProps {
  children: ReactNode
}

export default function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <div className={`min-h-screen ${pageStyles.background}`}>
      <CustomCursor />
      <Nav />
      <main>{children}</main>
      <Footer />
    </div>
  )
}
