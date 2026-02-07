import { render, screen } from '@testing-library/react'
import CompletenessPanel from '@/components/report/CompletenessPanel'
import { createMockBrandReport } from '@/lib/testing/mockData'
import type { BrandReport } from '@/lib/schemas/report.schema'

describe('CompletenessPanel', () => {
  const mockReport = createMockBrandReport()

  it('renders "Brand Completeness" heading', () => {
    render(<CompletenessPanel completeness={mockReport.completeness} />)
    expect(
      screen.getByRole('heading', { name: /brand completeness/i })
    ).toBeInTheDocument()
  })

  it('shows overall completeness score', () => {
    render(<CompletenessPanel completeness={mockReport.completeness} />)
    expect(screen.getByText('55')).toBeInTheDocument()
  })

  it('renders category scores', () => {
    render(<CompletenessPanel completeness={mockReport.completeness} />)
    expect(screen.getByText('Platform Coverage')).toBeInTheDocument()
    // "Purchase Path" appears both as a category heading and as a gap card label
    expect(screen.getAllByText('Purchase Path').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Social Proof')).toBeInTheDocument()
    expect(screen.getByText('Events And Shows')).toBeInTheDocument()
    expect(screen.getByText('Artist Story')).toBeInTheDocument()
  })

  it('renders category summaries', () => {
    render(<CompletenessPanel completeness={mockReport.completeness} />)
    expect(
      screen.getByText('Present on most relevant platforms.')
    ).toBeInTheDocument()
    expect(
      screen.getByText('Purchase path is incomplete.')
    ).toBeInTheDocument()
  })

  it('renders category details', () => {
    render(<CompletenessPanel completeness={mockReport.completeness} />)
    expect(
      screen.getByText('Found on website, Instagram, Etsy. Missing: Behance, Pinterest.')
    ).toBeInTheDocument()
  })

  it('renders gap cards', () => {
    render(<CompletenessPanel completeness={mockReport.completeness} />)
    expect(
      screen.getByText('No purchase link found on Instagram or any social platform.')
    ).toBeInTheDocument()
  })

  it('renders Gaps & Opportunities heading', () => {
    render(<CompletenessPanel completeness={mockReport.completeness} />)
    expect(
      screen.getByRole('heading', { name: /gaps & opportunities/i })
    ).toBeInTheDocument()
  })

  it('shows "No significant gaps" when gaps is empty', () => {
    const emptyCompleteness: BrandReport['completeness'] = {
      ...mockReport.completeness,
      gaps: [],
    }
    render(<CompletenessPanel completeness={emptyCompleteness} />)
    expect(
      screen.getByText('No significant gaps found.')
    ).toBeInTheDocument()
  })
})
