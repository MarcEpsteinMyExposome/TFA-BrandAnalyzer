'use client'

import { useAnalysisStore } from '@/lib/store/analysisStore'
import { getPlatform } from '@/lib/platforms/registry'
import Button from '@/components/ui/Button'
import ScreenshotGuide from '@/components/screenshots/ScreenshotGuide'
import ScreenshotUpload from '@/components/screenshots/ScreenshotUpload'
import type { UploadedImage } from '@/lib/schemas/platform.schema'

interface ScreenshotStepProps {
  onNext: () => void
  onBack: () => void
}

export default function ScreenshotStep({ onNext, onBack }: ScreenshotStepProps) {
  const platforms = useAnalysisStore((state) => state.platforms)
  const setScreenshot = useAnalysisStore((state) => state.setScreenshot)
  const removeScreenshot = useAnalysisStore((state) => state.removeScreenshot)

  // Filter to only non-fetchable platforms that need screenshots
  const screenshotPlatforms = platforms
    .map((entry, index) => ({ entry, index }))
    .filter(({ entry }) => !entry.fetchable)

  const uploadedCount = screenshotPlatforms.filter(
    ({ entry }) => entry.screenshot
  ).length

  // If no platforms need screenshots, show skip message
  if (screenshotPlatforms.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Screenshots</h2>
          <p className="mt-1 text-sm text-gray-500">
            All your platforms can be auto-fetched. No screenshots needed!
          </p>
        </div>
        <div className="flex justify-between">
          <Button variant="secondary" onClick={onBack}>
            Back
          </Button>
          <Button onClick={onNext}>Next</Button>
        </div>
      </div>
    )
  }

  const handleUpload = (index: number, image: UploadedImage) => {
    setScreenshot(index, image)
  }

  const handleRemove = (index: number) => {
    removeScreenshot(index)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          Upload Screenshots
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Some platforms require screenshots since we can&apos;t auto-fetch their
          content. Screenshots are optional but improve analysis accuracy.
        </p>
        <p className="mt-2 text-sm text-gray-500">
          {uploadedCount} of {screenshotPlatforms.length} screenshots uploaded
        </p>
      </div>

      <div className="space-y-8">
        {screenshotPlatforms.map(({ entry, index }) => {
          const config = getPlatform(entry.platform)
          return (
            <div
              key={`${entry.platform}-${index}`}
              className="space-y-3"
            >
              <h3 className="text-base font-medium text-gray-900">
                {config.name}
              </h3>
              {config.screenshotInstructions && (
                <ScreenshotGuide
                  platformId={entry.platform}
                  platformName={config.name}
                  instructions={config.screenshotInstructions}
                />
              )}
              <ScreenshotUpload
                platformId={entry.platform}
                onUpload={(image) => handleUpload(index, image)}
                existingImage={entry.screenshot}
                onRemove={() => handleRemove(index)}
              />
              {!entry.screenshot && (
                <button
                  type="button"
                  onClick={() => {
                    // Skip is a no-op — just leave screenshot undefined
                  }}
                  className="text-sm text-gray-500 underline hover:text-gray-700"
                >
                  Skip this platform
                </button>
              )}
            </div>
          )
        })}
      </div>

      <div className="flex justify-between">
        <Button variant="secondary" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext}>Next</Button>
      </div>
    </div>
  )
}
