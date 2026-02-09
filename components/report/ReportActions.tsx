'use client'

import Button from '@/components/ui/Button'
import DownloadDocxButton from './DownloadDocxButton'
import type { BrandReport } from '@/lib/schemas/report.schema'
import type { PlatformEntry } from '@/lib/schemas/platform.schema'

interface ReportActionsProps {
  report: BrandReport
  platforms: PlatformEntry[]
  onStartNew: () => void
}

export default function ReportActions({ report, platforms, onStartNew }: ReportActionsProps) {
  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
      <Button
        variant="secondary"
        onClick={() => window.print()}
        className="w-full sm:w-auto"
      >
        Print Report
      </Button>
      <DownloadDocxButton report={report} platforms={platforms} />
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
