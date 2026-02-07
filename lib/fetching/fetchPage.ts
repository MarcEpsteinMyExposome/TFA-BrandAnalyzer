import { extractContent } from './extractContent'
import type { ExtractedContent } from '@/lib/schemas/platform.schema'

export interface FetchResult {
  success: boolean
  content?: ExtractedContent
  error?: string
}

/**
 * Fetch a URL and extract structured content from the HTML.
 * Includes a 10-second timeout and custom User-Agent.
 */
export async function fetchPage(url: string): Promise<FetchResult> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; TFABrandAnalyzer/1.0; +https://techforartists.com)',
        Accept: 'text/html,application/xhtml+xml',
      },
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      }
    }

    const html = await response.text()
    const content = extractContent(html, url)

    return { success: true, content }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return { success: false, error: 'Request timed out (10s limit)' }
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
