'use client'

type StepName = 'urls' | 'screenshots' | 'processing' | 'report'

interface StepIndicatorProps {
  currentStep: StepName
}

const STEPS: { key: StepName; number: number; label: string }[] = [
  { key: 'urls', number: 1, label: 'Add Links' },
  { key: 'screenshots', number: 2, label: 'Screenshots' },
  { key: 'processing', number: 3, label: 'Analyzing' },
  { key: 'report', number: 4, label: 'Report' },
]

function stepToNumber(step: StepName): number {
  const found = STEPS.find((s) => s.key === step)
  return found ? found.number : 1
}

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  const currentNumber = stepToNumber(currentStep)

  return (
    <nav aria-label="Analysis progress" className="w-full py-4">
      <ol className="flex items-center justify-between">
        {STEPS.map((step, index) => {
          const isCompleted = step.number < currentNumber
          const isCurrent = step.number === currentNumber
          const isFuture = step.number > currentNumber

          return (
            <li
              key={step.key}
              className="flex items-center flex-1 last:flex-none"
            >
              <div className="flex flex-col items-center">
                {/* Circle */}
                <div
                  aria-label={
                    isCompleted
                      ? `Step ${step.number}: ${step.label} (completed)`
                      : isCurrent
                        ? `Step ${step.number}: ${step.label} (current)`
                        : `Step ${step.number}: ${step.label}`
                  }
                  aria-current={isCurrent ? 'step' : undefined}
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium border-2 transition-colors ${
                    isCompleted
                      ? 'bg-gray-900 border-gray-900 text-white'
                      : isCurrent
                        ? 'border-gray-900 text-gray-900 bg-white'
                        : 'border-gray-300 text-gray-400 bg-white'
                  }`}
                >
                  {isCompleted ? (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    step.number
                  )}
                </div>

                {/* Label (hidden on mobile) */}
                <span
                  className={`mt-1 text-xs hidden sm:block ${
                    isCurrent
                      ? 'text-gray-900 font-semibold'
                      : isCompleted
                        ? 'text-gray-900'
                        : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {/* Connecting line */}
              {index < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 ${
                    step.number < currentNumber ? 'bg-gray-900' : 'bg-gray-300'
                  }`}
                  aria-hidden="true"
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
