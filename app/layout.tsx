import type { Metadata } from 'next'
import './globals.css'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://brandhealth.techforartists.com'

export const metadata: Metadata = {
  title: 'Brand Health Analyzer | Tech For Artists',
  description:
    'Free AI-powered brand health analysis for artists. Check your online presence for consistency and completeness across all platforms.',
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    title: 'Brand Health Analyzer | Tech For Artists',
    description:
      'Free AI-powered brand health analysis for artists. Check your online presence for consistency and completeness across all platforms.',
    type: 'website',
    siteName: 'Tech For Artists',
    url: siteUrl,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Brand Health Analyzer | Tech For Artists',
    description:
      'Free AI-powered brand health analysis for artists. Check your online presence for consistency and completeness across all platforms.',
  },
  metadataBase: new URL(siteUrl),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased min-h-screen flex flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-gray-900 focus:text-white focus:px-4 focus:py-2 focus:rounded-md focus:text-sm focus:font-medium"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  )
}
