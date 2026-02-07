'use client'

import type { BrandReport as BrandReportType } from '@/lib/schemas/report.schema'
import DualScoreHero from './DualScoreHero'
import ConsistencyPanel from './ConsistencyPanel'
import CompletenessPanel from './CompletenessPanel'
import ActionItemList from './ActionItemList'
import ReportActions from './ReportActions'

interface BrandReportProps {
  report: BrandReportType
  onStartNew: () => void
}

export default function BrandReport({ report, onStartNew }: BrandReportProps) {
  return (
    <div className="space-y-8" aria-live="polite">
      <DualScoreHero
        consistencyScore={report.consistency.overallScore}
        completenessScore={report.completeness.overallScore}
        summary={report.summary}
      />

      <ConsistencyPanel consistency={report.consistency} />

      <CompletenessPanel completeness={report.completeness} />

      <ActionItemList actionItems={report.actionItems} />

      <ReportActions onStartNew={onStartNew} />
    </div>
  )
}
