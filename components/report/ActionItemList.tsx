'use client'

import type { ActionItem } from '@/lib/schemas/report.schema'

interface ActionItemListProps {
  actionItems: ActionItem[]
}

const impactStyles: Record<string, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-green-100 text-green-700',
}

const effortStyles: Record<string, string> = {
  quick: 'bg-green-100 text-green-700',
  moderate: 'bg-yellow-100 text-yellow-700',
  significant: 'bg-red-100 text-red-700',
}

const sourceStyles: Record<string, string> = {
  consistency: 'bg-blue-100 text-blue-700',
  completeness: 'bg-purple-100 text-purple-700',
}

const defaultStyle = 'bg-gray-100 text-gray-700'

export default function ActionItemList({ actionItems }: ActionItemListProps) {
  const sorted = [...actionItems].sort((a, b) => a.priority - b.priority)

  return (
    <section aria-labelledby="actions-heading">
      <h2 id="actions-heading" className="text-xl font-semibold text-gray-900 mb-4">
        Prioritized Action Items
      </h2>

      {sorted.length === 0 ? (
        <p className="text-gray-500 text-sm">No action items.</p>
      ) : (
        <ol className="space-y-3">
          {sorted.map((item) => (
            <li
              key={item.priority}
              className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-white">
                {item.priority}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-gray-900">{item.action}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                    {item.platform}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${sourceStyles[item.source] || defaultStyle}`}
                  >
                    {item.source === 'consistency' ? 'Consistency' : 'Completeness'}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${impactStyles[item.impact] || defaultStyle}`}
                  >
                    {item.impact} impact
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${effortStyles[item.effort] || defaultStyle}`}
                  >
                    {item.effort}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
