import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  getAnthropicClient,
  ANALYSIS_MODEL,
  MAX_TOKENS,
} from '@/lib/analysis/client'
import { SYSTEM_PROMPT } from '@/lib/analysis/prompt-template'
import { buildUserMessage } from '@/lib/analysis/buildPrompt'
import { parseReport } from '@/lib/analysis/parseReport'
import { platformEntrySchema } from '@/lib/schemas/platform.schema'

// Vercel serverless function timeout: Hobby = 60s max, Pro = 300s max.
// Claude analysis typically takes 15-45 seconds.
export const maxDuration = 60

const requestSchema = z.object({
  platforms: z.array(platformEntrySchema).min(1),
})

// In-memory rate limiter: IP -> list of timestamps
const RATE_LIMIT_MAX = 10
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000 // 1 hour
const rateLimitMap = new Map<string, number[]>()

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  )
}

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const timestamps = rateLimitMap.get(ip) || []
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS)
  rateLimitMap.set(ip, recent)

  if (recent.length >= RATE_LIMIT_MAX) {
    return true
  }

  recent.push(now)
  rateLimitMap.set(ip, recent)
  return false
}

// Exported for testing
export { rateLimitMap, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS }

function classifyClaudeError(error: unknown): { message: string; status: number } {
  // Log full error details for Vercel runtime logs
  if (error instanceof Error) {
    const cause = (error as unknown as { cause?: Error }).cause
    console.error('[analyze] Error:', error.message)
    console.error('[analyze] Error name:', error.constructor.name)
    if (cause) {
      console.error('[analyze] Cause:', cause.message)
      console.error('[analyze] Cause name:', cause.constructor.name)
      if ((cause as unknown as { code?: string }).code) {
        console.error('[analyze] Cause code:', (cause as unknown as { code?: string }).code)
      }
    }

    const msg = error.message || ''
    const causeMsg = cause?.message || ''
    const fullMsg = `${msg} ${causeMsg}`
    const anyError = error as unknown as Record<string, unknown>
    const statusCode = typeof anyError.status === 'number' ? anyError.status : 0

    if (statusCode === 429 || fullMsg.includes('rate_limit') || fullMsg.includes('429')) {
      return {
        message: 'Claude API rate limit reached. Please wait a few minutes and try again.',
        status: 429,
      }
    }

    if (statusCode === 401 || fullMsg.includes('authentication') || fullMsg.includes('invalid_api_key') || fullMsg.includes('401')) {
      return {
        message: 'API key configuration error. Please contact the site administrator.',
        status: 500,
      }
    }

    if (fullMsg.includes('ECONNREFUSED') || fullMsg.includes('ENOTFOUND') || fullMsg.includes('fetch failed') || fullMsg.includes('network') || fullMsg.includes('Connection error')) {
      // Sanitize: never expose API keys in user-facing messages
      const safeDetail = (causeMsg || msg).replace(/sk-ant-[^\s)"]*/g, '[REDACTED]')
      return {
        message: `Unable to reach the AI service (${safeDetail}). Please try again.`,
        status: 502,
      }
    }

    if (fullMsg.includes('not a legal HTTP header value')) {
      return {
        message: 'API key configuration error: the key contains invalid characters (check for trailing spaces or newlines in Vercel env vars).',
        status: 500,
      }
    }
  }

  // Sanitize: never expose API keys in user-facing error messages
  const rawMsg = error instanceof Error ? error.message : 'Internal server error'
  return {
    message: rawMsg.replace(/sk-ant-[^\s)"]*/g, '[REDACTED]'),
    status: 500,
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    if (isRateLimited(ip)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded. You can run up to 10 analyses per hour. Please try again later.',
        },
        { status: 429 }
      )
    }

    const body = await request.json()
    const parsed = requestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const { platforms } = parsed.data

    let client
    try {
      client = getAnthropicClient()
    } catch (error) {
      const classified = classifyClaudeError(error)
      return NextResponse.json(
        { success: false, error: classified.message },
        { status: classified.status }
      )
    }

    const userContent = buildUserMessage(platforms)

    let stream
    try {
      stream = await client.messages.stream({
        model: ANALYSIS_MODEL,
        max_tokens: MAX_TOKENS,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userContent }],
      })
    } catch (error) {
      const classified = classifyClaudeError(error)
      return NextResponse.json(
        { success: false, error: classified.message },
        { status: classified.status }
      )
    }

    const encoder = new TextEncoder()
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          let fullText = ''

          for await (const event of stream) {
            if (
              event.type === 'content_block_delta' &&
              event.delta.type === 'text_delta'
            ) {
              const chunk = event.delta.text
              fullText += chunk
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ type: 'text', text: chunk })}\n\n`
                )
              )
            }
          }

          try {
            const report = parseReport(fullText)
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: 'report', report })}\n\n`
              )
            )
          } catch (parseError) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: 'error',
                  error: `Report parsing failed: ${(parseError as Error).message}`,
                })}\n\n`
              )
            )
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (error) {
          const classified = classifyClaudeError(error)
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: 'error', error: classified.message })}\n\n`
            )
          )
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        }
      },
    })

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    const classified = classifyClaudeError(error)
    return NextResponse.json(
      { success: false, error: classified.message },
      { status: classified.status }
    )
  }
}
