'use client'

import { useState, useCallback } from 'react'
import type { PlatformEntry } from '@/lib/schemas/platform.schema'
import type { BrandReport } from '@/lib/schemas/report.schema'

interface UseAnalysisReturn {
  analyze: (platforms: PlatformEntry[]) => Promise<void>
  streamingText: string
  report: BrandReport | null
  isAnalyzing: boolean
  error: string | null
}

export function useAnalysis(): UseAnalysisReturn {
  const [streamingText, setStreamingText] = useState('')
  const [report, setReport] = useState<BrandReport | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const analyze = useCallback(async (platforms: PlatformEntry[]) => {
    setIsAnalyzing(true)
    setStreamingText('')
    setReport(null)
    setError(null)

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platforms }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue

            try {
              const parsed = JSON.parse(data)
              if (parsed.type === 'text') {
                setStreamingText((prev) => prev + parsed.text)
              } else if (parsed.type === 'report') {
                setReport(parsed.report)
              } else if (parsed.type === 'error') {
                setError(parsed.error)
              }
            } catch {
              // Skip malformed chunks
            }
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed')
    } finally {
      setIsAnalyzing(false)
    }
  }, [])

  return { analyze, streamingText, report, isAnalyzing, error }
}
