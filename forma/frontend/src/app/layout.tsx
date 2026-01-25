import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://forma.app'),
  title: 'FORMA - AI-Powered React App Builder',
  description: 'Build production-ready React applications with AI. Describe what you want in plain English and get clean, exportable code instantly.',
  keywords: ['React', 'AI', 'component builder', 'web development', 'TypeScript', 'Tailwind CSS', 'no-code', 'low-code'],
  authors: [{ name: 'FORMA' }],
  creator: 'FORMA',
  publisher: 'FORMA',
  openGraph: {
    title: 'FORMA - AI-Powered React App Builder',
    description: 'Build production-ready React applications with AI. Describe what you want and get clean, exportable code instantly.',
    url: 'https://forma.app',
    siteName: 'FORMA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FORMA - AI-Powered React App Builder',
    description: 'Build production-ready React applications with AI.',
  },
  icons: {
    icon: '/logos/forma-favicon.png',
    apple: '/logos/forma-favicon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
