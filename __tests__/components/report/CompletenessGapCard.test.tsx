import { render, screen } from '@testing-library/react'
import CompletenessGapCard from '@/components/report/CompletenessGapCard'
import type { CompletenessGap } from '@/lib/schemas/report.schema'

describe('CompletenessGapCard', () => {
  const defaultGap: CompletenessGap = {
    category: 'purchasePath',
    severity: 'high',
    description: 'No purchase link found on Instagram or any social platform.',
    platforms: ['instagram'],
    recommendation: 'Add your Etsy shop link to your Instagram bio.',
  }

  it('renders gap description', () => {
    render(<CompletenessGapCard gap={defaultGap} />)
    expect(
      screen.getByText('No purchase link found on Instagram or any social platform.')
    ).toBeInTheDocument()
  })

  it('shows "High Priority" label for high severity with amber colors', () => {
    render(<CompletenessGapCard gap={defaultGap} />)
    const badge = screen.getByText('High Priority')
    expect(badge.className).toContain('bg-amber-100')
    expect(badge.className).toContain('text-amber-700')
  })

  it('uses amber border for high severity', () => {
    const { container } = render(<CompletenessGapCard gap={defaultGap} />)
    const card = container.firstChild as HTMLElement
    expect(card.className).toContain('border-l-amber-500')
  })

  it('shows "Worth Addressing" label for medium severity with yellow colors', () => {
    const gap: CompletenessGap = { ...defaultGap, severity: 'medium' }
    render(<CompletenessGapCard gap={gap} />)
    const badge = screen.getByText('Worth Addressing')
    expect(badge.className).toContain('bg-yellow-100')
    expect(badge.className).toContain('text-yellow-700')
  })

  it('shows "Nice to Have" label for low severity with blue colors', () => {
    const gap: CompletenessGap = { ...defaultGap, severity: 'low' }
    render(<CompletenessGapCard gap={gap} />)
    const badge = screen.getByText('Nice to Have')
    expect(badge.className).toContain('bg-blue-100')
    expect(badge.className).toContain('text-blue-700')
  })

  it('capitalizes unknown severity as fallback', () => {
    const gap: CompletenessGap = { ...defaultGap, severity: 'urgent' as string }
    render(<CompletenessGapCard gap={gap} />)
    expect(screen.getByText('Urgent')).toBeInTheDocument()
  })

  it('shows category label formatted nicely', () => {
    render(<CompletenessGapCard gap={defaultGap} />)
    expect(screen.getByText('Purchase Path')).toBeInTheDocument()
  })

  it('shows affected platforms as badges', () => {
    render(<CompletenessGapCard gap={defaultGap} />)
    expect(screen.getByText('instagram')).toBeInTheDocument()
  })

  it('shows recommendation text', () => {
    render(<CompletenessGapCard gap={defaultGap} />)
    expect(
      screen.getByText('Add your Etsy shop link to your Instagram bio.')
    ).toBeInTheDocument()
  })

  it('shows "Suggestion:" prefix before recommendation', () => {
    render(<CompletenessGapCard gap={defaultGap} />)
    expect(screen.getByText('Suggestion:')).toBeInTheDocument()
  })

  it('shows examples when provided', () => {
    const gapWithExamples: CompletenessGap = {
      ...defaultGap,
      examples: ['Link in bio tool like Linktree', 'Direct Etsy link'],
    }
    render(<CompletenessGapCard gap={gapWithExamples} />)
    expect(screen.getByText('Link in bio tool like Linktree')).toBeInTheDocument()
    expect(screen.getByText('Direct Etsy link')).toBeInTheDocument()
  })

  it('does not render examples section when no examples', () => {
    render(<CompletenessGapCard gap={defaultGap} />)
    const listItems = screen.queryAllByRole('listitem')
    expect(listItems).toHaveLength(0)
  })
})
