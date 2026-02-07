import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { fetchPage } from '@/lib/fetching/fetchPage'
import { isValidUrl, normalizeUrl } from '@/lib/platforms/detect'

const requestSchema = z.object({
  url: z.string().min(1, 'URL is required'),
  platform: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = requestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const { url } = parsed.data
    const normalizedUrl = normalizeUrl(url)

    if (!isValidUrl(normalizedUrl)) {
      return NextResponse.json(
        { success: false, error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    const result = await fetchPage(normalizedUrl)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 502 }
      )
    }

    return NextResponse.json({
      success: true,
      content: result.content,
    })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
