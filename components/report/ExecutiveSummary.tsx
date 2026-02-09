'use client'

import type { ExecutiveSummary as ExecutiveSummaryType } from '@/lib/schemas/report.schema'

interface ExecutiveSummaryProps {
  executiveSummary: ExecutiveSummaryType
}

export default function ExecutiveSummary({ executiveSummary }: ExecutiveSummaryProps) {
  const { strengths, quickWins } = executiveSummary

  if (strengths.length === 0 && quickWins.length === 0) {
    return null
  }

  return (
    <section aria-labelledby="executive-summary-heading" className="space-y-4">
      <h2 id="executive-summary-heading" className="text-xl font-semibold text-gray-900">
        Executive Summary
      </h2>

      {strengths.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-green-900 mb-3">
            What You're Doing Well
          </h3>
          <ul className="space-y-2">
            {strengths.map((strength, index) => (
              <li key={index} className="flex items-start gap-2 text-green-800">
                <svg
                  className="mt-0.5 h-5 w-5 shrink-0 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {quickWins.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-amber-900 mb-3">
            Your Quick Wins
          </h3>
          <ol className="space-y-2 list-decimal list-inside">
            {quickWins.map((win, index) => (
              <li key={index} className="text-amber-800">
                {win}
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  )
}
