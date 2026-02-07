import { buildUserMessage, estimateTokens } from '@/lib/analysis/buildPrompt'
import type { PlatformEntry } from '@/lib/schemas/platform.schema'

// Helper to create a minimal valid PlatformEntry
function makePlatformEntry(
  overrides: Partial<PlatformEntry> = {}
): PlatformEntry {
  return {
    platform: 'website',
    url: 'https://example.com',
    fetchable: true,
    fetchStatus: 'success',
    ...overrides,
  }
}

function makeExtractedContent(overrides = {}) {
  return {
    title: 'Jane Doe Art',
    description: 'Oil paintings and mixed media',
    headings: ['About', 'Gallery', 'Contact'],
    links: ['https://instagram.com/janedoe', 'https://twitter.com/janedoe'],
    images: {
      profilePhoto: 'https://example.com/photo.jpg',
    },
    colors: [],
    textContent: 'Jane Doe is a visual artist based in Portland, Oregon.',
    ...overrides,
  }
}

function makeScreenshot(overrides = {}) {
  return {
    data: 'data:image/png;base64,iVBORw0KGgoAAAANS',
    mimeType: 'image/png' as const,
    fileName: 'instagram-profile.png',
    fileSize: 50000,
    ...overrides,
  }
}

describe('buildUserMessage', () => {
  it('builds message content with text data for fetched platforms', () => {
    const platforms: PlatformEntry[] = [
      makePlatformEntry({
        platform: 'website',
        url: 'https://janedoe.com',
        fetchedContent: makeExtractedContent(),
      }),
    ]

    const content = buildUserMessage(platforms)

    // Should be an array of content blocks
    expect(Array.isArray(content)).toBe(true)

    // Find text blocks
    const textBlocks = content.filter(
      (b): b is { type: 'text'; text: string } => b.type === 'text'
    )

    // Header should mention 1 platform
    expect(textBlocks[0].text).toContain('1 platform(s)')

    // Platform header should include name and URL
    const platformHeader = textBlocks.find((b) =>
      b.text.includes('--- PLATFORM:')
    )
    expect(platformHeader).toBeDefined()
    expect(platformHeader!.text).toContain('Website')
    expect(platformHeader!.text).toContain('https://janedoe.com')
    expect(platformHeader!.text).toContain('Auto-fetched content')

    // Content block should include title, description, headings, links
    const contentBlock = textBlocks.find((b) => b.text.includes('Title:'))
    expect(contentBlock).toBeDefined()
    expect(contentBlock!.text).toContain('Jane Doe Art')
    expect(contentBlock!.text).toContain('Oil paintings and mixed media')
    expect(contentBlock!.text).toContain('About | Gallery | Contact')
    expect(contentBlock!.text).toContain('https://instagram.com/janedoe')
    expect(contentBlock!.text).toContain('Profile photo URL:')
  })

  it('includes image content for platforms with screenshots', () => {
    const platforms: PlatformEntry[] = [
      makePlatformEntry({
        platform: 'instagram',
        url: 'https://instagram.com/janedoe',
        fetchable: false,
        screenshot: makeScreenshot(),
      }),
    ]

    const content = buildUserMessage(platforms)

    // Should contain an image block
    const imageBlocks = content.filter(
      (b): b is { type: 'image'; source: { type: 'base64'; media_type: string; data: string } } =>
        b.type === 'image'
    )
    expect(imageBlocks).toHaveLength(1)
    expect(imageBlocks[0].source.type).toBe('base64')
    expect(imageBlocks[0].source.media_type).toBe('image/png')
    // base64 data should have the data URL prefix stripped
    expect(imageBlocks[0].source.data).toBe('iVBORw0KGgoAAAANS')

    // Should have a text block describing the screenshot
    const textBlocks = content.filter(
      (b): b is { type: 'text'; text: string } => b.type === 'text'
    )
    const screenshotLabel = textBlocks.find((b) =>
      b.text.includes('[Screenshot of')
    )
    expect(screenshotLabel).toBeDefined()
    expect(screenshotLabel!.text).toContain('Instagram')
  })

  it('includes platform headers with names and URLs', () => {
    const platforms: PlatformEntry[] = [
      makePlatformEntry({
        platform: 'linkedin',
        url: 'https://linkedin.com/in/janedoe',
      }),
      makePlatformEntry({
        platform: 'behance',
        url: 'https://behance.net/janedoe',
      }),
    ]

    const content = buildUserMessage(platforms)
    const textBlocks = content.filter(
      (b): b is { type: 'text'; text: string } => b.type === 'text'
    )

    // Header should mention 2 platforms
    expect(textBlocks[0].text).toContain('2 platform(s)')

    // Should have headers for both platforms
    const headers = textBlocks.filter((b) =>
      b.text.includes('--- PLATFORM:')
    )
    expect(headers).toHaveLength(2)
    expect(headers[0].text).toContain('LinkedIn')
    expect(headers[0].text).toContain('https://linkedin.com/in/janedoe')
    expect(headers[1].text).toContain('Behance')
    expect(headers[1].text).toContain('https://behance.net/janedoe')
  })

  it('truncates long text content to 2000 characters', () => {
    const longText = 'X'.repeat(5000)
    const platforms: PlatformEntry[] = [
      makePlatformEntry({
        fetchedContent: makeExtractedContent({ textContent: longText }),
      }),
    ]

    const content = buildUserMessage(platforms)
    const textBlocks = content.filter(
      (b): b is { type: 'text'; text: string } => b.type === 'text'
    )

    // The block containing page content should have truncated text
    const pageContentBlock = textBlocks.find((b) =>
      b.text.includes('Page content:')
    )
    expect(pageContentBlock).toBeDefined()
    // Should contain exactly 2000 X's (truncated), not all 5000
    const xCount = (pageContentBlock!.text.match(/X/g) || []).length
    expect(xCount).toBe(2000)
  })

  it('handles platforms with no data (URL only)', () => {
    const platforms: PlatformEntry[] = [
      makePlatformEntry({
        platform: 'twitter',
        url: 'https://twitter.com/janedoe',
        fetchable: false,
        fetchStatus: 'pending',
      }),
    ]

    const content = buildUserMessage(platforms)
    const textBlocks = content.filter(
      (b): b is { type: 'text'; text: string } => b.type === 'text'
    )

    // Should indicate no data available
    const header = textBlocks.find((b) => b.text.includes('--- PLATFORM:'))
    expect(header).toBeDefined()
    expect(header!.text).toContain('URL only (no data available)')
  })

  it('handles fetched content without headings or links', () => {
    const platforms: PlatformEntry[] = [
      makePlatformEntry({
        fetchedContent: makeExtractedContent({
          headings: [],
          links: [],
          images: {},
          textContent: '',
        }),
      }),
    ]

    const content = buildUserMessage(platforms)
    const textBlocks = content.filter(
      (b): b is { type: 'text'; text: string } => b.type === 'text'
    )

    // Should still have title and description, but not headings/links lines
    const dataBlock = textBlocks.find((b) => b.text.includes('Title:'))
    expect(dataBlock).toBeDefined()
    expect(dataBlock!.text).not.toContain('Headings:')
    expect(dataBlock!.text).not.toContain('Outbound links:')
    expect(dataBlock!.text).not.toContain('Profile photo URL:')
    expect(dataBlock!.text).not.toContain('Page content:')
  })

  it('strips data URL prefix from screenshot base64 data', () => {
    const platforms: PlatformEntry[] = [
      makePlatformEntry({
        platform: 'instagram',
        url: 'https://instagram.com/janedoe',
        fetchable: false,
        screenshot: makeScreenshot({
          data: 'data:image/jpeg;base64,/9j/4AAQSkZJRg',
          mimeType: 'image/jpeg' as const,
        }),
      }),
    ]

    const content = buildUserMessage(platforms)
    const imageBlock = content.find(
      (b): b is { type: 'image'; source: { type: 'base64'; media_type: string; data: string } } =>
        b.type === 'image'
    )

    expect(imageBlock).toBeDefined()
    expect(imageBlock!.source.data).toBe('/9j/4AAQSkZJRg')
    expect(imageBlock!.source.data).not.toContain('data:')
  })

  it('handles screenshot data without data URL prefix', () => {
    const platforms: PlatformEntry[] = [
      makePlatformEntry({
        platform: 'instagram',
        url: 'https://instagram.com/janedoe',
        fetchable: false,
        screenshot: makeScreenshot({
          data: 'iVBORw0KGgoAAAANSUhEUg',
        }),
      }),
    ]

    const content = buildUserMessage(platforms)
    const imageBlock = content.find(
      (b): b is { type: 'image'; source: { type: 'base64'; media_type: string; data: string } } =>
        b.type === 'image'
    )

    expect(imageBlock).toBeDefined()
    expect(imageBlock!.source.data).toBe('iVBORw0KGgoAAAANSUhEUg')
  })

  it('includes closing analysis instruction', () => {
    const platforms: PlatformEntry[] = [makePlatformEntry()]

    const content = buildUserMessage(platforms)
    const textBlocks = content.filter(
      (b): b is { type: 'text'; text: string } => b.type === 'text'
    )

    const lastBlock = textBlocks[textBlocks.length - 1]
    expect(lastBlock.text).toContain(
      'Analyze these platforms and provide the brand health report as a JSON object.'
    )
  })
})

describe('estimateTokens', () => {
  it('returns a base estimate for platforms with no content', () => {
    const platforms: PlatformEntry[] = [makePlatformEntry()]

    const estimate = estimateTokens(platforms)

    // 1500 (system) + 100 (per-platform overhead) = 1600
    expect(estimate).toBe(1600)
  })

  it('increases estimate for fetched content', () => {
    const platforms: PlatformEntry[] = [
      makePlatformEntry({
        fetchedContent: makeExtractedContent({
          textContent: 'A'.repeat(400), // 400 chars = ~100 tokens
          title: 'Test', // 4 chars = ~1 token
          description: 'Test desc', // 9 chars = ~2-3 tokens
        }),
      }),
    ]

    const estimate = estimateTokens(platforms)

    // 1500 + ceil((400 + 4 + 9) / 4) + 100 = 1500 + 104 + 100 = 1704
    expect(estimate).toBe(1704)
  })

  it('adds 1600 tokens per screenshot', () => {
    const platforms: PlatformEntry[] = [
      makePlatformEntry({
        screenshot: makeScreenshot(),
      }),
    ]

    const estimate = estimateTokens(platforms)

    // 1500 + 1600 (screenshot) + 100 (overhead) = 3200
    expect(estimate).toBe(3200)
  })

  it('accumulates estimates for multiple platforms', () => {
    const platforms: PlatformEntry[] = [
      makePlatformEntry({
        fetchedContent: makeExtractedContent({
          textContent: 'A'.repeat(400),
          title: '',
          description: '',
        }),
      }),
      makePlatformEntry({
        screenshot: makeScreenshot(),
      }),
    ]

    const estimate = estimateTokens(platforms)

    // 1500 + (ceil(400/4) + 100) + (1600 + 100) = 1500 + 200 + 1700 = 3400
    expect(estimate).toBe(3400)
  })
})
