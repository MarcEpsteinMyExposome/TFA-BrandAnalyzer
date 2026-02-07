'use client'

import type { BrandReport } from '@/lib/schemas/report.schema'
import ScoreGauge from './ScoreGauge'
import MismatchCard from './MismatchCard'

interface ConsistencyPanelProps {
  consistency: BrandReport['consistency']
}

function formatCategory(category: string): string {
  return category
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase())
    .trim()
}

export default function ConsistencyPanel({ consistency }: ConsistencyPanelProps) {
  return (
    <section aria-labelledby="consistency-heading">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 id="consistency-heading" className="text-xl font-semibold text-gray-900">
          Part 1: Brand Consistency
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Overall:</span>
          <ScoreGauge score={consistency.overallScore} label="" size="sm" />
        </div>
      </div>

      {/* Category scores */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {consistency.categories.map((cat) => (
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
            </div>
          </div>
        ))}
      </div>

      {/* Mismatches */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Findings</h3>
        {consistency.mismatches.length === 0 ? (
          <p className="text-gray-500 text-sm">No inconsistencies found.</p>
        ) : (
          <div className="space-y-3">
            {consistency.mismatches.map((mismatch, index) => (
              <MismatchCard key={index} mismatch={mismatch} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
