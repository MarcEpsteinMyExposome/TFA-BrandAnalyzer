import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProcessingStep from '@/components/analyze/ProcessingStep'

// Mock the Zustand store
jest.mock('@/lib/store/analysisStore')

import { useAnalysisStore } from '@/lib/store/analysisStore'

// Mock platform registry
jest.mock('@/lib/platforms/registry', () => ({
  getPlatform: jest.fn((id: string) => {
    const platforms: Record<string, { id: string; name: string; fetchable: boolean }> = {
      website: { id: 'website', name: 'Website', fetchable: true },
      linkedin: { id: 'linkedin', name: 'LinkedIn', fetchable: true },
      behance: { id: 'behance', name: 'Behance', fetchable: true },
      instagram: { id: 'instagram', name: 'Instagram', fetchable: false },
      tiktok: { id: 'tiktok', name: 'TikTok', fetchable: false },
    }
    return platforms[id] || { id: 'other', name: 'Other', fetchable: true }
  }),
  PLATFORM_LIST: [],
}))

describe('ProcessingStep', () => {
  const mockUpdateFetchStatus = jest.fn()

  function setupMockStore(overrides: Record<string, unknown> = {}) {
    const mockState = {
      step: 'processing',
      platforms: [],
      report: null,
      isAnalyzing: false,
      error: null,
      addPlatform: jest.fn(),
      removePlatform: jest.fn(),
      updatePlatformUrl: jest.fn(),
      updateFetchStatus: mockUpdateFetchStatus,
      setScreenshot: jest.fn(),
      removeScreenshot: jest.fn(),
      setReport: jest.fn(),
      setStep: jest.fn(),
      setIsAnalyzing: jest.fn(),
      setError: jest.fn(),
      reset: jest.fn(),
      ...overrides,
    }

    ;(useAnalysisStore as unknown as jest.Mock).mockImplementation(
      (selector?: (state: typeof mockState) => unknown) =>
        selector ? selector(mockState) : mockState
    )

    return mockState
  }

  beforeEach(() => {
    jest.clearAllMocks()
    // Default: no fetch calls
    global.fetch = jest.fn()
  })

  it('renders heading and description', () => {
    setupMockStore({ platforms: [] })
    render(<ProcessingStep onComplete={jest.fn()} />)

    expect(
      screen.getByRole('heading', { name: /fetching your platforms/i })
    ).toBeInTheDocument()
    expect(
      screen.getByText(/we are retrieving content/i)
    ).toBeInTheDocument()
  })

  it('renders platform list with names', () => {
    setupMockStore({
      platforms: [
        { platform: 'website', url: 'https://mysite.com', fetchable: true, fetchStatus: 'success' },
        { platform: 'linkedin', url: 'https://linkedin.com/in/me', fetchable: true, fetchStatus: 'fetching' },
      ],
    })
    render(<ProcessingStep onComplete={jest.fn()} />)

    expect(screen.getByText('Website')).toBeInTheDocument()
    expect(screen.getByText('LinkedIn')).toBeInTheDocument()
  })

  it('shows spinner for fetching platforms', () => {
    setupMockStore({
      platforms: [
        { platform: 'behance', url: 'https://behance.net/artist', fetchable: true, fetchStatus: 'fetching' },
      ],
    })
    render(<ProcessingStep onComplete={jest.fn()} />)

    expect(screen.getByRole('status', { name: /fetching/i })).toBeInTheDocument()
    expect(screen.getByText('Fetching...')).toBeInTheDocument()
  })

  it('shows success indicator for completed platforms', () => {
    setupMockStore({
      platforms: [
        { platform: 'website', url: 'https://mysite.com', fetchable: true, fetchStatus: 'success' },
      ],
    })
    render(<ProcessingStep onComplete={jest.fn()} />)

    expect(screen.getByText('Done')).toBeInTheDocument()
    expect(screen.getByLabelText('Success')).toBeInTheDocument()
  })

  it('shows error with retry button for failed platforms', () => {
    setupMockStore({
      platforms: [
        {
          platform: 'linkedin',
          url: 'https://linkedin.com/in/me',
          fetchable: true,
          fetchStatus: 'error',
          fetchError: 'HTTP 403: Forbidden',
        },
      ],
    })
    render(<ProcessingStep onComplete={jest.fn()} />)

    expect(screen.getByText('HTTP 403: Forbidden')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /retry linkedin/i })).toBeInTheDocument()
    expect(screen.getByLabelText('Error')).toBeInTheDocument()
  })

  it('shows "Skipped" for non-fetchable platforms without screenshots', () => {
    setupMockStore({
      platforms: [
        { platform: 'instagram', url: 'https://instagram.com/artist', fetchable: false, fetchStatus: 'pending' },
      ],
    })
    render(<ProcessingStep onComplete={jest.fn()} />)

    expect(screen.getByText('Skipped')).toBeInTheDocument()
    expect(screen.getByLabelText('Skipped')).toBeInTheDocument()
  })

  it('shows "Screenshot provided" for non-fetchable platforms with screenshots', () => {
    setupMockStore({
      platforms: [
        {
          platform: 'instagram',
          url: 'https://instagram.com/artist',
          fetchable: false,
          fetchStatus: 'pending',
          screenshot: { data: 'base64data', mimeType: 'image/png', fileName: 'screen.png', fileSize: 1024 },
        },
      ],
    })
    render(<ProcessingStep onComplete={jest.fn()} />)

    expect(screen.getByText('Screenshot provided')).toBeInTheDocument()
  })

  it('shows "Continue to Analysis" when all fetchable platforms are done', () => {
    setupMockStore({
      platforms: [
        { platform: 'website', url: 'https://mysite.com', fetchable: true, fetchStatus: 'success' },
        { platform: 'linkedin', url: 'https://linkedin.com/in/me', fetchable: true, fetchStatus: 'error', fetchError: 'Timeout' },
        { platform: 'instagram', url: 'https://instagram.com/me', fetchable: false, fetchStatus: 'pending' },
      ],
    })
    render(<ProcessingStep onComplete={jest.fn()} />)

    const continueButton = screen.getByRole('button', { name: /continue to analysis/i })
    expect(continueButton).not.toBeDisabled()
  })

  it('disables "Continue to Analysis" when some platforms are still fetching', () => {
    setupMockStore({
      platforms: [
        { platform: 'website', url: 'https://mysite.com', fetchable: true, fetchStatus: 'success' },
        { platform: 'linkedin', url: 'https://linkedin.com/in/me', fetchable: true, fetchStatus: 'fetching' },
      ],
    })
    render(<ProcessingStep onComplete={jest.fn()} />)

    const continueButton = screen.getByRole('button', { name: /continue to analysis/i })
    expect(continueButton).toBeDisabled()
  })

  it('calls onComplete when "Continue to Analysis" is clicked', async () => {
    const user = userEvent.setup()
    const onComplete = jest.fn()

    setupMockStore({
      platforms: [
        { platform: 'website', url: 'https://mysite.com', fetchable: true, fetchStatus: 'success' },
      ],
    })
    render(<ProcessingStep onComplete={onComplete} />)

    await user.click(screen.getByRole('button', { name: /continue to analysis/i }))
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('retry button re-fetches the platform', async () => {
    const user = userEvent.setup()

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ success: true, content: { title: 'Retried' } }),
    })

    setupMockStore({
      platforms: [
        {
          platform: 'linkedin',
          url: 'https://linkedin.com/in/me',
          fetchable: true,
          fetchStatus: 'error',
          fetchError: 'Previous error',
        },
      ],
    })
    render(<ProcessingStep onComplete={jest.fn()} />)

    await user.click(screen.getByRole('button', { name: /retry linkedin/i }))

    await waitFor(() => {
      expect(mockUpdateFetchStatus).toHaveBeenCalledWith(0, 'fetching')
    })

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/fetch-page', expect.objectContaining({
        method: 'POST',
      }))
    })
  })

  it('triggers fetch on mount for pending fetchable platforms', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ success: true, content: { title: 'Fetched' } }),
    })

    setupMockStore({
      platforms: [
        { platform: 'website', url: 'https://mysite.com', fetchable: true, fetchStatus: 'pending' },
      ],
    })
    render(<ProcessingStep onComplete={jest.fn()} />)

    await waitFor(() => {
      expect(mockUpdateFetchStatus).toHaveBeenCalledWith(0, 'fetching')
    })

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/fetch-page', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ url: 'https://mysite.com', platform: 'website' }),
      }))
    })
  })
})
