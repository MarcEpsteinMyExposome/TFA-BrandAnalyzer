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

const requestSchema = z.object({
  platforms: z.array(platformEntrySchema).min(1),
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

    const { platforms } = parsed.data
    const client = getAnthropicClient()
    const userContent = buildUserMessage(platforms)

    // Call Claude with streaming
    const stream = await client.messages.stream({
      model: ANALYSIS_MODEL,
      max_tokens: MAX_TOKENS,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userContent }],
    })

    // Collect the full response and stream it back
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
              // Stream the text chunk to the client
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ type: 'text', text: chunk })}\n\n`
                )
              )
            }
          }

          // Parse the complete response
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
                `data: ${JSON.stringify({ type: 'error', error: (parseError as Error).message })}\n\n`
              )
            )
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (error) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: 'error', error: (error as Error).message })}\n\n`
            )
          )
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
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    )
  }
}
