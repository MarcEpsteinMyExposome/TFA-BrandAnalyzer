'use client'

import type { Mismatch } from '@/lib/schemas/report.schema'

interface MismatchCardProps {
  mismatch: Mismatch
}

const severityStyles: Record<string, { badge: string; border: string }> = {
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

const defaultSeverityStyle = { badge: 'bg-gray-100 text-gray-700', border: 'border-l-gray-400' }

function formatMismatchType(type: string): string {
  return type.charAt(0).toUpperCase() + type.slice(1)
}

export default function MismatchCard({ mismatch }: MismatchCardProps) {
  const styles = severityStyles[mismatch.severity] || defaultSeverityStyle

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 border-l-4 ${styles.border} p-4 shadow-sm`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">
            {formatMismatchType(mismatch.type)}
          </span>
          <p className="mt-1 text-gray-900">
            {mismatch.description}
          </p>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles.badge} shrink-0`}
        >
          {mismatch.severity}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {mismatch.platforms.map((platform) => (
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
        {mismatch.recommendation}
      </p>
    </div>
  )
}
