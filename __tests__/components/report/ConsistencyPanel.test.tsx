import { render, screen } from '@testing-library/react'
import ConsistencyPanel from '@/components/report/ConsistencyPanel'
import { createMockBrandReport } from '@/lib/testing/mockData'
import type { BrandReport } from '@/lib/schemas/report.schema'

describe('ConsistencyPanel', () => {
  const mockReport = createMockBrandReport()

  it('renders "Brand Consistency" heading', () => {
    render(<ConsistencyPanel consistency={mockReport.consistency} />)
    expect(
      screen.getByRole('heading', { name: /brand consistency/i })
    ).toBeInTheDocument()
  })

  it('shows overall consistency score', () => {
    render(<ConsistencyPanel consistency={mockReport.consistency} />)
    // The overall score (78) should appear in the gauge
    expect(screen.getByText('78')).toBeInTheDocument()
  })

  it('renders category scores', () => {
    render(<ConsistencyPanel consistency={mockReport.consistency} />)
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Bio')).toBeInTheDocument()
    expect(screen.getByText('Visual')).toBeInTheDocument()
    // "Contact" appears both as a category heading and as a mismatch type label
    expect(screen.getAllByText('Contact').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Cross Links')).toBeInTheDocument()
    expect(screen.getByText('Tone')).toBeInTheDocument()
  })

  it('renders category summaries', () => {
    render(<ConsistencyPanel consistency={mockReport.consistency} />)
    expect(
      screen.getByText('Name is consistent across all platforms.')
    ).toBeInTheDocument()
    expect(
      screen.getByText('Bio varies significantly between platforms.')
    ).toBeInTheDocument()
  })

  it('renders mismatch cards', () => {
    render(<ConsistencyPanel consistency={mockReport.consistency} />)
    expect(
      screen.getByText(/Instagram bio says "oil painter"/i)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Website shows email@example.com/i)
    ).toBeInTheDocument()
  })

  it('renders Findings heading', () => {
    render(<ConsistencyPanel consistency={mockReport.consistency} />)
    expect(
      screen.getByRole('heading', { name: /findings/i })
    ).toBeInTheDocument()
  })

  it('shows "No inconsistencies" when mismatches is empty', () => {
    const emptyConsistency: BrandReport['consistency'] = {
      ...mockReport.consistency,
      mismatches: [],
    }
    render(<ConsistencyPanel consistency={emptyConsistency} />)
    expect(
      screen.getByText('No inconsistencies found.')
    ).toBeInTheDocument()
  })
})
