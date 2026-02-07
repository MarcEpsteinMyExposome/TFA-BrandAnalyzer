import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock the store module with all fields the real components need
const mockSetStep = jest.fn()
const mockReset = jest.fn()
const mockAddPlatform = jest.fn()
const mockRemovePlatform = jest.fn()
const mockUpdatePlatformUrl = jest.fn()
const mockUpdateFetchStatus = jest.fn()
const mockSetScreenshot = jest.fn()
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
  screenshot?: unknown
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
        setScreenshot: mockSetScreenshot,
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
    expect(screen.getByText('Tech For Artists')).toBeInTheDocument()
  })

  it('renders the footer', () => {
    render(<AnalyzePage />)
    expect(screen.getByText(/© 2026 Tech For Artists/)).toBeInTheDocument()
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
})
