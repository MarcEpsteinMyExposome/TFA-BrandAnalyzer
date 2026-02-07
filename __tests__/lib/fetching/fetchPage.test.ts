import { fetchPage } from '@/lib/fetching/fetchPage'

// Mock extractContent so we can isolate fetchPage logic
jest.mock('@/lib/fetching/extractContent', () => ({
  extractContent: jest.fn(() => ({
    title: 'Test Page',
    description: 'A test page description',
    headings: ['Welcome'],
    links: [],
    images: {},
    colors: [],
    textContent: 'Some text content',
  })),
}))

describe('fetchPage', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  it('returns success with extracted content for a valid page', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: jest.fn().mockResolvedValue('<html><head><title>Test</title></head><body>Hello</body></html>'),
    })

    const result = await fetchPage('https://example.com')

    expect(result.success).toBe(true)
    expect(result.content).toBeDefined()
    expect(result.content?.title).toBe('Test Page')
    expect(result.error).toBeUndefined()
  })

  it('sends correct headers with the request', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: jest.fn().mockResolvedValue('<html></html>'),
    })

    await fetchPage('https://example.com')

    expect(global.fetch).toHaveBeenCalledWith(
      'https://example.com',
      expect.objectContaining({
        headers: expect.objectContaining({
          'User-Agent': expect.stringContaining('TFABrandAnalyzer'),
          Accept: 'text/html,application/xhtml+xml',
        }),
      })
    )
  })

  it('returns error for HTTP 404 response', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    })

    const result = await fetchPage('https://example.com/nonexistent')

    expect(result.success).toBe(false)
    expect(result.error).toBe('HTTP 404: Not Found')
    expect(result.content).toBeUndefined()
  })

  it('returns error for HTTP 403 response', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 403,
      statusText: 'Forbidden',
    })

    const result = await fetchPage('https://example.com/private')

    expect(result.success).toBe(false)
    expect(result.error).toBe('HTTP 403: Forbidden')
  })

  it('returns error for HTTP 500 response', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    })

    const result = await fetchPage('https://example.com/broken')

    expect(result.success).toBe(false)
    expect(result.error).toBe('HTTP 500: Internal Server Error')
  })

  it('returns timeout error when fetch aborts', async () => {
    const abortError = new Error('The operation was aborted')
    abortError.name = 'AbortError'

    global.fetch = jest.fn().mockRejectedValue(abortError)

    const result = await fetchPage('https://slow-site.com')

    expect(result.success).toBe(false)
    expect(result.error).toBe('Request timed out (10s limit)')
  })

  it('handles network errors gracefully', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network failure'))

    const result = await fetchPage('https://unreachable.com')

    expect(result.success).toBe(false)
    expect(result.error).toBe('Network failure')
  })

  it('handles non-Error thrown values', async () => {
    global.fetch = jest.fn().mockRejectedValue('string error')

    const result = await fetchPage('https://example.com')

    expect(result.success).toBe(false)
    expect(result.error).toBe('Unknown error')
  })
})
