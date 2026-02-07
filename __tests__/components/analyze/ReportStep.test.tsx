import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ReportStep from '@/components/analyze/ReportStep'
import { createMockBrandReport } from '@/lib/testing/mockData'

// Mock the Zustand store
jest.mock('@/lib/store/analysisStore')

import { useAnalysisStore } from '@/lib/store/analysisStore'

describe('ReportStep', () => {
  const mockOnStartNew = jest.fn()

  function setupMockStore(overrides: Record<string, unknown> = {}) {
    const mockState = {
      step: 'report',
      platforms: [],
      report: null,
      isAnalyzing: false,
      error: null,
      addPlatform: jest.fn(),
      removePlatform: jest.fn(),
      updatePlatformUrl: jest.fn(),
      updateFetchStatus: jest.fn(),
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
  })

  it('shows report when available', () => {
    const mockReport = createMockBrandReport()
    setupMockStore({ report: mockReport })

    render(<ReportStep onStartNew={mockOnStartNew} />)

    // Scores appear in DualScoreHero and in their respective panels
    expect(screen.getAllByText('78').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('55').length).toBeGreaterThanOrEqual(1)
    // "Consistency" and "Completeness" appear in DualScoreHero labels and ActionItemList source badges
    expect(screen.getAllByText('Consistency').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Completeness').length).toBeGreaterThanOrEqual(1)
  })

  it('shows "No report available" when report is null', () => {
    setupMockStore({ report: null })

    render(<ReportStep onStartNew={mockOnStartNew} />)

    expect(screen.getByText('No report available.')).toBeInTheDocument()
  })

  it('has "Start New Analysis" button when no report', () => {
    setupMockStore({ report: null })

    render(<ReportStep onStartNew={mockOnStartNew} />)

    expect(
      screen.getByRole('button', { name: /start new analysis/i })
    ).toBeInTheDocument()
  })

  it('calls onStartNew when clicking Start New Analysis with no report', async () => {
    const user = userEvent.setup()
    setupMockStore({ report: null })

    render(<ReportStep onStartNew={mockOnStartNew} />)

    await user.click(screen.getByRole('button', { name: /start new analysis/i }))
    expect(mockOnStartNew).toHaveBeenCalledTimes(1)
  })

  it('renders full BrandReport when report exists', () => {
    const mockReport = createMockBrandReport()
    setupMockStore({ report: mockReport })

    render(<ReportStep onStartNew={mockOnStartNew} />)

    // Check for various report sections
    expect(
      screen.getByRole('heading', { name: /brand consistency/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: /brand completeness/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: /prioritized action items/i })
    ).toBeInTheDocument()
  })
})
