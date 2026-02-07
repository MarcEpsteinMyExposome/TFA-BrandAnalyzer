'use client'

import { useAnalysisStore } from '@/lib/store/analysisStore'
import BrandReport from '@/components/report/BrandReport'
import Button from '@/components/ui/Button'

interface ReportStepProps {
  onStartNew: () => void
}

export default function ReportStep({ onStartNew }: ReportStepProps) {
  const report = useAnalysisStore((state) => state.report)

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

  return <BrandReport report={report} onStartNew={onStartNew} />
}
