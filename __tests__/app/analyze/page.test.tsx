import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock the store module with all fields the real components need
const mockSetStep = jest.fn()
const mockReset = jest.fn()
const mockAddPlatform = jest.fn()
const mockRemovePlatform = jest.fn()
const mockUpdatePlatformUrl = jest.fn()
const mockUpdateFetchStatus = jest.fn()
const mockAddScreenshot = jest.fn()
const mockRemoveScreenshot = jest.fn()
const mockSetReport = jest.fn()
const mockSetIsAnalyzing = jest.fn()
const mockSetError = jest.fn()

let mockStep = 'urls'
let mockPlatforms: Array<{
  platform: string
  url: string
  fetchable: boolean
  fetchStatus: string
  screenshots?: unknown[]
  fetchedContent?: unknown
}> = []
let mockReport: unknown = null

jest.mock('@/lib/store/analysisStore', () => ({
  useAnalysisStore: Object.assign(
    (selector?: (state: Record<string, unknown>) => unknown) => {
      const state = {
        step: mockStep,
        platforms: mockPlatforms,
        report: mockReport,
        isAnalyzing: false,
        error: null,
        setStep: mockSetStep,
        addPlatform: mockAddPlatform,
        removePlatform: mockRemovePlatform,
        updatePlatformUrl: mockUpdatePlatformUrl,
        updateFetchStatus: mockUpdateFetchStatus,
        addScreenshot: mockAddScreenshot,
        removeScreenshot: mockRemoveScreenshot,
        setReport: mockSetReport,
        setIsAnalyzing: mockSetIsAnalyzing,
        setError: mockSetError,
        reset: mockReset,
      }
      return selector ? selector(state) : state
    },
    {
      getState: () => ({
        step: mockStep,
        platforms: mockPlatforms,
        report: mockReport,
        reset: mockReset,
      }),
    }
  ),
}))

// Import AFTER mocking
import AnalyzePage from '@/app/analyze/page'

describe('AnalyzePage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockStep = 'urls'
    mockPlatforms = []
    mockReport = null
  })

  it('renders the header', () => {
    render(<AnalyzePage />)
    expect(screen.getByText('Technology for Artists')).toBeInTheDocument()
  })

  it('renders the footer', () => {
    render(<AnalyzePage />)
    expect(screen.getByText(/© 2026 Technology for Artists/)).toBeInTheDocument()
  })

  it('shows URL input step when step is "urls"', () => {
    render(<AnalyzePage />)
    expect(screen.getByText('Add Your Platform Links')).toBeInTheDocument()
  })

  it('shows screenshot step when step is "screenshots"', () => {
    mockStep = 'screenshots'
    render(<AnalyzePage />)
    expect(screen.getByRole('heading', { name: /screenshots/i })).toBeInTheDocument()
  })

  it('shows processing step when step is "processing"', () => {
    mockStep = 'processing'
    render(<AnalyzePage />)
    expect(screen.getByText('Fetching Your Platforms')).toBeInTheDocument()
  })

  it('shows report step when step is "report"', () => {
    mockStep = 'report'
    render(<AnalyzePage />)
    expect(screen.getByText('No report available.')).toBeInTheDocument()
  })

  it('renders step indicator with navigation', () => {
    render(<AnalyzePage />)
    expect(screen.getByRole('navigation', { name: 'Analysis progress' })).toBeInTheDocument()
  })

  it('renders step indicator labels', () => {
    render(<AnalyzePage />)
    expect(screen.getByText('Add Links')).toBeInTheDocument()
  })

  it('can go back to URLs from screenshots', async () => {
    mockStep = 'screenshots'
    const user = userEvent.setup()
    render(<AnalyzePage />)
    await user.click(screen.getByText('Back'))
    expect(mockSetStep).toHaveBeenCalledWith('urls')
  })

  it('can start new analysis from report', async () => {
    mockStep = 'report'
    const user = userEvent.setup()
    render(<AnalyzePage />)
    await user.click(screen.getByText('Start New Analysis'))
    expect(mockReset).toHaveBeenCalled()
  })

  describe('step indicator navigation', () => {
    it('allows clicking completed steps to navigate back', async () => {
      mockStep = 'processing'
      const user = userEvent.setup()
      render(<AnalyzePage />)

      // Step 1 (urls) is completed, should be a clickable button
      const step1Button = screen.getByRole('button', { name: 'Go back to Step 1: Add Links' })
      await user.click(step1Button)
      expect(mockSetStep).toHaveBeenCalledWith('urls')
    })

    it('allows clicking step 2 when on step 3', async () => {
      mockStep = 'processing'
      const user = userEvent.setup()
      render(<AnalyzePage />)

      const step2Button = screen.getByRole('button', { name: 'Go back to Step 2: Screenshots' })
      await user.click(step2Button)
      expect(mockSetStep).toHaveBeenCalledWith('screenshots')
    })

    it('does not show clickable steps when on step 1', () => {
      mockStep = 'urls'
      render(<AnalyzePage />)

      // No completed steps, so no step navigation buttons
      const navButtons = screen.queryByRole('button', { name: /Go back to Step/ })
      expect(navButtons).not.toBeInTheDocument()
    })
  })

  describe('session resume prompt', () => {
    it('shows resume prompt when platforms exist and step is not urls', async () => {
      mockStep = 'screenshots'
      mockPlatforms = [
        { platform: 'website', url: 'https://example.com', fetchable: true, fetchStatus: 'success' },
        { platform: 'instagram', url: 'https://instagram.com/test', fetchable: false, fetchStatus: 'pending' },
      ]

      await act(async () => {
        render(<AnalyzePage />)
      })

      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText(/You have a previous analysis in progress with 2 platforms/)).toBeInTheDocument()
      expect(screen.getByText('Continue')).toBeInTheDocument()
      expect(screen.getByText('Start Fresh')).toBeInTheDocument()
    })

    it('does not show resume prompt when step is urls', async () => {
      mockStep = 'urls'
      mockPlatforms = [
        { platform: 'website', url: 'https://example.com', fetchable: true, fetchStatus: 'success' },
      ]

      await act(async () => {
        render(<AnalyzePage />)
      })

      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })

    it('does not show resume prompt when platforms are empty', async () => {
      mockStep = 'screenshots'
      mockPlatforms = []

      await act(async () => {
        render(<AnalyzePage />)
      })

      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })

    it('dismisses prompt and keeps state when "Continue" is clicked', async () => {
      mockStep = 'processing'
      mockPlatforms = [
        { platform: 'website', url: 'https://example.com', fetchable: true, fetchStatus: 'success' },
      ]

      const user = userEvent.setup()

      await act(async () => {
        render(<AnalyzePage />)
      })

      expect(screen.getByRole('alert')).toBeInTheDocument()

      await user.click(screen.getByText('Continue'))

      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
      expect(mockReset).not.toHaveBeenCalled()
    })

    it('dismisses prompt and resets state when "Start Fresh" is clicked', async () => {
      mockStep = 'processing'
      mockPlatforms = [
        { platform: 'website', url: 'https://example.com', fetchable: true, fetchStatus: 'success' },
      ]

      const user = userEvent.setup()

      await act(async () => {
        render(<AnalyzePage />)
      })

      expect(screen.getByRole('alert')).toBeInTheDocument()

      await user.click(screen.getByText('Start Fresh'))

      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
      expect(mockReset).toHaveBeenCalled()
    })

    it('shows singular "platform" for 1 platform', async () => {
      mockStep = 'screenshots'
      mockPlatforms = [
        { platform: 'website', url: 'https://example.com', fetchable: true, fetchStatus: 'success' },
      ]

      await act(async () => {
        render(<AnalyzePage />)
      })

      expect(screen.getByText(/with 1 platform\./)).toBeInTheDocument()
    })
  })
})
