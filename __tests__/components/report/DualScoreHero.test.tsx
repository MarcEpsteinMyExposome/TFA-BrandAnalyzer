import { render, screen } from '@testing-library/react'
import DualScoreHero from '@/components/report/DualScoreHero'

describe('DualScoreHero', () => {
  const defaultProps = {
    consistencyScore: 78,
    completenessScore: 55,
    summary: 'Your brand shows good consistency but has some completeness gaps.',
  }

  it('renders both consistency and completeness scores', () => {
    render(<DualScoreHero {...defaultProps} />)
    expect(screen.getByText('78')).toBeInTheDocument()
    expect(screen.getByText('55')).toBeInTheDocument()
  })

  it('renders "Consistency" and "Completeness" labels', () => {
    render(<DualScoreHero {...defaultProps} />)
    expect(screen.getByText('Consistency')).toBeInTheDocument()
    expect(screen.getByText('Completeness')).toBeInTheDocument()
  })

  it('shows executive summary text', () => {
    render(<DualScoreHero {...defaultProps} />)
    expect(
      screen.getByText('Your brand shows good consistency but has some completeness gaps.')
    ).toBeInTheDocument()
  })

  it('renders the overview heading', () => {
    render(<DualScoreHero {...defaultProps} />)
    expect(
      screen.getByRole('heading', { name: /brand health overview/i })
    ).toBeInTheDocument()
  })
})
