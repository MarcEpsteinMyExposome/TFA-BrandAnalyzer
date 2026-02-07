'use client'

import type { CompletenessGap } from '@/lib/schemas/report.schema'

interface CompletenessGapCardProps {
  gap: CompletenessGap
}

const severityStyles = {
  high: {
    badge: 'bg-red-100 text-red-700',
    border: 'border-l-red-500',
  },
  medium: {
    badge: 'bg-yellow-100 text-yellow-700',
    border: 'border-l-yellow-500',
  },
  low: {
    badge: 'bg-blue-100 text-blue-700',
    border: 'border-l-blue-500',
  },
}

function formatCategory(category: string): string {
  return category
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase())
    .trim()
}

export default function CompletenessGapCard({ gap }: CompletenessGapCardProps) {
  const styles = severityStyles[gap.severity]

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 border-l-4 ${styles.border} p-4 shadow-sm`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">
            {formatCategory(gap.category)}
          </span>
          <p className="mt-1 text-gray-900">
            {gap.description}
          </p>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles.badge} shrink-0`}
        >
          {gap.severity}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {gap.platforms.map((platform) => (
          <span
            key={platform}
            className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700"
          >
            {platform}
          </span>
        ))}
      </div>

      <p className="mt-3 text-sm text-gray-600">
        <span aria-hidden="true" className="mr-1">-&gt;</span>
        {gap.recommendation}
      </p>

      {gap.examples && gap.examples.length > 0 && (
        <ul className="mt-2 list-disc list-inside text-sm text-gray-500 space-y-1">
          {gap.examples.map((example, index) => (
            <li key={index}>{example}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
