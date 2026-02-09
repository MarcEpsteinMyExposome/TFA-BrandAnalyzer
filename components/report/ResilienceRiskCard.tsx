'use client'

import type { ResilienceRisk } from '@/lib/schemas/report.schema'

interface ResilienceRiskCardProps {
  risk: ResilienceRisk
}

const severityStyles: Record<string, { badge: string; border: string }> = {
  high: {
    badge: 'bg-amber-100 text-amber-700',
    border: 'border-l-amber-500',
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

const defaultSeverityStyle = { badge: 'bg-gray-100 text-gray-700', border: 'border-l-gray-400' }

const severityLabels: Record<string, string> = {
  high: 'High Priority',
  medium: 'Worth Addressing',
  low: 'Nice to Have',
}

function formatCategory(category: string): string {
  return category
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase())
    .trim()
}

export default function ResilienceRiskCard({ risk }: ResilienceRiskCardProps) {
  const styles = severityStyles[risk.severity] || defaultSeverityStyle
  const severityLabel = severityLabels[risk.severity] || risk.severity

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 border-l-4 ${styles.border} p-4 shadow-sm`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">
            {formatCategory(risk.category)}
          </span>
          <p className="mt-1 text-gray-900">
            {risk.description}
          </p>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles.badge} shrink-0`}
        >
          {severityLabel}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {risk.platforms.map((platform) => (
          <span
            key={platform}
            className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700"
          >
            {platform}
          </span>
        ))}
      </div>

      <p className="mt-3 text-sm text-gray-600">
        <span className="font-medium text-gray-700">Suggestion:</span>{' '}
        {risk.recommendation}
      </p>
    </div>
  )
}
