import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ScreenshotStep from '@/components/analyze/ScreenshotStep'

// Mock the Zustand store
jest.mock('@/lib/store/analysisStore')

import { useAnalysisStore } from '@/lib/store/analysisStore'

// Mock platform registry
jest.mock('@/lib/platforms/registry', () => ({
  getPlatform: jest.fn((id: string) => {
    const platforms: Record<
      string,
      {
        id: string
        name: string
        fetchable: boolean
        screenshotInstructions?: string
        dataPoints: string[]
      }
    > = {
      instagram: {
        id: 'instagram',
        name: 'Instagram',
        fetchable: false,
        screenshotInstructions:
          'Go to your profile page, scroll to show your bio and recent posts.',
        dataPoints: ['profilePhoto', 'bio', 'displayName', 'linkInBio', 'recentPosts'],
      },
      tiktok: {
        id: 'tiktok',
        name: 'TikTok',
        fetchable: false,
        screenshotInstructions:
          'Open your profile page showing your bio, follower count, and recent videos.',
        dataPoints: ['displayName', 'bio', 'profilePhoto', 'followerCount', 'recentVideos'],
      },
      facebook: {
        id: 'facebook',
        name: 'Facebook',
        fetchable: false,
        screenshotInstructions:
          'Navigate to your artist page or profile.',
        dataPoints: ['pageName', 'about', 'profilePhoto', 'coverPhoto'],
      },
      linkedin: {
        id: 'linkedin',
        name: 'LinkedIn',
        fetchable: true,
        dataPoints: ['headline', 'summary'],
      },
      behance: {
        id: 'behance',
        name: 'Behance',
        fetchable: true,
        dataPoints: ['displayName', 'bio'],
      },
    }
    return platforms[id] || { id: 'other', name: 'Other', fetchable: true, dataPoints: [] }
  }),
}))

// Mock screenshot sub-components to simplify testing
jest.mock('@/components/screenshots/ScreenshotGuide', () => {
  return function MockScreenshotGuide({
    platformName,
  }: {
    platformName: string
  }) {
    return <div data-testid={`guide-${platformName}`}>Guide for {platformName}</div>
  }
})

jest.mock('@/components/screenshots/ScreenshotUpload', () => {
  return function MockScreenshotUpload({
    platformId,
  }: {
    platformId: string
  }) {
    return <div data-testid={`upload-${platformId}`}>Upload for {platformId}</div>
  }
})

describe('ScreenshotStep', () => {
  const mockSetScreenshot = jest.fn()
  const mockRemoveScreenshot = jest.fn()

  function setupMockStore(overrides: Record<string, unknown> = {}) {
    const mockState = {
      step: 'screenshots',
      platforms: [],
      report: null,
      isAnalyzing: false,
      error: null,
      addPlatform: jest.fn(),
      removePlatform: jest.fn(),
      updatePlatformUrl: jest.fn(),
      updateFetchStatus: jest.fn(),
      addScreenshot: mockSetScreenshot,
      removeScreenshot: mockRemoveScreenshot,
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

  it('shows only non-fetchable platforms', () => {
    setupMockStore({
      platforms: [
        {
          platform: 'instagram',
          url: 'https://instagram.com/artist',
          fetchable: false,
          fetchStatus: 'pending',
        },
        {
          platform: 'linkedin',
          url: 'https://linkedin.com/in/artist',
          fetchable: true,
          fetchStatus: 'pending',
        },
        {
          platform: 'tiktok',
          url: 'https://tiktok.com/@artist',
          fetchable: false,
          fetchStatus: 'pending',
        },
      ],
    })

    render(<ScreenshotStep onNext={jest.fn()} onBack={jest.fn()} />)

    // Should show Instagram and TikTok
    expect(screen.getByText('Instagram')).toBeInTheDocument()
    expect(screen.getByText('TikTok')).toBeInTheDocument()

    // Should NOT show LinkedIn (it's fetchable)
    expect(screen.queryByText('LinkedIn')).not.toBeInTheDocument()
  })

  it('shows guide and upload for each non-fetchable platform', () => {
    setupMockStore({
      platforms: [
        {
          platform: 'instagram',
          url: 'https://instagram.com/artist',
          fetchable: false,
          fetchStatus: 'pending',
        },
        {
          platform: 'tiktok',
          url: 'https://tiktok.com/@artist',
          fetchable: false,
          fetchStatus: 'pending',
        },
      ],
    })

    render(<ScreenshotStep onNext={jest.fn()} onBack={jest.fn()} />)

    expect(screen.getByTestId('guide-Instagram')).toBeInTheDocument()
    expect(screen.getByTestId('upload-instagram')).toBeInTheDocument()
    expect(screen.getByTestId('guide-TikTok')).toBeInTheDocument()
    expect(screen.getByTestId('upload-tiktok')).toBeInTheDocument()
  })

  it('has Back and Next buttons', () => {
    setupMockStore({
      platforms: [
        {
          platform: 'instagram',
          url: 'https://instagram.com/artist',
          fetchable: false,
          fetchStatus: 'pending',
        },
      ],
    })

    render(<ScreenshotStep onNext={jest.fn()} onBack={jest.fn()} />)

    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument()
  })

  it('Next button is always enabled (screenshots are optional)', () => {
    setupMockStore({
      platforms: [
        {
          platform: 'instagram',
          url: 'https://instagram.com/artist',
          fetchable: false,
          fetchStatus: 'pending',
        },
        {
          platform: 'tiktok',
          url: 'https://tiktok.com/@artist',
          fetchable: false,
          fetchStatus: 'pending',
        },
      ],
    })

    render(<ScreenshotStep onNext={jest.fn()} onBack={jest.fn()} />)

    const nextButton = screen.getByRole('button', { name: /next/i })
    expect(nextButton).not.toBeDisabled()
  })

  it('shows upload count', () => {
    setupMockStore({
      platforms: [
        {
          platform: 'instagram',
          url: 'https://instagram.com/artist',
          fetchable: false,
          fetchStatus: 'pending',
          screenshots: [
            {
              data: 'data:image/png;base64,abc',
              mimeType: 'image/png',
              fileName: 'ig.png',
              fileSize: 1000,
            },
          ],
        },
        {
          platform: 'tiktok',
          url: 'https://tiktok.com/@artist',
          fetchable: false,
          fetchStatus: 'pending',
        },
      ],
    })

    render(<ScreenshotStep onNext={jest.fn()} onBack={jest.fn()} />)

    expect(screen.getByText('1 of 2 platforms have screenshots')).toBeInTheDocument()
  })

  it('calls onBack when Back button is clicked', async () => {
    const user = userEvent.setup()
    const onBack = jest.fn()

    setupMockStore({
      platforms: [
        {
          platform: 'instagram',
          url: 'https://instagram.com/artist',
          fetchable: false,
          fetchStatus: 'pending',
        },
      ],
    })

    render(<ScreenshotStep onNext={jest.fn()} onBack={onBack} />)

    await user.click(screen.getByRole('button', { name: /back/i }))
    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('calls onNext when Next button is clicked', async () => {
    const user = userEvent.setup()
    const onNext = jest.fn()

    setupMockStore({
      platforms: [
        {
          platform: 'instagram',
          url: 'https://instagram.com/artist',
          fetchable: false,
          fetchStatus: 'pending',
        },
      ],
    })

    render(<ScreenshotStep onNext={onNext} onBack={jest.fn()} />)

    await user.click(screen.getByRole('button', { name: /next/i }))
    expect(onNext).toHaveBeenCalledTimes(1)
  })

  it('shows skip message when all platforms are fetchable', () => {
    setupMockStore({
      platforms: [
        {
          platform: 'linkedin',
          url: 'https://linkedin.com/in/artist',
          fetchable: true,
          fetchStatus: 'pending',
        },
        {
          platform: 'behance',
          url: 'https://behance.net/artist',
          fetchable: true,
          fetchStatus: 'pending',
        },
      ],
    })

    render(<ScreenshotStep onNext={jest.fn()} onBack={jest.fn()} />)

    expect(
      screen.getByText(/no screenshots needed/i)
    ).toBeInTheDocument()
  })

  it('still shows Back and Next when no screenshots needed', () => {
    setupMockStore({
      platforms: [
        {
          platform: 'linkedin',
          url: 'https://linkedin.com/in/artist',
          fetchable: true,
          fetchStatus: 'pending',
        },
      ],
    })

    render(<ScreenshotStep onNext={jest.fn()} onBack={jest.fn()} />)

    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument()
  })

  it('shows "Skip this platform" link for platforms without screenshots', () => {
    setupMockStore({
      platforms: [
        {
          platform: 'instagram',
          url: 'https://instagram.com/artist',
          fetchable: false,
          fetchStatus: 'pending',
        },
        {
          platform: 'tiktok',
          url: 'https://tiktok.com/@artist',
          fetchable: false,
          fetchStatus: 'pending',
        },
      ],
    })

    render(<ScreenshotStep onNext={jest.fn()} onBack={jest.fn()} />)

    const skipButtons = screen.getAllByText('Skip this platform')
    expect(skipButtons).toHaveLength(2)
  })
})
