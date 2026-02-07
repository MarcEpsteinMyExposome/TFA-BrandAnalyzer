'use client'

import { getPlatform } from '@/lib/platforms/registry'
import type { PlatformId } from '@/lib/platforms/types'

interface ScreenshotGuideProps {
  platformId: PlatformId
  platformName: string
  instructions: string
}

/**
 * Format a camelCase data point string into a readable label.
 * e.g., "profilePhoto" -> "Profile photo", "linkInBio" -> "Link in bio"
 */
function formatDataPoint(point: string): string {
  // Insert spaces before uppercase letters and lowercase the result
  const spaced = point.replace(/([A-Z])/g, ' $1').trim()
  // Capitalize only the first letter
  return spaced.charAt(0).toUpperCase() + spaced.slice(1).toLowerCase()
}

export default function ScreenshotGuide({
  platformId,
  platformName,
  instructions,
}: ScreenshotGuideProps) {
  const platform = getPlatform(platformId)
  const dataPoints = platform.dataPoints

  return (
    <div className="rounded border border-gray-200 bg-gray-50 p-4">
      <h4 className="text-sm font-medium text-gray-900">
        How to screenshot {platformName}
      </h4>
      <p className="mt-1 text-sm text-gray-600">{instructions}</p>
      {dataPoints.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-medium text-gray-700">
            Make sure your screenshot includes:
          </p>
          <ul className="mt-1 space-y-1">
            {dataPoints.map((point) => (
              <li key={point} className="flex items-center text-xs text-gray-600">
                <span className="mr-2 text-gray-400" aria-hidden="true">
                  &#10003;
                </span>
                {formatDataPoint(point)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
