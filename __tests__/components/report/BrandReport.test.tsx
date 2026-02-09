import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BrandReport from '@/components/report/BrandReport'
import { useAnalysisStore } from '@/lib/store/analysisStore'
import {
  createMockBrandReport,
  createMockPlatformEntry,
  createMockExtractedContent,
} from '@/lib/testing/mockData'

jest.mock('@/lib/export/generateDocx', () => ({
  downloadDocx: jest.fn().mockResolvedValue(undefined),
}))

describe('BrandReport', () => {
  const mockReport = createMockBrandReport()
  const mockOnStartNew = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    useAnalysisStore.getState().reset()
    // Populate store with platforms so ReportSourcesSection renders
    useAnalysisStore.getState().addPlatform('website', 'https://example.com', true)
    useAnalysisStore.getState().addPlatform('instagram', 'https://instagram.com/artist', false)
  })

  it('renders DualScoreHero with correct scores', () => {
    render(<BrandReport report={mockReport} onStartNew={mockOnStartNew} />)
    // Consistency score 78 appears in DualScoreHero and ConsistencyPanel
    expect(screen.getAllByText('78').length).toBeGreaterThanOrEqual(1)
    // Completeness score 55 appears in DualScoreHero and CompletenessPanel
    expect(screen.getAllByText('55').length).toBeGreaterThanOrEqual(1)
    // "Consistency" and "Completeness" appear in DualScoreHero labels and ActionItemList source badges
    expect(screen.getAllByText('Consistency').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Completeness').length).toBeGreaterThanOrEqual(1)
  })

  it('renders summary text', () => {
    render(<BrandReport report={mockReport} onStartNew={mockOnStartNew} />)
    expect(
      screen.getByText(mockReport.summary)
    ).toBeInTheDocument()
  })

  it('renders ConsistencyPanel', () => {
    render(<BrandReport report={mockReport} onStartNew={mockOnStartNew} />)
    expect(
      screen.getByRole('heading', { name: /brand consistency/i })
    ).toBeInTheDocument()
  })

  it('renders CompletenessPanel', () => {
    render(<BrandReport report={mockReport} onStartNew={mockOnStartNew} />)
    expect(
      screen.getByRole('heading', { name: /brand completeness/i })
    ).toBeInTheDocument()
  })

  it('renders ActionItemList', () => {
    render(<BrandReport report={mockReport} onStartNew={mockOnStartNew} />)
    expect(
      screen.getByRole('heading', { name: /prioritized action items/i })
    ).toBeInTheDocument()
  })

  it('renders ReportActions with Start New Analysis button', () => {
    render(<BrandReport report={mockReport} onStartNew={mockOnStartNew} />)
    expect(
      screen.getByRole('button', { name: /start new analysis/i })
    ).toBeInTheDocument()
  })

  it('renders Print Report button', () => {
    render(<BrandReport report={mockReport} onStartNew={mockOnStartNew} />)
    expect(
      screen.getByRole('button', { name: /print report/i })
    ).toBeInTheDocument()
  })

  it('calls onStartNew when Start New Analysis is clicked', async () => {
    const user = userEvent.setup()
    render(<BrandReport report={mockReport} onStartNew={mockOnStartNew} />)

    await user.click(screen.getByRole('button', { name: /start new analysis/i }))
    expect(mockOnStartNew).toHaveBeenCalledTimes(1)
  })

  it('renders ReportSourcesSection with Data Sources heading', () => {
    render(<BrandReport report={mockReport} onStartNew={mockOnStartNew} />)
    expect(
      screen.getByRole('heading', { name: /data sources/i })
    ).toBeInTheDocument()
  })

  it('renders platform URLs from the store in the sources section', () => {
    render(<BrandReport report={mockReport} onStartNew={mockOnStartNew} />)
    expect(screen.getByText('https://example.com')).toBeInTheDocument()
    expect(screen.getByText('https://instagram.com/artist')).toBeInTheDocument()
  })

  it('renders Download Report (.docx) button', () => {
    render(<BrandReport report={mockReport} onStartNew={mockOnStartNew} />)
    expect(
      screen.getByRole('button', { name: /download report as word document/i })
    ).toBeInTheDocument()
  })
})
