'use client'

import type { BrandReport as BrandReportType } from '@/lib/schemas/report.schema'
import { useAnalysisStore } from '@/lib/store/analysisStore'
import DualScoreHero from './DualScoreHero'
import ConsistencyPanel from './ConsistencyPanel'
import CompletenessPanel from './CompletenessPanel'
import ActionItemList from './ActionItemList'
import ReportActions from './ReportActions'
import ReportSourcesSection from './ReportSourcesSection'

interface BrandReportProps {
  report: BrandReportType
  onStartNew: () => void
}

export default function BrandReport({ report, onStartNew }: BrandReportProps) {
  const platforms = useAnalysisStore((state) => state.platforms)

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

      <ReportSourcesSection platforms={platforms} />

      <ReportActions onStartNew={onStartNew} />
    </div>
  )
}
