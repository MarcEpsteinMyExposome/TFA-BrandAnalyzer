import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { fetchPage } from '@/lib/fetching/fetchPage'
import { isValidUrl, normalizeUrl } from '@/lib/platforms/detect'

// Vercel serverless function timeout: allow enough time for slow pages
export const maxDuration = 30

const requestSchema = z.object({
  url: z.string().min(1, 'URL is required'),
  platform: z.string(),
})

type FetchErrorType = 'timeout' | 'network' | 'server' | 'unknown'

function classifyFetchError(error: string): { errorType: FetchErrorType; status: number } {
  if (error.includes('timed out') || error.includes('timeout') || error.includes('AbortError')) {
    return { errorType: 'timeout', status: 504 }
  }
  if (error.includes('ECONNREFUSED') || error.includes('ENOTFOUND') || error.includes('fetch failed') || error.includes('Network error')) {
    return { errorType: 'network', status: 502 }
  }
  if (error.startsWith('HTTP 5') || error.includes('500') || error.includes('502') || error.includes('503')) {
    return { errorType: 'server', status: 502 }
  }
  return { errorType: 'unknown', status: 502 }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = requestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message, errorType: 'validation' as const },
        { status: 400 }
      )
    }

    const { url } = parsed.data
    const normalizedUrl = normalizeUrl(url)

    if (!isValidUrl(normalizedUrl)) {
      return NextResponse.json(
        { success: false, error: 'Invalid URL format', errorType: 'validation' as const },
        { status: 400 }
      )
    }

    const result = await fetchPage(normalizedUrl)

    if (!result.success) {
      const errorMsg = result.error || 'Fetch failed'
      const { errorType, status } = classifyFetchError(errorMsg)
      return NextResponse.json(
        { success: false, error: errorMsg, errorType },
        { status }
      )
    }

    return NextResponse.json({
      success: true,
      content: result.content,
    })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal server error', errorType: 'unknown' as const },
      { status: 500 }
    )
  }
}
