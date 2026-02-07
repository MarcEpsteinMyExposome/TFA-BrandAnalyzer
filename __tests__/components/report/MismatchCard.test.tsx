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

  it('shows severity badge with correct color for high severity', () => {
    render(<MismatchCard mismatch={defaultMismatch} />)
    const badge = screen.getByText('high')
    expect(badge.className).toContain('bg-red-100')
    expect(badge.className).toContain('text-red-700')
  })

  it('shows severity badge with correct color for medium severity', () => {
    const mismatch: Mismatch = { ...defaultMismatch, severity: 'medium' }
    render(<MismatchCard mismatch={mismatch} />)
    const badge = screen.getByText('medium')
    expect(badge.className).toContain('bg-yellow-100')
    expect(badge.className).toContain('text-yellow-700')
  })

  it('shows severity badge with correct color for low severity', () => {
    const mismatch: Mismatch = { ...defaultMismatch, severity: 'low' }
    render(<MismatchCard mismatch={mismatch} />)
    const badge = screen.getByText('low')
    expect(badge.className).toContain('bg-blue-100')
    expect(badge.className).toContain('text-blue-700')
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
