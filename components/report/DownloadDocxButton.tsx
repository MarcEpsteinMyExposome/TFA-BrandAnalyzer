'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import { downloadDocx } from '@/lib/export/generateDocx'
import type { BrandReport } from '@/lib/schemas/report.schema'
import type { PlatformEntry } from '@/lib/schemas/platform.schema'

interface DownloadDocxButtonProps {
  report: BrandReport
  platforms: PlatformEntry[]
}

export default function DownloadDocxButton({ report, platforms }: DownloadDocxButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDownload = async () => {
    setLoading(true)
    setError(null)
    try {
      await downloadDocx(report, platforms)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate document'
      setError(message)
      setTimeout(() => setError(null), 4000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full sm:w-auto">
      <Button
        variant="secondary"
        onClick={handleDownload}
        disabled={loading}
        className="w-full sm:w-auto"
        aria-label="Download report as Word document"
      >
        {loading ? 'Generating...' : 'Download Report (.docx)'}
      </Button>
      {error && (
        <p className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
