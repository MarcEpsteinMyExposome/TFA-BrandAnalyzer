'use client'

import type { BrandReport as BrandReportType } from '@/lib/schemas/report.schema'
import { useAnalysisStore } from '@/lib/store/analysisStore'
import DualScoreHero from './DualScoreHero'
import ExecutiveSummary from './ExecutiveSummary'
import ConsistencyPanel from './ConsistencyPanel'
import CompletenessPanel from './CompletenessPanel'
import ResiliencePanel from './ResiliencePanel'
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
        resilienceScore={report.resilience?.overallScore}
        summary={report.summary}
      />

      {report.executiveSummary && (
        <ExecutiveSummary executiveSummary={report.executiveSummary} />
      )}

      <ConsistencyPanel consistency={report.consistency} />
      <CompletenessPanel completeness={report.completeness} />

      {report.resilience && (
        <ResiliencePanel resilience={report.resilience} />
      )}

      <ActionItemList actionItems={report.actionItems} />
      <ReportSourcesSection platforms={platforms} />
      <ReportActions report={report} platforms={platforms} onStartNew={onStartNew} />
    </div>
  )
}
