'use client'

import Button from '@/components/ui/Button'

interface ReportActionsProps {
  onStartNew: () => void
}

export default function ReportActions({ onStartNew }: ReportActionsProps) {
  return (
    <div className="flex items-center justify-end gap-3">
      <Button
        variant="secondary"
        onClick={() => window.print()}
      >
        Print Report
      </Button>
      <Button
        variant="primary"
        onClick={onStartNew}
      >
        Start New Analysis
      </Button>
    </div>
  )
}
