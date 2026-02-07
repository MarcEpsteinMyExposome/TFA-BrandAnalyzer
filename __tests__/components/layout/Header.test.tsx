import { render, screen } from '@testing-library/react'
import Header from '@/components/layout/Header'

describe('Header', () => {
  it('renders "Tech For Artists" text', () => {
    render(<Header />)
    expect(screen.getByText('Tech For Artists')).toBeInTheDocument()
  })

  it('has a link to the home page', () => {
    render(<Header />)
    const homeLink = screen.getByRole('link', { name: 'Tech For Artists' })
    expect(homeLink).toHaveAttribute('href', '/')
  })

  it('renders "Brand Health Analyzer" label', () => {
    render(<Header />)
    expect(screen.getByText('Brand Health Analyzer')).toBeInTheDocument()
  })
})
