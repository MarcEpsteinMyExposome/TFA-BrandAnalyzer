'use client'

import { useState, useEffect } from 'react'
import { useAnalysisStore } from '@/lib/store/analysisStore'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import StepIndicator from './StepIndicator'

interface AnalysisShellProps {
  children: React.ReactNode
}

export default function AnalysisShell({ children }: AnalysisShellProps) {
  const [hydrated, setHydrated] = useState(false)
  const step = useAnalysisStore((state) => state.step)

  useEffect(() => {
    setHydrated(true)
  }, [])

  if (!hydrated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main id="main-content" className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div
              className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-3"
              role="status"
              aria-label="Loading"
            />
            <p className="text-sm text-gray-500">Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main id="main-content" className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <StepIndicator currentStep={step} />
          <div className="mt-6">{children}</div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
