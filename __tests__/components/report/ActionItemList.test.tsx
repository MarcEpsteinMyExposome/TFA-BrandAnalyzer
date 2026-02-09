import { render, screen } from '@testing-library/react'
import ActionItemList from '@/components/report/ActionItemList'
import { createMockBrandReport } from '@/lib/testing/mockData'

describe('ActionItemList', () => {
  const mockReport = createMockBrandReport()

  it('renders action items in priority order', () => {
    const reverseItems = [...mockReport.actionItems].reverse()
    render(<ActionItemList actionItems={reverseItems} />)

    const listItems = screen.getAllByRole('listitem')
    expect(listItems).toHaveLength(3)

    // First item should be priority 1
    expect(listItems[0]).toHaveTextContent('1')
    expect(listItems[0]).toHaveTextContent(/Update Instagram bio/i)
  })

  it('shows action text', () => {
    render(<ActionItemList actionItems={mockReport.actionItems} />)
    expect(
      screen.getByText('Update Instagram bio to say "mixed media artist" to match website.')
    ).toBeInTheDocument()
    expect(
      screen.getByText('Add Etsy shop link to Instagram bio.')
    ).toBeInTheDocument()
    expect(
      screen.getByText('Standardize contact email across all platforms.')
    ).toBeInTheDocument()
  })

  it('shows platform badges', () => {
    render(<ActionItemList actionItems={mockReport.actionItems} />)
    const instagramBadges = screen.getAllByText('instagram')
    expect(instagramBadges.length).toBeGreaterThanOrEqual(2)
    expect(screen.getByText('all')).toBeInTheDocument()
  })

  it('shows source badges', () => {
    render(<ActionItemList actionItems={mockReport.actionItems} />)
    const consistencyBadges = screen.getAllByText('Consistency')
    const completenessBadges = screen.getAllByText('Completeness')
    expect(consistencyBadges.length).toBe(2)
    expect(completenessBadges.length).toBe(1)
  })

  it('shows "Resilience" source badge for resilience items', () => {
    const itemsWithResilience = [
      ...mockReport.actionItems,
      {
        priority: 4,
        source: 'resilience',
        action: 'Add a shop page to personal website.',
        platform: 'website',
        impact: 'high',
        effort: 'moderate',
      },
    ]
    render(<ActionItemList actionItems={itemsWithResilience} />)
    expect(screen.getByText('Resilience')).toBeInTheDocument()
  })

  it('shows "High impact" label for high impact items', () => {
    render(<ActionItemList actionItems={mockReport.actionItems} />)
    const highImpact = screen.getAllByText('High impact')
    expect(highImpact.length).toBe(2)
  })

  it('shows "Moderate impact" label for medium impact items', () => {
    render(<ActionItemList actionItems={mockReport.actionItems} />)
    const moderateImpact = screen.getAllByText('Moderate impact')
    expect(moderateImpact.length).toBe(1)
  })

  it('shows "Quick win" label for low impact items', () => {
    const itemsWithLow = [
      {
        priority: 1,
        source: 'consistency',
        action: 'Add alt text to profile images.',
        platform: 'website',
        impact: 'low',
        effort: 'quick',
      },
    ]
    render(<ActionItemList actionItems={itemsWithLow} />)
    expect(screen.getByText('Quick win')).toBeInTheDocument()
  })

  it('uses amber colors for high impact badge', () => {
    render(<ActionItemList actionItems={mockReport.actionItems} />)
    const highImpactBadges = screen.getAllByText('High impact')
    expect(highImpactBadges[0].className).toContain('bg-amber-100')
    expect(highImpactBadges[0].className).toContain('text-amber-700')
  })

  it('shows effort badges', () => {
    render(<ActionItemList actionItems={mockReport.actionItems} />)
    const quickBadges = screen.getAllByText('quick')
    const moderateBadges = screen.getAllByText('moderate')
    expect(quickBadges.length).toBe(2)
    expect(moderateBadges.length).toBe(1)
  })

  it('renders priority numbers', () => {
    render(<ActionItemList actionItems={mockReport.actionItems} />)
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('renders the heading "Your Action Plan"', () => {
    render(<ActionItemList actionItems={mockReport.actionItems} />)
    expect(
      screen.getByRole('heading', { name: /your action plan/i })
    ).toBeInTheDocument()
  })
})
