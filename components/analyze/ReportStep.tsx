'use client'

import { useEffect, useRef } from 'react'
import { useAnalysisStore } from '@/lib/store/analysisStore'
import BrandReport from '@/components/report/BrandReport'
import Button from '@/components/ui/Button'

interface ReportStepProps {
  onStartNew: () => void
  isAnalyzing?: boolean
  streamingText?: string
  error?: string | null
  onRetryAnalysis?: () => void
}

export default function ReportStep({
  onStartNew,
  isAnalyzing = false,
  streamingText = '',
  error = null,
  onRetryAnalysis,
}: ReportStepProps) {
  const report = useAnalysisStore((state) => state.report)
  const streamingRef = useRef<HTMLPreElement>(null)

  // Auto-scroll the streaming text box as new content arrives
  useEffect(() => {
    if (streamingRef.current) {
      streamingRef.current.scrollTop = streamingRef.current.scrollHeight
    }
  }, [streamingText])

  // State 1: Analyzing in progress
  if (isAnalyzing) {
    return (
      <div className="py-8" aria-live="polite" aria-busy="true">
        <div className="flex items-center justify-center gap-3 mb-6">
          <svg
            className="animate-spin h-6 w-6 text-gray-700"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <h2 className="text-xl font-semibold text-gray-900">
            Analyzing your brand...
          </h2>
        </div>
        <p className="text-center text-gray-600 mb-6">
          Claude is reviewing your platforms and generating your brand health report. This may take a minute.
        </p>
        {streamingText && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-500 mb-2">
              Analysis preview:
            </p>
            <pre
              ref={streamingRef}
              className="text-sm text-gray-700 whitespace-pre-wrap max-h-64 overflow-y-auto font-mono leading-relaxed"
            >
              {streamingText}
            </pre>
          </div>
        )}
      </div>
    )
  }

  // State 2: Error occurred (no report, not analyzing)
  if (error && !report) {
    return (
      <div className="text-center py-12" aria-live="assertive">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
          <svg
            className="w-6 h-6 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Analysis Failed
        </h2>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">{error}</p>
        <div className="flex items-center justify-center gap-3">
          {onRetryAnalysis && (
            <Button variant="primary" onClick={onRetryAnalysis}>
              Try Again
            </Button>
          )}
          <Button variant="secondary" onClick={onStartNew}>
            Start New Analysis
          </Button>
        </div>
      </div>
    )
  }

  // State 3: No report and not analyzing (shouldn't normally happen, but handle gracefully)
  if (!report) {
    return (
      <div className="text-center py-12" aria-live="polite">
        <p className="text-gray-600 mb-4">No report available.</p>
        <Button variant="primary" onClick={onStartNew}>
          Start New Analysis
        </Button>
      </div>
    )
  }

  // State 4: Report is ready
  return <BrandReport report={report} onStartNew={onStartNew} />
}
