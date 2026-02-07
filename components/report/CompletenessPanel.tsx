'use client'

import type { BrandReport } from '@/lib/schemas/report.schema'
import ScoreGauge from './ScoreGauge'
import CompletenessGapCard from './CompletenessGapCard'

interface CompletenessPanelProps {
  completeness: BrandReport['completeness']
}

function formatCategory(category: string): string {
  return category
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase())
    .trim()
}

export default function CompletenessPanel({ completeness }: CompletenessPanelProps) {
  return (
    <section aria-labelledby="completeness-heading">
      <div className="flex items-center justify-between mb-6">
        <h2 id="completeness-heading" className="text-xl font-semibold text-gray-900">
          Part 2: Brand Completeness
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Overall:</span>
          <ScoreGauge score={completeness.overallScore} label="" size="sm" />
        </div>
      </div>

      {/* Category scores with details */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {completeness.categories.map((cat) => (
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

      {/* Gaps */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Gaps &amp; Opportunities</h3>
        {completeness.gaps.length === 0 ? (
          <p className="text-gray-500 text-sm">No significant gaps found.</p>
        ) : (
          <div className="space-y-3">
            {completeness.gaps.map((gap, index) => (
              <CompletenessGapCard key={index} gap={gap} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
