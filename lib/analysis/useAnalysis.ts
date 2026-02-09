'use client'

import { useState, useCallback } from 'react'
import type { PlatformEntry } from '@/lib/schemas/platform.schema'
import type { BrandReport } from '@/lib/schemas/report.schema'
import { useAnalysisStore } from '@/lib/store/analysisStore'
import { sendReportEmail } from '@/lib/email/sendReport'

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

    // Sync to Zustand store
    useAnalysisStore.getState().setIsAnalyzing(true)
    useAnalysisStore.getState().setError(null)

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platforms }),
      })

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch {
          // Response wasn't JSON (e.g., Vercel HTML error page)
          const text = await response.text().catch(() => '')
          if (response.status === 504) {
            errorMessage = 'Analysis timed out. The server took too long to respond. Please try again.'
          } else if (response.status === 413) {
            errorMessage = 'Request too large. Try removing some screenshots and retry.'
          } else {
            errorMessage = `Server error (${response.status}). ${text.slice(0, 200)}`
          }
        }
        throw new Error(errorMessage)
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        // Process complete SSE events (terminated by double newline)
        const events = buffer.split('\n\n')
        // Keep the last element as it may be incomplete
        buffer = events.pop() || ''

        for (const event of events) {
          const lines = event.split('\n')
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
                  useAnalysisStore.getState().setReport(parsed.report)
                  // Fire-and-forget: email report to TFA
                  sendReportEmail(parsed.report, platforms).then((result) => {
                    if (!result.success) {
                      console.error('Failed to email report:', result.error)
                    }
                  })
                } else if (parsed.type === 'error') {
                  setError(parsed.error)
                  useAnalysisStore.getState().setError(parsed.error)
                }
              } catch {
                console.error('Failed to parse SSE event:', data.slice(0, 200))
              }
            }
          }
        }
      }
    } catch (err) {
      let errorMessage = 'Analysis failed'
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        errorMessage = 'Could not connect to the server. This may be a timeout or network issue. Please try again.'
      } else if (err instanceof Error) {
        errorMessage = err.message
      }
      console.error('Analysis error:', err)
      setError(errorMessage)
      useAnalysisStore.getState().setError(errorMessage)
    } finally {
      setIsAnalyzing(false)
      useAnalysisStore.getState().setIsAnalyzing(false)
    }
  }, [])

  return { analyze, streamingText, report, isAnalyzing, error }
}
