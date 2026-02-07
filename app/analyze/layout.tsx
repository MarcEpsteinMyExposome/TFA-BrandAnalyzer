import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Analyze Your Brand | Tech For Artists',
  description:
    'Enter your platform links and get an AI-powered brand health report.',
  openGraph: {
    title: 'Analyze Your Brand | Tech For Artists',
    description:
      'Enter your platform links and get an AI-powered brand health report.',
  },
}

export default function AnalyzeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
