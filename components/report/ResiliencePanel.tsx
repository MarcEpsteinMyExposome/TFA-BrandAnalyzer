'use client'

import type { BrandReport } from '@/lib/schemas/report.schema'
import ScoreGauge from './ScoreGauge'
import ResilienceRiskCard from './ResilienceRiskCard'

interface ResiliencePanelProps {
  resilience: NonNullable<BrandReport['resilience']>
}

function formatCategory(category: string): string {
  return category
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase())
    .trim()
}

export default function ResiliencePanel({ resilience }: ResiliencePanelProps) {
  return (
    <section aria-labelledby="resilience-heading">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 id="resilience-heading" className="text-xl font-semibold text-gray-900">
          Part 3: Ownership &amp; Resilience
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Overall:</span>
          <ScoreGauge score={resilience.overallScore} label="" size="sm" />
        </div>
      </div>

      {/* Category scores */}
      <div className="grid gap-4 sm:grid-cols-2 mb-8">
        {resilience.categories.map((cat) => (
          <div
            key={cat.category}
            className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-4"
          >
            <ScoreGauge score={cat.score} label="" size="sm" />
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-gray-900">
                {formatCategory(cat.category)}
              </h3>
              <p className="mt-1 text-sm text-gray-600">{cat.summary}</p>
              <p className="mt-1 text-xs text-gray-500">{cat.details}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Risks & Recommendations */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Risks &amp; Recommendations</h3>
        {resilience.risks.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No significant risks found — your online presence is well-diversified!
          </p>
        ) : (
          <div className="space-y-3">
            {resilience.risks.map((risk, index) => (
              <ResilienceRiskCard key={index} risk={risk} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
