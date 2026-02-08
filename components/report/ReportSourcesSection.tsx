'use client'

import type { PlatformEntry } from '@/lib/schemas/platform.schema'
import { getPlatform } from '@/lib/platforms/registry'
import Card from '@/components/ui/Card'

interface ReportSourcesSectionProps {
  platforms: PlatformEntry[]
}

/**
 * Determines the data source type for a platform entry.
 * - "Auto-fetched" if fetchedContent exists (successfully fetched)
 * - "Screenshot" if screenshots were uploaded
 * - "URL only" if neither fetched content nor screenshots
 */
function getSourceType(
  entry: PlatformEntry
): 'auto-fetched' | 'screenshot' | 'url-only' {
  if (entry.fetchedContent) return 'auto-fetched'
  if (entry.screenshots && entry.screenshots.length > 0) return 'screenshot'
  return 'url-only'
}

function SourceBadge({ type }: { type: ReturnType<typeof getSourceType> }) {
  const config = {
    'auto-fetched': {
      label: 'Auto-fetched',
      className: 'bg-green-100 text-green-800',
    },
    screenshot: {
      label: 'Screenshot',
      className: 'bg-blue-100 text-blue-800',
    },
    'url-only': {
      label: 'URL only',
      className: 'bg-gray-100 text-gray-600',
    },
  }

  const { label, className } = config[type]

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}
    >
      {label}
    </span>
  )
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trimEnd() + '...'
}

export default function ReportSourcesSection({
  platforms,
}: ReportSourcesSectionProps) {
  if (!platforms || platforms.length === 0) {
    return null
  }

  return (
    <section aria-labelledby="data-sources-heading">
      <h2
        id="data-sources-heading"
        className="text-xl font-semibold text-gray-900 mb-6"
      >
        Data Sources
      </h2>

      <div className="space-y-4">
        {platforms.map((entry, index) => {
          const platformConfig = getPlatform(entry.platform)
          const sourceType = getSourceType(entry)

          return (
            <Card key={`${entry.platform}-${index}`}>
              <div className="flex flex-col gap-3">
                {/* Platform name, URL, and badge */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-gray-900">
                      {platformConfig.name}
                    </h3>
                    <a
                      href={entry.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-indigo-600 hover:text-indigo-800 break-all"
                    >
                      {entry.url}
                    </a>
                  </div>
                  <div className="flex-shrink-0">
                    <SourceBadge type={sourceType} />
                  </div>
                </div>

                {/* Fetched content summary */}
                {entry.fetchedContent && (
                  <div className="rounded-md bg-gray-50 p-3 text-sm">
                    {entry.fetchedContent.title && (
                      <p className="font-medium text-gray-800">
                        {entry.fetchedContent.title}
                      </p>
                    )}
                    {entry.fetchedContent.description && (
                      <p className="mt-1 text-gray-600">
                        {truncateText(entry.fetchedContent.description, 100)}
                      </p>
                    )}
                  </div>
                )}

                {/* Screenshot thumbnails */}
                {entry.screenshots && entry.screenshots.length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    {entry.screenshots.map((screenshot, si) => (
                      <img
                        key={si}
                        src={screenshot.data}
                        alt={`${platformConfig.name} screenshot ${si + 1}`}
                        className="h-auto max-w-[150px] rounded border border-gray-200 object-cover"
                      />
                    ))}
                  </div>
                )}
              </div>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
