'use client'

import { useCallback, useRef, useEffect, useState } from 'react'
import { useAnalysisStore } from '@/lib/store/analysisStore'
import { getPlatform } from '@/lib/platforms/registry'
import { isValidUrl } from '@/lib/platforms/detect'
import type { PlatformId } from '@/lib/platforms/types'
import PlatformUrlField from './PlatformUrlField'
import AddPlatformButton from './AddPlatformButton'
import Button from '@/components/ui/Button'

const MAX_PLATFORMS = 10
const MIN_PLATFORMS = 2

interface UrlInputStepProps {
  onNext: () => void
}

export default function UrlInputStep({ onNext }: UrlInputStepProps) {
  const platforms = useAnalysisStore((state) => state.platforms)
  const addPlatform = useAnalysisStore((state) => state.addPlatform)
  const removePlatform = useAnalysisStore((state) => state.removePlatform)
  const updatePlatformUrl = useAnalysisStore((state) => state.updatePlatformUrl)

  const [validationError, setValidationError] = useState<string | null>(null)
  const lastAddedRef = useRef<number | null>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Focus the newly added URL input
  useEffect(() => {
    if (lastAddedRef.current !== null && listRef.current) {
      const inputs = listRef.current.querySelectorAll<HTMLInputElement>('input[type="url"]')
      const lastInput = inputs[inputs.length - 1]
      if (lastInput) {
        lastInput.focus()
      }
      lastAddedRef.current = null
    }
  }, [platforms.length])

  const handleAddPlatform = useCallback(
    (platformId: PlatformId) => {
      if (platforms.length >= MAX_PLATFORMS) return
      const config = getPlatform(platformId)
      addPlatform(platformId, '', config.fetchable)
      lastAddedRef.current = platforms.length
      setValidationError(null)
    },
    [platforms.length, addPlatform]
  )

  const handleUrlChange = useCallback(
    (index: number, url: string) => {
      updatePlatformUrl(index, url)
      setValidationError(null)
    },
    [updatePlatformUrl]
  )

  const handleRemove = useCallback(
    (index: number) => {
      removePlatform(index)
      setValidationError(null)
    },
    [removePlatform]
  )

  const handleNext = useCallback(() => {
    // Validate: at least MIN_PLATFORMS
    if (platforms.length < MIN_PLATFORMS) {
      setValidationError(
        `Please add at least ${MIN_PLATFORMS} platforms to compare.`
      )
      return
    }

    // Validate: all URLs non-empty and valid
    const hasEmptyUrls = platforms.some((p) => !p.url.trim())
    if (hasEmptyUrls) {
      setValidationError('Please enter a URL for all platforms.')
      return
    }

    const hasInvalidUrls = platforms.some((p) => !isValidUrl(p.url))
    if (hasInvalidUrls) {
      setValidationError('Please fix invalid URLs before continuing.')
      return
    }

    setValidationError(null)
    onNext()
  }, [platforms, onNext])

  // Determine if Next button should be disabled
  const hasEnoughPlatforms = platforms.length >= MIN_PLATFORMS
  const allUrlsValid =
    platforms.length > 0 &&
    platforms.every((p) => p.url.trim() && isValidUrl(p.url))
  const canProceed = hasEnoughPlatforms && allUrlsValid

  const existingPlatformIds = platforms.map((p) => p.platform)

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Add Your Platform Links
      </h2>
      <p className="text-gray-600 mb-6">
        Enter URLs to your online profiles. We&apos;ll analyze them for brand
        consistency.
      </p>

      {/* Platform list */}
      <div ref={listRef} className="space-y-1 mb-4">
        {platforms.map((entry, index) => {
          const config = getPlatform(entry.platform)
          return (
            <PlatformUrlField
              key={`${entry.platform}-${index}`}
              index={index}
              url={entry.url}
              platformId={entry.platform}
              platformName={config.name}
              fetchable={entry.fetchable}
              onUrlChange={handleUrlChange}
              onRemove={handleRemove}
            />
          )
        })}
      </div>

      {/* Add platform button */}
      {platforms.length < MAX_PLATFORMS && (
        <div className="mb-6">
          <AddPlatformButton
            onAdd={handleAddPlatform}
            existingPlatforms={existingPlatformIds}
          />
        </div>
      )}

      {/* Platform count */}
      <p className="text-sm text-gray-500 mb-4">
        {platforms.length} of {MAX_PLATFORMS} platforms
      </p>

      {/* Validation error */}
      {validationError && (
        <p className="text-red-600 text-sm mb-4" role="alert">
          {validationError}
        </p>
      )}

      {/* Next button */}
      <div className="flex justify-end">
        <Button onClick={handleNext} disabled={!canProceed}>
          Next
        </Button>
      </div>
    </div>
  )
}
