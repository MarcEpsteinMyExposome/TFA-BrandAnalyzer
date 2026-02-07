import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Brand Health Analyzer — Tech For Artists',
  description:
    'Analyze your brand consistency and completeness across all your online platforms. Get actionable insights to strengthen your artist brand.',
  openGraph: {
    title: 'Brand Health Analyzer — Tech For Artists',
    description:
      'Analyze your brand consistency and completeness across all your online platforms.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  )
}
