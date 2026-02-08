import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import UrlInputStep from '@/components/analyze/UrlInputStep'

// Mock the Zustand store
jest.mock('@/lib/store/analysisStore')

import { useAnalysisStore } from '@/lib/store/analysisStore'

// Mock platform registry functions
jest.mock('@/lib/platforms/registry', () => ({
  getPlatform: jest.fn((id: string) => {
    const platforms: Record<string, { id: string; name: string; fetchable: boolean }> = {
      instagram: { id: 'instagram', name: 'Instagram', fetchable: false },
      linkedin: { id: 'linkedin', name: 'LinkedIn', fetchable: true },
      behance: { id: 'behance', name: 'Behance', fetchable: true },
      website: { id: 'website', name: 'Website', fetchable: true },
    }
    return platforms[id] || { id: 'other', name: 'Other', fetchable: true }
  }),
  PLATFORM_LIST: [
    { id: 'linkedin', name: 'LinkedIn', fetchable: true, urlPatterns: [], icon: '', dataPoints: [] },
    { id: 'behance', name: 'Behance', fetchable: true, urlPatterns: [], icon: '', dataPoints: [] },
    { id: 'instagram', name: 'Instagram', fetchable: false, urlPatterns: [], icon: '', dataPoints: [] },
  ],
}))

describe('UrlInputStep', () => {
  const mockAddPlatform = jest.fn()
  const mockRemovePlatform = jest.fn()
  const mockUpdatePlatformUrl = jest.fn()

  function setupMockStore(overrides: Record<string, unknown> = {}) {
    const mockState = {
      step: 'urls',
      platforms: [],
      report: null,
      isAnalyzing: false,
      error: null,
      addPlatform: mockAddPlatform,
      removePlatform: mockRemovePlatform,
      updatePlatformUrl: mockUpdatePlatformUrl,
      updateFetchStatus: jest.fn(),
      addScreenshot: jest.fn(),
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
    setupMockStore()
  })

  it('renders heading and description', () => {
    render(<UrlInputStep onNext={jest.fn()} />)

    expect(
      screen.getByRole('heading', { name: /add your platform links/i })
    ).toBeInTheDocument()
    expect(
      screen.getByText(/enter urls to your online profiles/i)
    ).toBeInTheDocument()
  })

  it('shows "Next" button that is disabled initially (no platforms)', () => {
    render(<UrlInputStep onNext={jest.fn()} />)

    const nextButton = screen.getByRole('button', { name: /next/i })
    expect(nextButton).toBeInTheDocument()
    expect(nextButton).toBeDisabled()
  })

  it('shows platform count as "0 of 10 platforms"', () => {
    render(<UrlInputStep onNext={jest.fn()} />)

    expect(screen.getByText('0 of 10 platforms')).toBeInTheDocument()
  })

  it('renders PlatformUrlField components for each platform in the store', () => {
    setupMockStore({
      platforms: [
        { platform: 'instagram', url: 'https://instagram.com/test', fetchable: false, fetchStatus: 'pending' },
        { platform: 'linkedin', url: 'https://linkedin.com/in/test', fetchable: true, fetchStatus: 'pending' },
      ],
    })

    render(<UrlInputStep onNext={jest.fn()} />)

    expect(screen.getByLabelText('Instagram URL')).toBeInTheDocument()
    expect(screen.getByLabelText('LinkedIn URL')).toBeInTheDocument()
    expect(screen.getByText('2 of 10 platforms')).toBeInTheDocument()
  })

  it('enables Next button when 2+ platforms have valid URLs', () => {
    setupMockStore({
      platforms: [
        { platform: 'instagram', url: 'https://instagram.com/test', fetchable: false, fetchStatus: 'pending' },
        { platform: 'linkedin', url: 'https://linkedin.com/in/test', fetchable: true, fetchStatus: 'pending' },
      ],
    })

    render(<UrlInputStep onNext={jest.fn()} />)

    const nextButton = screen.getByRole('button', { name: /next/i })
    expect(nextButton).not.toBeDisabled()
  })

  it('keeps Next button disabled with only 1 platform', () => {
    setupMockStore({
      platforms: [
        { platform: 'instagram', url: 'https://instagram.com/test', fetchable: false, fetchStatus: 'pending' },
      ],
    })

    render(<UrlInputStep onNext={jest.fn()} />)

    const nextButton = screen.getByRole('button', { name: /next/i })
    expect(nextButton).toBeDisabled()
  })

  it('calls onNext when Next is clicked with valid data', async () => {
    const user = userEvent.setup()
    const onNext = jest.fn()

    setupMockStore({
      platforms: [
        { platform: 'instagram', url: 'https://instagram.com/test', fetchable: false, fetchStatus: 'pending' },
        { platform: 'linkedin', url: 'https://linkedin.com/in/test', fetchable: true, fetchStatus: 'pending' },
      ],
    })

    render(<UrlInputStep onNext={onNext} />)

    await user.click(screen.getByRole('button', { name: /next/i }))
    expect(onNext).toHaveBeenCalledTimes(1)
  })

  it('shows the Add Platform button', () => {
    render(<UrlInputStep onNext={jest.fn()} />)

    expect(screen.getByRole('button', { name: /add platform/i })).toBeInTheDocument()
  })

  it('calls store.addPlatform when a platform is added via dropdown', async () => {
    const user = userEvent.setup()
    render(<UrlInputStep onNext={jest.fn()} />)

    await user.click(screen.getByRole('button', { name: /add platform/i }))
    await user.click(screen.getByText('Behance'))

    expect(mockAddPlatform).toHaveBeenCalledWith('behance', '', true)
  })

  it('calls store.removePlatform when a platform is removed', async () => {
    const user = userEvent.setup()

    setupMockStore({
      platforms: [
        { platform: 'instagram', url: 'https://instagram.com/test', fetchable: false, fetchStatus: 'pending' },
        { platform: 'linkedin', url: 'https://linkedin.com/in/test', fetchable: true, fetchStatus: 'pending' },
      ],
    })

    render(<UrlInputStep onNext={jest.fn()} />)

    // Remove the first platform (Instagram)
    await user.click(screen.getByRole('button', { name: 'Remove Instagram' }))
    expect(mockRemovePlatform).toHaveBeenCalledWith(0)
  })
})
