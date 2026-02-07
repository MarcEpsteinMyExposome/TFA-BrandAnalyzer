'use client'

import Button from '@/components/ui/Button'

interface ReportActionsProps {
  onStartNew: () => void
}

export default function ReportActions({ onStartNew }: ReportActionsProps) {
  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
      <Button
        variant="secondary"
        onClick={() => window.print()}
        className="w-full sm:w-auto"
      >
        Print Report
      </Button>
      <Button
        variant="primary"
        onClick={onStartNew}
        className="w-full sm:w-auto"
      >
        Start New Analysis
      </Button>
    </div>
  )
}
