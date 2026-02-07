'use client'

import Card from '@/components/ui/Card'
import ScoreGauge from './ScoreGauge'

interface DualScoreHeroProps {
  consistencyScore: number
  completenessScore: number
  summary: string
}

export default function DualScoreHero({
  consistencyScore,
  completenessScore,
  summary,
}: DualScoreHeroProps) {
  return (
    <Card className="py-8">
      <div className="flex flex-col items-center gap-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Brand Health Overview
        </h2>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16">
          <ScoreGauge
            score={consistencyScore}
            label="Consistency"
            size="lg"
          />
          <ScoreGauge
            score={completenessScore}
            label="Completeness"
            size="lg"
          />
        </div>

        <p className="text-gray-600 text-center max-w-2xl">
          {summary}
        </p>
      </div>
    </Card>
  )
}
