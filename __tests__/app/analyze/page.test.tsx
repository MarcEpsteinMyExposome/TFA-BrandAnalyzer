import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock the store module
const mockSetStep = jest.fn()
const mockReset = jest.fn()
let mockStep = 'urls'
let mockPlatforms: Array<{ fetchable: boolean; screenshot?: unknown }> = []

jest.mock('@/lib/store/analysisStore', () => ({
  useAnalysisStore: Object.assign(
    (selector?: (state: Record<string, unknown>) => unknown) => {
      const state = {
        step: mockStep,
        setStep: mockSetStep,
        platforms: mockPlatforms,
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
    expect(screen.getByText('Screenshots')).toBeInTheDocument()
  })

  it('shows processing step when step is "processing"', () => {
    mockStep = 'processing'
    render(<AnalyzePage />)
    expect(screen.getByText('Analyzing...')).toBeInTheDocument()
  })

  it('shows report step when step is "report"', () => {
    mockStep = 'report'
    render(<AnalyzePage />)
    expect(screen.getByText('Report')).toBeInTheDocument()
  })

  it('navigates to screenshots when Next clicked and has non-fetchable platforms', async () => {
    mockPlatforms = [{ fetchable: false }]
    const user = userEvent.setup()
    render(<AnalyzePage />)
    const nextBtn = screen.getByText('Next (Demo)')
    await user.click(nextBtn)
    expect(mockSetStep).toHaveBeenCalledWith('screenshots')
  })

  it('navigates to processing when Next clicked and all platforms fetchable', async () => {
    mockPlatforms = [{ fetchable: true }, { fetchable: true }]
    const user = userEvent.setup()
    render(<AnalyzePage />)
    const nextBtn = screen.getByText('Next (Demo)')
    await user.click(nextBtn)
    expect(mockSetStep).toHaveBeenCalledWith('processing')
  })

  it('navigates to processing when Next clicked and no platforms added', async () => {
    mockPlatforms = []
    const user = userEvent.setup()
    render(<AnalyzePage />)
    const nextBtn = screen.getByText('Next (Demo)')
    await user.click(nextBtn)
    expect(mockSetStep).toHaveBeenCalledWith('processing')
  })

  it('navigates to processing when non-fetchable platform already has screenshot', async () => {
    mockPlatforms = [{ fetchable: false, screenshot: { data: 'base64...' } }]
    const user = userEvent.setup()
    render(<AnalyzePage />)
    const nextBtn = screen.getByText('Next (Demo)')
    await user.click(nextBtn)
    expect(mockSetStep).toHaveBeenCalledWith('processing')
  })

  it('can go back to URLs from screenshots', async () => {
    mockStep = 'screenshots'
    const user = userEvent.setup()
    render(<AnalyzePage />)
    await user.click(screen.getByText('Back'))
    expect(mockSetStep).toHaveBeenCalledWith('urls')
  })

  it('can skip screenshots and go to processing', async () => {
    mockStep = 'screenshots'
    const user = userEvent.setup()
    render(<AnalyzePage />)
    await user.click(screen.getByText('Skip for Now'))
    expect(mockSetStep).toHaveBeenCalledWith('processing')
  })

  it('can start new analysis from report', async () => {
    mockStep = 'report'
    const user = userEvent.setup()
    render(<AnalyzePage />)
    await user.click(screen.getByText('Start New Analysis'))
    expect(mockReset).toHaveBeenCalled()
  })

  it('renders step indicator with all steps', () => {
    render(<AnalyzePage />)
    expect(screen.getByText('1. Add Links')).toBeInTheDocument()
    expect(screen.getByText('2. Screenshots')).toBeInTheDocument()
    expect(screen.getByText('3. Analyzing')).toBeInTheDocument()
    expect(screen.getByText('4. Report')).toBeInTheDocument()
  })

  it('highlights current step in step indicator', () => {
    render(<AnalyzePage />)
    const currentStepLabel = screen.getByText('1. Add Links')
    expect(currentStepLabel).toHaveClass('font-semibold', 'text-gray-900')
  })

  it('renders step indicator with navigation role', () => {
    render(<AnalyzePage />)
    expect(screen.getByRole('navigation', { name: 'Analysis steps' })).toBeInTheDocument()
  })
})
