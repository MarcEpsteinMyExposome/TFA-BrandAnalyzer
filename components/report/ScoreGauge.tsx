'use client'

interface ScoreGaugeProps {
  score: number
  label: string
  size?: 'sm' | 'lg'
}

function getScoreColor(score: number) {
  if (score >= 80) return { text: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', stroke: 'stroke-green-500' }
  if (score >= 60) return { text: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', stroke: 'stroke-yellow-500' }
  if (score >= 40) return { text: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', stroke: 'stroke-orange-500' }
  return { text: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', stroke: 'stroke-red-500' }
}

export default function ScoreGauge({ score, label, size = 'sm' }: ScoreGaugeProps) {
  const colors = getScoreColor(score)
  const isLarge = size === 'lg'

  // SVG circle dimensions
  const svgSize = isLarge ? 120 : 80
  const strokeWidth = isLarge ? 8 : 6
  const radius = (svgSize - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        role="meter"
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label}: ${score} out of 100`}
        className={`relative inline-flex items-center justify-center rounded-full ${colors.bg} border ${colors.border}`}
        style={{ width: svgSize + 16, height: svgSize + 16 }}
      >
        <svg
          width={svgSize}
          height={svgSize}
          className="-rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-gray-200"
          />
          {/* Score arc */}
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={colors.stroke}
          />
        </svg>
        <span
          className={`absolute ${isLarge ? 'text-3xl' : 'text-xl'} font-bold ${colors.text}`}
        >
          {score}
        </span>
      </div>
      <span className={`${isLarge ? 'text-base' : 'text-sm'} font-medium text-gray-700`}>
        {label}
      </span>
    </div>
  )
}
