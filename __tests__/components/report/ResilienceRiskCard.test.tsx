import { render, screen } from '@testing-library/react'
import ResilienceRiskCard from '@/components/report/ResilienceRiskCard'

describe('ResilienceRiskCard', () => {
  const mockRisk = {
    category: 'emailListPresence',
    severity: 'high',
    description: 'No email list found on any platform',
    platforms: ['website', 'instagram'],
    recommendation: 'Add a newsletter signup form to your website',
  }

  it('renders risk description', () => {
    render(<ResilienceRiskCard risk={mockRisk} />)
    expect(
      screen.getByText('No email list found on any platform')
    ).toBeInTheDocument()
  })

  it('shows friendly severity label ("High Priority" for high)', () => {
    render(<ResilienceRiskCard risk={mockRisk} />)
    expect(screen.getByText('High Priority')).toBeInTheDocument()
  })

  it('shows amber colors for high severity', () => {
    const { container } = render(<ResilienceRiskCard risk={mockRisk} />)
    // The badge should have amber classes
    const badge = screen.getByText('High Priority')
    expect(badge.className).toContain('bg-amber-100')
    expect(badge.className).toContain('text-amber-700')
    // The card border should have amber left border
    const card = container.firstChild as HTMLElement
    expect(card.className).toContain('border-l-amber-500')
  })

  it('shows "Worth Addressing" for medium severity', () => {
    const mediumRisk = { ...mockRisk, severity: 'medium' }
    render(<ResilienceRiskCard risk={mediumRisk} />)
    expect(screen.getByText('Worth Addressing')).toBeInTheDocument()
  })

  it('shows "Nice to Have" for low severity', () => {
    const lowRisk = { ...mockRisk, severity: 'low' }
    render(<ResilienceRiskCard risk={lowRisk} />)
    expect(screen.getByText('Nice to Have')).toBeInTheDocument()
  })

  it('shows platform pills', () => {
    render(<ResilienceRiskCard risk={mockRisk} />)
    expect(screen.getByText('website')).toBeInTheDocument()
    expect(screen.getByText('instagram')).toBeInTheDocument()
  })

  it('shows recommendation with "Suggestion:" prefix', () => {
    render(<ResilienceRiskCard risk={mockRisk} />)
    expect(screen.getByText('Suggestion:')).toBeInTheDocument()
    expect(
      screen.getByText('Add a newsletter signup form to your website')
    ).toBeInTheDocument()
  })

  it('renders category label (formatted from camelCase)', () => {
    render(<ResilienceRiskCard risk={mockRisk} />)
    // "emailListPresence" -> "Email List Presence"
    expect(screen.getByText('Email List Presence')).toBeInTheDocument()
  })

  it('falls back to raw severity string for unknown severity values', () => {
    const unknownRisk = { ...mockRisk, severity: 'critical' }
    render(<ResilienceRiskCard risk={unknownRisk} />)
    // When severity is not in the labels map, it falls back to the raw string
    expect(screen.getByText('critical')).toBeInTheDocument()
  })

  it('uses default styles for unknown severity values', () => {
    const unknownRisk = { ...mockRisk, severity: 'critical' }
    const { container } = render(<ResilienceRiskCard risk={unknownRisk} />)
    const card = container.firstChild as HTMLElement
    expect(card.className).toContain('border-l-gray-400')
    const badge = screen.getByText('critical')
    expect(badge.className).toContain('bg-gray-100')
    expect(badge.className).toContain('text-gray-700')
  })
})
