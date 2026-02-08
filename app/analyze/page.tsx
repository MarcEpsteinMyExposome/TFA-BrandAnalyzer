'use client'

import { useState, useEffect, useRef } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import StepIndicator from '@/components/analyze/StepIndicator'
import UrlInputStep from '@/components/analyze/UrlInputStep'
import ScreenshotStep from '@/components/analyze/ScreenshotStep'
import ProcessingStep from '@/components/analyze/ProcessingStep'
import ReportStep from '@/components/analyze/ReportStep'
import { useAnalysisStore } from '@/lib/store/analysisStore'
import { useAnalysis } from '@/lib/analysis/useAnalysis'

export default function AnalyzePage() {
  // Zustand hydration guard
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => { setHydrated(true) }, [])

  const step = useAnalysisStore((state) => state.step)
  const setStep = useAnalysisStore((state) => state.setStep)
  const platforms = useAnalysisStore((state) => state.platforms)
  const { analyze, streamingText, isAnalyzing, error: analysisError } = useAnalysis()
  const stepContentRef = useRef<HTMLDivElement>(null)
  const isInitialRender = useRef(true)

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false
      return
    }
    if (!hydrated) return
    const heading = stepContentRef.current?.querySelector('h2')
    if (heading) {
      heading.setAttribute('tabindex', '-1')
      heading.focus()
    }
  }, [step, hydrated])

  if (!hydrated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main id="main-content" className="flex-1 flex items-center justify-center">
          <div className="text-gray-600">Loading...</div>
        </main>
        <Footer />
      </div>
    )
  }

  // Step navigation handlers
  const handleNextFromUrls = () => {
    const needsScreenshots = platforms.some((p) => !p.fetchable && (!p.screenshots || p.screenshots.length === 0))
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
    analyze(platforms)
  }

  const handleStartNew = () => {
    useAnalysisStore.getState().reset()
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main id="main-content" className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="mb-8">
            <StepIndicator currentStep={step} />
          </div>

          <div ref={stepContentRef}>
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
              <ReportStep
                onStartNew={handleStartNew}
                isAnalyzing={isAnalyzing}
                streamingText={streamingText}
                error={analysisError}
                onRetryAnalysis={() => analyze(platforms)}
              />
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
