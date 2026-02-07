'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import StepIndicator from '@/components/analyze/StepIndicator'
import UrlInputStep from '@/components/analyze/UrlInputStep'
import ScreenshotStep from '@/components/analyze/ScreenshotStep'
import ProcessingStep from '@/components/analyze/ProcessingStep'
import ReportStep from '@/components/analyze/ReportStep'
import { useAnalysisStore } from '@/lib/store/analysisStore'

export default function AnalyzePage() {
  // Zustand hydration guard
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => { setHydrated(true) }, [])

  const step = useAnalysisStore((state) => state.step)
  const setStep = useAnalysisStore((state) => state.setStep)
  const platforms = useAnalysisStore((state) => state.platforms)

  if (!hydrated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-gray-400">Loading...</div>
        </main>
        <Footer />
      </div>
    )
  }

  // Step navigation handlers
  const handleNextFromUrls = () => {
    const needsScreenshots = platforms.some((p) => !p.fetchable && !p.screenshot)
    if (needsScreenshots) {
      setStep('screenshots')
    } else {
      setStep('processing')
    }
  }

  const handleNextFromScreenshots = () => {
    setStep('processing')
  }

  const handleBackToUrls = () => {
    setStep('urls')
  }

  const handleProcessingComplete = () => {
    setStep('report')
  }

  const handleStartNew = () => {
    useAnalysisStore.getState().reset()
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="mb-8">
            <StepIndicator currentStep={step} />
          </div>

          {step === 'urls' && (
            <UrlInputStep onNext={handleNextFromUrls} />
          )}
          {step === 'screenshots' && (
            <ScreenshotStep
              onNext={handleNextFromScreenshots}
              onBack={handleBackToUrls}
            />
          )}
          {step === 'processing' && (
            <ProcessingStep onComplete={handleProcessingComplete} />
          )}
          {step === 'report' && (
            <ReportStep onStartNew={handleStartNew} />
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
