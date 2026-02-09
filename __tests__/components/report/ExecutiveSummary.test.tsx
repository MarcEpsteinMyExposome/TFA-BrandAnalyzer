import { render, screen } from '@testing-library/react'
import ExecutiveSummary from '@/components/report/ExecutiveSummary'
import type { ExecutiveSummary as ExecutiveSummaryType } from '@/lib/schemas/report.schema'

describe('ExecutiveSummary', () => {
  const defaultProps: ExecutiveSummaryType = {
    strengths: [
      'Consistent artist name across all platforms',
      'Strong visual identity on website and Instagram',
    ],
    quickWins: [
      'Add Etsy shop link to Instagram bio (2 minutes)',
      'Update Instagram bio to match website description (2 minutes)',
    ],
  }

  it('renders nothing when both arrays are empty', () => {
    const { container } = render(
      <ExecutiveSummary executiveSummary={{ strengths: [], quickWins: [] }} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders "What You\'re Doing Well" section with strengths', () => {
    render(
      <ExecutiveSummary
        executiveSummary={{ strengths: defaultProps.strengths, quickWins: [] }}
      />
    )
    expect(
      screen.getByRole('heading', { name: /what you're doing well/i })
    ).toBeInTheDocument()
    expect(
      screen.getByText('Consistent artist name across all platforms')
    ).toBeInTheDocument()
    expect(
      screen.getByText('Strong visual identity on website and Instagram')
    ).toBeInTheDocument()
  })

  it('renders "Your Quick Wins" section with quick wins', () => {
    render(
      <ExecutiveSummary
        executiveSummary={{ strengths: [], quickWins: defaultProps.quickWins }}
      />
    )
    expect(
      screen.getByRole('heading', { name: /your quick wins/i })
    ).toBeInTheDocument()
    expect(
      screen.getByText('Add Etsy shop link to Instagram bio (2 minutes)')
    ).toBeInTheDocument()
    expect(
      screen.getByText('Update Instagram bio to match website description (2 minutes)')
    ).toBeInTheDocument()
  })

  it('renders both sections when both have content', () => {
    render(<ExecutiveSummary executiveSummary={defaultProps} />)
    expect(
      screen.getByRole('heading', { name: /what you're doing well/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: /your quick wins/i })
    ).toBeInTheDocument()
    expect(
      screen.getByText('Consistent artist name across all platforms')
    ).toBeInTheDocument()
    expect(
      screen.getByText('Add Etsy shop link to Instagram bio (2 minutes)')
    ).toBeInTheDocument()
  })

  it('renders a check mark icon (svg) for each strength', () => {
    render(
      <ExecutiveSummary
        executiveSummary={{ strengths: defaultProps.strengths, quickWins: [] }}
      />
    )
    // Each strength list item has an SVG check mark icon
    const listItems = screen.getAllByRole('listitem')
    expect(listItems).toHaveLength(2)
    listItems.forEach((item) => {
      const svg = item.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })
  })

  it('renders quick wins in an ordered list', () => {
    render(
      <ExecutiveSummary
        executiveSummary={{ strengths: [], quickWins: defaultProps.quickWins }}
      />
    )
    const orderedList = screen.getByRole('list')
    expect(orderedList.tagName).toBe('OL')
  })
})
