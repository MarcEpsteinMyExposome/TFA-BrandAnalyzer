import { render, screen } from '@testing-library/react'
import MismatchCard from '@/components/report/MismatchCard'
import type { Mismatch } from '@/lib/schemas/report.schema'

describe('MismatchCard', () => {
  const defaultMismatch: Mismatch = {
    type: 'text',
    severity: 'high',
    description: 'Instagram bio says "oil painter" but website says "mixed media artist".',
    platforms: ['instagram', 'website'],
    recommendation: 'Update Instagram bio to match website description.',
  }

  it('renders mismatch description', () => {
    render(<MismatchCard mismatch={defaultMismatch} />)
    expect(
      screen.getByText('Instagram bio says "oil painter" but website says "mixed media artist".')
    ).toBeInTheDocument()
  })

  it('shows "High Priority" label for high severity with amber colors', () => {
    render(<MismatchCard mismatch={defaultMismatch} />)
    const badge = screen.getByText('High Priority')
    expect(badge.className).toContain('bg-amber-100')
    expect(badge.className).toContain('text-amber-700')
  })

  it('uses amber border for high severity', () => {
    const { container } = render(<MismatchCard mismatch={defaultMismatch} />)
    const card = container.firstChild as HTMLElement
    expect(card.className).toContain('border-l-amber-500')
  })

  it('shows "Worth Addressing" label for medium severity with yellow colors', () => {
    const mismatch: Mismatch = { ...defaultMismatch, severity: 'medium' }
    render(<MismatchCard mismatch={mismatch} />)
    const badge = screen.getByText('Worth Addressing')
    expect(badge.className).toContain('bg-yellow-100')
    expect(badge.className).toContain('text-yellow-700')
  })

  it('shows "Nice to Have" label for low severity with blue colors', () => {
    const mismatch: Mismatch = { ...defaultMismatch, severity: 'low' }
    render(<MismatchCard mismatch={mismatch} />)
    const badge = screen.getByText('Nice to Have')
    expect(badge.className).toContain('bg-blue-100')
    expect(badge.className).toContain('text-blue-700')
  })

  it('capitalizes unknown severity as fallback', () => {
    const mismatch: Mismatch = { ...defaultMismatch, severity: 'critical' as string }
    render(<MismatchCard mismatch={mismatch} />)
    expect(screen.getByText('Critical')).toBeInTheDocument()
  })

  it('shows affected platforms', () => {
    render(<MismatchCard mismatch={defaultMismatch} />)
    expect(screen.getByText('instagram')).toBeInTheDocument()
    expect(screen.getByText('website')).toBeInTheDocument()
  })

  it('shows recommendation text', () => {
    render(<MismatchCard mismatch={defaultMismatch} />)
    expect(
      screen.getByText('Update Instagram bio to match website description.')
    ).toBeInTheDocument()
  })

  it('shows "Suggestion:" prefix before recommendation', () => {
    render(<MismatchCard mismatch={defaultMismatch} />)
    expect(screen.getByText('Suggestion:')).toBeInTheDocument()
  })

  it('shows mismatch type label', () => {
    render(<MismatchCard mismatch={defaultMismatch} />)
    expect(screen.getByText('Text')).toBeInTheDocument()
  })

  it('formats different mismatch types correctly', () => {
    const contactMismatch: Mismatch = {
      ...defaultMismatch,
      type: 'contact',
    }
    render(<MismatchCard mismatch={contactMismatch} />)
    expect(screen.getByText('Contact')).toBeInTheDocument()
  })
})
