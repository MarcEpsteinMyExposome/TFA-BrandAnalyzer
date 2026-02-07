import { renderHook, act } from '@testing-library/react'
import { useAnalysis } from '@/lib/analysis/useAnalysis'

// Polyfill TextEncoder/TextDecoder for jsdom
import { TextEncoder, TextDecoder } from 'util'
if (typeof globalThis.TextEncoder === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  globalThis.TextEncoder = TextEncoder as any
}
if (typeof globalThis.TextDecoder === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  globalThis.TextDecoder = TextDecoder as any
}

// Valid report for mock responses
const mockReport = {
  summary: 'Test summary',
  consistency: {
    overallScore: 80,
    categories: [],
    mismatches: [],
  },
  completeness: {
    overallScore: 70,
    categories: [],
    gaps: [],
  },
  actionItems: [],
}

// Helper to create a mock platform entry
function mockPlatform() {
  return {
    platform: 'website' as const,
    url: 'https://example.com',
    fetchable: true,
    fetchStatus: 'success' as const,
  }
}

// Helper to create a mock ReadableStream reader from SSE data lines
function createMockReader(lines: string[]) {
  const encoder = new TextEncoder()
  let index = 0
  return {
    read: jest.fn().mockImplementation(() => {
      if (index < lines.length) {
        const value = encoder.encode(lines[index])
        index++
        return Promise.resolve({ done: false, value })
      }
      return Promise.resolve({ done: true, value: undefined })
    }),
  }
}

describe('useAnalysis', () => {
  const originalFetch = global.fetch

  afterEach(() => {
    global.fetch = originalFetch
  })

  it('has correct initial state', () => {
    const { result } = renderHook(() => useAnalysis())

    expect(result.current.isAnalyzing).toBe(false)
    expect(result.current.streamingText).toBe('')
    expect(result.current.report).toBeNull()
    expect(result.current.error).toBeNull()
    expect(typeof result.current.analyze).toBe('function')
  })

  it('sets isAnalyzing to true when analyze is called', async () => {
    // Mock fetch that resolves after we can check state
    let resolveFetch!: (value: unknown) => void
    global.fetch = jest.fn(
      () => new Promise((resolve) => {
        resolveFetch = resolve
      })
    )

    const { result } = renderHook(() => useAnalysis())

    // Start analysis but don't await it
    let analyzePromise: Promise<void>
    act(() => {
      analyzePromise = result.current.analyze([mockPlatform()])
    })

    // isAnalyzing should be true while waiting
    expect(result.current.isAnalyzing).toBe(true)

    // Now resolve with a valid response that has a reader
    const reader = createMockReader(['data: [DONE]\n\n'])
    await act(async () => {
      resolveFetch({
        ok: true,
        status: 200,
        body: { getReader: () => reader },
      })
      await analyzePromise
    })

    expect(result.current.isAnalyzing).toBe(false)
  })

  it('sets error on fetch failure (non-200 response)', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Server error' }),
    })

    const { result } = renderHook(() => useAnalysis())

    await act(async () => {
      await result.current.analyze([mockPlatform()])
    })

    expect(result.current.error).toBe('Server error')
    expect(result.current.isAnalyzing).toBe(false)
  })

  it('sets error on network failure', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useAnalysis())

    await act(async () => {
      await result.current.analyze([mockPlatform()])
    })

    expect(result.current.error).toBe('Network error')
    expect(result.current.isAnalyzing).toBe(false)
  })

  it('accumulates streaming text from SSE events', async () => {
    const reader = createMockReader([
      `data: ${JSON.stringify({ type: 'text', text: 'Hello ' })}\n\n`,
      `data: ${JSON.stringify({ type: 'text', text: 'world' })}\n\n`,
      'data: [DONE]\n\n',
    ])

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      body: { getReader: () => reader },
    })

    const { result } = renderHook(() => useAnalysis())

    await act(async () => {
      await result.current.analyze([mockPlatform()])
    })

    expect(result.current.streamingText).toBe('Hello world')
    expect(result.current.isAnalyzing).toBe(false)
  })

  it('sets report when SSE report event is received', async () => {
    const reader = createMockReader([
      `data: ${JSON.stringify({ type: 'text', text: '{"test":true}' })}\n\n`,
      `data: ${JSON.stringify({ type: 'report', report: mockReport })}\n\n`,
      'data: [DONE]\n\n',
    ])

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      body: { getReader: () => reader },
    })

    const { result } = renderHook(() => useAnalysis())

    await act(async () => {
      await result.current.analyze([mockPlatform()])
    })

    expect(result.current.report).toEqual(mockReport)
    expect(result.current.isAnalyzing).toBe(false)
  })

  it('sets error when SSE error event is received', async () => {
    const reader = createMockReader([
      `data: ${JSON.stringify({ type: 'error', error: 'Parse failed' })}\n\n`,
      'data: [DONE]\n\n',
    ])

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      body: { getReader: () => reader },
    })

    const { result } = renderHook(() => useAnalysis())

    await act(async () => {
      await result.current.analyze([mockPlatform()])
    })

    expect(result.current.error).toBe('Parse failed')
    expect(result.current.isAnalyzing).toBe(false)
  })

  it('resets state when analyze is called again', async () => {
    // First call: error
    global.fetch = jest.fn().mockRejectedValue(new Error('First error'))

    const { result } = renderHook(() => useAnalysis())

    await act(async () => {
      await result.current.analyze([mockPlatform()])
    })

    expect(result.current.error).toBe('First error')

    // Second call: success
    const reader = createMockReader([
      `data: ${JSON.stringify({ type: 'report', report: mockReport })}\n\n`,
      'data: [DONE]\n\n',
    ])

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      body: { getReader: () => reader },
    })

    await act(async () => {
      await result.current.analyze([mockPlatform()])
    })

    // Error should be cleared, report should be set
    expect(result.current.error).toBeNull()
    expect(result.current.report).toEqual(mockReport)
  })

  it('handles response with no body', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      body: null,
    })

    const { result } = renderHook(() => useAnalysis())

    await act(async () => {
      await result.current.analyze([mockPlatform()])
    })

    expect(result.current.error).toBe('No response body')
    expect(result.current.isAnalyzing).toBe(false)
  })

  it('handles non-200 response without JSON body', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({}),
    })

    const { result } = renderHook(() => useAnalysis())

    await act(async () => {
      await result.current.analyze([mockPlatform()])
    })

    expect(result.current.error).toBe('HTTP 503')
    expect(result.current.isAnalyzing).toBe(false)
  })
})
