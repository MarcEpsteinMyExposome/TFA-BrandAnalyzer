// Mock the Anthropic SDK to avoid needing fetch in jsdom
const MockAnthropicClass = jest.fn().mockImplementation(() => ({
  messages: { create: jest.fn() },
}))

jest.mock('@anthropic-ai/sdk', () => ({
  __esModule: true,
  default: MockAnthropicClass,
}))

describe('client', () => {
  const originalEnv = process.env

  beforeEach(() => {
    // Reset module cache so the singleton resets
    jest.resetModules()
    // Re-apply the mock after resetModules
    jest.mock('@anthropic-ai/sdk', () => ({
      __esModule: true,
      default: MockAnthropicClass,
    }))
    MockAnthropicClass.mockClear()
    // Clone env
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('throws error when ANTHROPIC_API_KEY is not set', () => {
    delete process.env.ANTHROPIC_API_KEY

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getAnthropicClient } = require('@/lib/analysis/client')

    expect(() => getAnthropicClient()).toThrow(
      'ANTHROPIC_API_KEY environment variable is not set'
    )
  })

  it('returns a client instance when ANTHROPIC_API_KEY is set', () => {
    process.env.ANTHROPIC_API_KEY = 'test-key-12345'

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getAnthropicClient } = require('@/lib/analysis/client')

    const client = getAnthropicClient()
    expect(client).toBeDefined()
    expect(client).not.toBeNull()
    expect(MockAnthropicClass).toHaveBeenCalledWith({ apiKey: 'test-key-12345' })
  })

  it('returns the same client instance on subsequent calls (singleton)', () => {
    process.env.ANTHROPIC_API_KEY = 'test-key-12345'

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getAnthropicClient } = require('@/lib/analysis/client')

    const client1 = getAnthropicClient()
    const client2 = getAnthropicClient()
    expect(client1).toBe(client2)
    // Should only construct once
    expect(MockAnthropicClass).toHaveBeenCalledTimes(1)
  })

  it('exports the correct model constant', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { ANALYSIS_MODEL } = require('@/lib/analysis/client')

    expect(ANALYSIS_MODEL).toBe('claude-sonnet-4-5-20250929')
  })

  it('exports MAX_TOKENS as 8192', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { MAX_TOKENS } = require('@/lib/analysis/client')

    expect(MAX_TOKENS).toBe(8192)
  })
})
