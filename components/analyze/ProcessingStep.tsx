'use client'

import { useEffect, useCallback, useState, useRef } from 'react'
import { useAnalysisStore } from '@/lib/store/analysisStore'
import type { UploadedImage } from '@/lib/schemas/platform.schema'
import { getPlatform } from '@/lib/platforms/registry'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import ScreenshotUpload from '@/components/screenshots/ScreenshotUpload'

interface ProcessingStepProps {
  onComplete: () => void
}

export default function ProcessingStep({ onComplete }: ProcessingStepProps) {
  const platforms = useAnalysisStore((state) => state.platforms)
  const updateFetchStatus = useAnalysisStore((state) => state.updateFetchStatus)
  const addScreenshot = useAnalysisStore((state) => state.addScreenshot)
  const removeScreenshot = useAnalysisStore((state) => state.removeScreenshot)
  const [retryCooldowns, setRetryCooldowns] = useState<Record<number, number>>({})
  const [showScreenshotFor, setShowScreenshotFor] = useState<Record<number, boolean>>({})
  const cooldownTimers = useRef<Record<number, ReturnType<typeof setInterval>>>({})
  const retryCountRef = useRef<Record<number, number>>({})

  useEffect(() => {
    const timers = cooldownTimers.current
    return () => {
      Object.values(timers).forEach(clearInterval)
    }
  }, [])

  const fetchPlatform = useCallback(
    async (index: number, url: string, platformId: string) => {
      updateFetchStatus(index, 'fetching')

      try {
        const response = await fetch('/api/fetch-page', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url, platform: platformId }),
        })

        const data = await response.json()

        if (data.success) {
          updateFetchStatus(index, 'success', data.content)
        } else {
          updateFetchStatus(index, 'error', undefined, data.error || 'Fetch failed')
        }
      } catch {
        updateFetchStatus(index, 'error', undefined, 'Network error')
      }
    },
    [updateFetchStatus]
  )

  // On mount, trigger fetch for each fetchable platform that is still pending
  useEffect(() => {
    platforms.forEach((entry, index) => {
      if (entry.fetchable && entry.fetchStatus === 'pending') {
        fetchPlatform(index, entry.url, entry.platform)
      }
    })
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleRetry = (index: number, url: string, platformId: string) => {
    const attempt = (retryCountRef.current[index] || 0) + 1
    retryCountRef.current[index] = attempt

    const cooldownSeconds = Math.min(Math.pow(2, attempt), 8)
    setRetryCooldowns((prev) => ({ ...prev, [index]: cooldownSeconds }))

    if (cooldownTimers.current[index]) {
      clearInterval(cooldownTimers.current[index])
    }

    cooldownTimers.current[index] = setInterval(() => {
      setRetryCooldowns((prev) => {
        const remaining = (prev[index] || 0) - 1
        if (remaining <= 0) {
          clearInterval(cooldownTimers.current[index])
          delete cooldownTimers.current[index]
          const updated = { ...prev }
          delete updated[index]
          return updated
        }
        return { ...prev, [index]: remaining }
      })
    }, 1000)

    fetchPlatform(index, url, platformId)
  }

  // Check if all fetchable platforms are done (success or error)
  const allFetchablesDone = platforms.every(
    (entry) =>
      !entry.fetchable || entry.fetchStatus === 'success' || entry.fetchStatus === 'error'
  )

  // Check if any failed platforms lack a screenshot fallback
  const hasFailedWithoutScreenshots = platforms.some(
    (entry) =>
      entry.fetchable && entry.fetchStatus === 'error' && !entry.screenshots?.length
  )

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Fetching Your Platforms
      </h2>
      <p className="text-sm text-gray-600 mb-6">
        We are retrieving content from your public pages. This may take a moment.
      </p>

      <div className="space-y-3" role="list" aria-label="Platform fetch status" aria-live="polite">
        {platforms.map((entry, index) => {
          const config = getPlatform(entry.platform)

          return (
            <Card key={`${entry.platform}-${index}`} className="!p-4">
              <div
                className="flex items-start justify-between gap-2 sm:items-center"
                role="listitem"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <StatusIcon
                    status={
                      !entry.fetchable
                        ? 'skipped'
                        : entry.fetchStatus === 'error' && entry.screenshots?.length
                          ? 'screenshot'
                          : entry.fetchStatus
                    }
                  />
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900">{config.name}</p>
                    <p className="text-xs text-gray-500 truncate max-w-[200px] sm:max-w-xs">
                      {entry.url}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {!entry.fetchable && (
                    <span className="text-xs text-gray-500">
                      {entry.screenshots?.length ? 'Screenshot provided' : 'Skipped'}
                    </span>
                  )}

                  {entry.fetchable && entry.fetchStatus === 'error' && (
                    <>
                      {entry.screenshots?.length ? (
                        <div className="flex items-center gap-1.5">
                          <div
                            className="w-4 h-4 rounded-full bg-green-100 text-green-600 flex items-center justify-center"
                            aria-label="Screenshot provided"
                          >
                            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span className="text-xs text-green-600">Screenshot provided</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-red-600 hidden sm:inline">
                            {entry.fetchError || 'Fetch failed'}
                          </span>
                          {retryCooldowns[index] ? (
                            <span className="text-xs text-gray-500" aria-live="polite">
                              Retrying in {retryCooldowns[index]}s...
                            </span>
                          ) : (
                            <>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleRetry(index, entry.url, entry.platform)}
                                aria-label={`Retry ${config.name}`}
                              >
                                Retry
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() =>
                                  setShowScreenshotFor((prev) => ({
                                    ...prev,
                                    [index]: !prev[index],
                                  }))
                                }
                                aria-label={`Upload screenshot for ${config.name}`}
                              >
                                {showScreenshotFor[index] ? 'Hide Upload' : 'Upload Screenshot Instead'}
                              </Button>
                            </>
                          )}
                        </div>
                      )}
                    </>
                  )}

                  {entry.fetchable && entry.fetchStatus === 'success' && (
                    <span className="text-xs text-green-600">Done</span>
                  )}

                  {entry.fetchable && entry.fetchStatus === 'fetching' && (
                    <span className="text-xs text-gray-500">Fetching...</span>
                  )}
                </div>
              </div>

              {/* Show error message below on mobile (only when no screenshot provided) */}
              {entry.fetchable && entry.fetchStatus === 'error' && !entry.screenshots?.length && (
                <p className="text-xs text-red-600 mt-2 sm:hidden">
                  {entry.fetchError || 'Fetch failed'}
                </p>
              )}

              {/* Screenshot upload fallback for failed fetches */}
              {entry.fetchable && entry.fetchStatus === 'error' && showScreenshotFor[index] && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-600 mb-2">
                    Upload a screenshot of your {config.name} page as a fallback:
                  </p>
                  <ScreenshotUpload
                    platformId={entry.platform}
                    existingImages={entry.screenshots || []}
                    onUpload={(image: UploadedImage) => addScreenshot(index, image)}
                    onRemove={(si) => removeScreenshot(index, si)}
                  />
                </div>
              )}
            </Card>
          )
        })}
      </div>

      <div className="mt-8 flex flex-col items-end gap-2">
        {allFetchablesDone && hasFailedWithoutScreenshots && (
          <p className="text-xs text-amber-600">
            Some platforms couldn&apos;t be fetched. You can still continue, but the analysis may be less complete.
          </p>
        )}
        <Button
          onClick={onComplete}
          disabled={!allFetchablesDone}
        >
          Continue to Analysis
        </Button>
      </div>
    </div>
  )
}

/**
 * Status icon component showing spinner, checkmark, X, or dash.
 */
function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'fetching':
      return (
        <div
          className="w-5 h-5 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"
          role="status"
          aria-label="Fetching"
        />
      )
    case 'success':
      return (
        <div
          className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center"
          aria-label="Success"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )
    case 'error':
      return (
        <div
          className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center"
          aria-label="Error"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      )
    case 'screenshot':
      return (
        <div
          className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center"
          aria-label="Screenshot provided"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )
    case 'skipped':
      return (
        <div
          className="w-5 h-5 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center"
          aria-label="Skipped"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
          </svg>
        </div>
      )
    default:
      return (
        <div
          className="w-5 h-5 rounded-full bg-gray-100"
          aria-label="Pending"
        />
      )
  }
}
