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
import type { AnalysisStep } from '@/lib/store/analysisStore'
import { useAnalysis } from '@/lib/analysis/useAnalysis'

const STEP_ORDER: AnalysisStep[] = ['urls', 'screenshots', 'processing', 'report']

export default function AnalyzePage() {
  // Zustand hydration guard
  const [hydrated, setHydrated] = useState(false)
  const [showResumePrompt, setShowResumePrompt] = useState(false)

  const step = useAnalysisStore((state) => state.step)
  const setStep = useAnalysisStore((state) => state.setStep)
  const platforms = useAnalysisStore((state) => state.platforms)
  const { analyze, streamingText, isAnalyzing, error: analysisError } = useAnalysis()
  const stepContentRef = useRef<HTMLDivElement>(null)
  const isInitialRender = useRef(true)

  // Hydration + session resume check
  useEffect(() => {
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    // After hydration, check if there's an in-progress session to resume
    const currentStep = useAnalysisStore.getState().step
    const currentPlatforms = useAnalysisStore.getState().platforms
    const currentReport = useAnalysisStore.getState().report
    if (currentPlatforms.length > 0 && currentStep !== 'urls') {
      // If we're on the report step but have no report (it's not persisted),
      // go back to processing so the user can re-run the analysis
      if (currentStep === 'report' && !currentReport) {
        useAnalysisStore.getState().setStep('processing')
      }
      setShowResumePrompt(true)
    }
  }, [hydrated])

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
  const handleStepClick = (clickedStep: AnalysisStep) => {
    const currentIndex = STEP_ORDER.indexOf(step)
    const clickedIndex = STEP_ORDER.indexOf(clickedStep)
    // Only allow navigating backwards (to completed steps)
    if (clickedIndex < currentIndex) {
      setStep(clickedStep)
    }
  }

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

  const handleResumeContinue = () => {
    setShowResumePrompt(false)
  }

  const handleResumeStartFresh = () => {
    setShowResumePrompt(false)
    useAnalysisStore.getState().reset()
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main id="main-content" className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-8">
          {/* Session resume prompt */}
          {showResumePrompt && (
            <div
              className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4"
              role="alert"
            >
              <p className="text-sm text-blue-900 mb-3">
                You have a previous analysis in progress with {platforms.length} platform{platforms.length !== 1 ? 's' : ''}. Would you like to continue or start fresh?
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleResumeContinue}
                  className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 transition-colors"
                >
                  Continue
                </button>
                <button
                  type="button"
                  onClick={handleResumeStartFresh}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Start Fresh
                </button>
              </div>
            </div>
          )}

          <div className="mb-8">
            <StepIndicator currentStep={step} onStepClick={handleStepClick} />
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
