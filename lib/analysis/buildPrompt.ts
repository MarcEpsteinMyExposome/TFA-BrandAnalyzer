import type { PlatformEntry } from '@/lib/schemas/platform.schema'
import { getPlatform } from '@/lib/platforms/registry'

type ImageMediaType = 'image/png' | 'image/jpeg' | 'image/webp' | 'image/gif'
type TextBlock = { type: 'text'; text: string }
type ImageBlock = {
  type: 'image'
  source: { type: 'base64'; media_type: ImageMediaType; data: string }
}
type ContentBlock = TextBlock | ImageBlock

/**
 * Build the user message content for Claude from platform entries.
 * Combines text content (from fetched pages) and image content (from screenshots).
 */
export function buildUserMessage(platforms: PlatformEntry[]): ContentBlock[] {
  const content: ContentBlock[] = []

  // Header text
  content.push({
    type: 'text',
    text: `Analyze the following ${platforms.length} platform(s) for brand health:\n`,
  })

  for (const entry of platforms) {
    const config = getPlatform(entry.platform)

    // Platform header
    content.push({
      type: 'text',
      text: `\n--- PLATFORM: ${config.name} (${entry.url}) ---\nData source: ${entry.fetchedContent ? 'Auto-fetched content' : entry.screenshots?.length ? `Screenshot(s) (${entry.screenshots.length})` : 'URL only (no data available)'}\n`,
    })

    // Fetched text content
    if (entry.fetchedContent) {
      const c = entry.fetchedContent
      let text = `Title: ${c.title}\n`
      text += `Description: ${c.description}\n`
      if (c.headings.length > 0) {
        text += `Headings: ${c.headings.join(' | ')}\n`
      }
      if (c.links.length > 0) {
        text += `Outbound links: ${c.links.slice(0, 20).join(', ')}\n`
      }
      if (c.images.profilePhoto) {
        text += `Profile photo URL: ${c.images.profilePhoto}\n`
      }
      if (c.textContent) {
        // Truncate to ~2000 chars for token efficiency
        text += `Page content:\n${c.textContent.slice(0, 2000)}\n`
      }
      content.push({ type: 'text', text })
    }

    // Screenshot images
    if (entry.screenshots?.length) {
      for (let i = 0; i < entry.screenshots.length; i++) {
        const screenshot = entry.screenshots[i]
        // Extract base64 data (remove data URL prefix if present)
        let base64Data = screenshot.data
        if (base64Data.includes(',')) {
          base64Data = base64Data.split(',')[1]
        }

        content.push({
          type: 'image',
          source: {
            type: 'base64',
            media_type: screenshot.mimeType,
            data: base64Data,
          },
        })
        content.push({
          type: 'text',
          text: `[Screenshot ${i + 1} of ${entry.screenshots.length} for ${config.name}]\n`,
        })
      }
    }
  }

  // Closing instruction
  content.push({
    type: 'text',
    text: '\n\nAnalyze these platforms and provide the brand health report as a JSON object.',
  })

  return content
}

/**
 * Estimate the number of tokens in the prompt (rough approximation).
 * Used for budget management.
 */
export function estimateTokens(platforms: PlatformEntry[]): number {
  let estimate = 1500 // system prompt
  for (const entry of platforms) {
    if (entry.fetchedContent) {
      const textLen =
        (entry.fetchedContent.textContent?.length || 0) +
        (entry.fetchedContent.title?.length || 0) +
        (entry.fetchedContent.description?.length || 0)
      estimate += Math.ceil(textLen / 4) // ~4 chars per token
    }
    if (entry.screenshots?.length) {
      estimate += 1600 * entry.screenshots.length // images typically ~1600 tokens each
    }
    estimate += 100 // per-platform overhead
  }
  return estimate
}
