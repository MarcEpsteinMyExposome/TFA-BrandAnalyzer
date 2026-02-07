'use client'

import { useState } from 'react'
import { isValidUrl } from '@/lib/platforms/detect'
import type { PlatformId } from '@/lib/platforms/types'

interface PlatformUrlFieldProps {
  index: number
  url: string
  platformId: PlatformId
  platformName: string
  fetchable: boolean
  onUrlChange: (index: number, url: string) => void
  onRemove: (index: number) => void
}

export default function PlatformUrlField({
  index,
  url,
  platformId,
  platformName,
  fetchable,
  onUrlChange,
  onRemove,
}: PlatformUrlFieldProps) {
  const [touched, setTouched] = useState(false)
  const showError = touched && url.length > 0 && !isValidUrl(url)

  return (
    <div className="flex items-start gap-3 py-2">
      {/* Platform name label */}
      <div className="flex-shrink-0 w-28 pt-2">
        <span className="text-sm font-medium text-gray-700">{platformName}</span>
      </div>

      {/* URL input */}
      <div className="flex-1 min-w-0">
        <input
          type="url"
          value={url}
          onChange={(e) => onUrlChange(index, e.target.value)}
          onBlur={() => setTouched(true)}
          placeholder={`Enter your ${platformName} URL`}
          aria-label={`${platformName} URL`}
          aria-invalid={showError ? true : undefined}
          className={`border rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:border-transparent ${
            showError
              ? 'border-red-500 focus:ring-red-400'
              : 'border-gray-300 focus:ring-gray-400'
          }`}
        />
        {showError && (
          <p className="text-red-600 text-xs mt-1" role="alert">
            Please enter a valid URL
          </p>
        )}
      </div>

      {/* Fetchable indicator */}
      <div className="flex-shrink-0 pt-2">
        {fetchable ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
            Auto-fetch
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
            Screenshot needed
          </span>
        )}
      </div>

      {/* Remove button */}
      <button
        type="button"
        onClick={() => onRemove(index)}
        className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
        aria-label={`Remove ${platformName}`}
      >
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
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  )
}
