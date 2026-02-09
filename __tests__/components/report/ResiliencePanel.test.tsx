import { render, screen } from '@testing-library/react'
import ResiliencePanel from '@/components/report/ResiliencePanel'

const mockResilience = {
  overallScore: 65,
  categories: [
    { category: 'domainOwnership', score: 80, summary: 'Owns personal domain', details: 'artist.com is registered and active' },
    { category: 'platformDiversification', score: 55, summary: 'Moderate spread', details: 'Present on 3 platforms' },
    { category: 'ctaControl', score: 70, summary: 'CTA on owned property', details: 'Shop link goes to own website' },
    { category: 'emailListPresence', score: 40, summary: 'No email signup found', details: 'No newsletter form detected' },
  ],
  risks: [
    { category: 'emailListPresence', severity: 'high', description: 'No email list found', platforms: ['website'], recommendation: 'Add a newsletter signup form' },
  ],
}

describe('ResiliencePanel', () => {
  it('renders "Part 3: Ownership & Resilience" heading', () => {
    render(<ResiliencePanel resilience={mockResilience} />)
    expect(
      screen.getByRole('heading', { name: /part 3: ownership & resilience/i })
    ).toBeInTheDocument()
  })

  it('shows overall score gauge', () => {
    render(<ResiliencePanel resilience={mockResilience} />)
    // The overall score of 65 is rendered by ScoreGauge
    expect(screen.getByText('65')).toBeInTheDocument()
    // The "Overall:" label text
    expect(screen.getByText('Overall:')).toBeInTheDocument()
  })

  it('renders category cards with scores and summaries', () => {
    render(<ResiliencePanel resilience={mockResilience} />)
    // Category names formatted from camelCase
    expect(screen.getByText('Domain Ownership')).toBeInTheDocument()
    expect(screen.getByText('Platform Diversification')).toBeInTheDocument()
    expect(screen.getByText('Cta Control')).toBeInTheDocument()
    // "Email List Presence" appears in both category card and risk card
    expect(screen.getAllByText('Email List Presence').length).toBeGreaterThanOrEqual(1)

    // Summaries
    expect(screen.getByText('Owns personal domain')).toBeInTheDocument()
    expect(screen.getByText('Moderate spread')).toBeInTheDocument()
    expect(screen.getByText('CTA on owned property')).toBeInTheDocument()
    expect(screen.getByText('No email signup found')).toBeInTheDocument()

    // Details
    expect(screen.getByText('artist.com is registered and active')).toBeInTheDocument()
    expect(screen.getByText('Present on 3 platforms')).toBeInTheDocument()

    // Scores rendered by ScoreGauge
    expect(screen.getByText('80')).toBeInTheDocument()
    expect(screen.getByText('55')).toBeInTheDocument()
    expect(screen.getByText('70')).toBeInTheDocument()
    expect(screen.getByText('40')).toBeInTheDocument()
  })

  it('shows "Risks & Recommendations" heading', () => {
    render(<ResiliencePanel resilience={mockResilience} />)
    expect(
      screen.getByRole('heading', { name: /risks & recommendations/i })
    ).toBeInTheDocument()
  })

  it('renders risk cards when risks are present', () => {
    render(<ResiliencePanel resilience={mockResilience} />)
    // The risk description is rendered
    expect(screen.getByText('No email list found')).toBeInTheDocument()
    // The recommendation text
    expect(screen.getByText('Add a newsletter signup form')).toBeInTheDocument()
  })

  it('shows "No significant risks found" message when risks array is empty', () => {
    const noRisks = {
      ...mockResilience,
      risks: [],
    }
    render(<ResiliencePanel resilience={noRisks} />)
    expect(
      screen.getByText(/no significant risks found/i)
    ).toBeInTheDocument()
  })
})
