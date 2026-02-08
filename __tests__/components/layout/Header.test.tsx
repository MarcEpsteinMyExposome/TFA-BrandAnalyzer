import { render, screen } from '@testing-library/react'
import Header from '@/components/layout/Header'

describe('Header', () => {
  it('renders "Technology for Artists" text', () => {
    render(<Header />)
    expect(screen.getByText('Technology for Artists')).toBeInTheDocument()
  })

  it('has a link to the home page', () => {
    render(<Header />)
    const homeLink = screen.getByRole('link', { name: 'Technology for Artists' })
    expect(homeLink).toHaveAttribute('href', '/')
  })

  it('renders "Brand Health Analyzer" label', () => {
    render(<Header />)
    expect(screen.getByText('Brand Health Analyzer')).toBeInTheDocument()
  })
})
