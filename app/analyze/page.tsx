'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { useAnalysisStore } from '@/lib/store/analysisStore'

// Step components will be built by other agents, stub for now
// import UrlInputStep from '@/components/analyze/UrlInputStep'
// import ScreenshotStep from '@/components/analyze/ScreenshotStep'
// import ProcessingStep from '@/components/analyze/ProcessingStep'
// import ReportStep from '@/components/analyze/ReportStep'

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
    // Check if any platforms need screenshots
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

  const handleStartNew = () => {
    useAnalysisStore.getState().reset()
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-8">
          {/* Step Indicator - will be imported once built */}
          <div className="mb-8">
            <StepIndicatorPlaceholder currentStep={step} />
          </div>

          {/* Step Content */}
          {step === 'urls' && (
            <UrlInputPlaceholder onNext={handleNextFromUrls} />
          )}
          {step === 'screenshots' && (
            <div className="text-center py-12 text-gray-500">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Screenshots</h2>
              <p>Screenshot upload step — coming in IT5</p>
              <div className="mt-6 flex gap-3 justify-center">
                <button
                  onClick={handleBackToUrls}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={handleNextFromScreenshots}
                  className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800"
                >
                  Skip for Now
                </button>
              </div>
            </div>
          )}
          {step === 'processing' && (
            <div className="text-center py-12 text-gray-500">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Analyzing...</h2>
              <p>Analysis processing step — coming in IT6</p>
            </div>
          )}
          {step === 'report' && (
            <div className="text-center py-12 text-gray-500">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Report</h2>
              <p>Report display — coming in IT7</p>
              <button
                onClick={handleStartNew}
                className="mt-4 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Start New Analysis
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

// Temporary placeholder components until IT3-01 agent delivers them
function StepIndicatorPlaceholder({ currentStep }: { currentStep: string }) {
  const steps = [
    { key: 'urls', label: '1. Add Links' },
    { key: 'screenshots', label: '2. Screenshots' },
    { key: 'processing', label: '3. Analyzing' },
    { key: 'report', label: '4. Report' },
  ]
  return (
    <div className="flex items-center justify-center gap-4" role="navigation" aria-label="Analysis steps">
      {steps.map((s, i) => (
        <div key={s.key} className="flex items-center gap-2">
          <span
            className={`text-sm ${s.key === currentStep ? 'font-semibold text-gray-900' : 'text-gray-400'}`}
          >
            {s.label}
          </span>
          {i < steps.length - 1 && <span className="text-gray-300">&mdash;</span>}
        </div>
      ))}
    </div>
  )
}

function UrlInputPlaceholder({ onNext }: { onNext: () => void }) {
  return (
    <div className="text-center py-12">
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Add Your Platform Links</h2>
      <p className="text-gray-600 mb-6">URL input components — being built by IT3-01 agent</p>
      <p className="text-sm text-gray-400 mb-4">This placeholder will be replaced when UrlInputStep is ready</p>
      <button
        onClick={onNext}
        className="px-6 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800"
      >
        Next (Demo)
      </button>
    </div>
  )
}
