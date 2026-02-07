import { render, screen } from '@testing-library/react'
import Footer from '@/components/layout/Footer'

describe('Footer', () => {
  it('renders copyright text', () => {
    render(<Footer />)
    expect(
      screen.getByText(/Tech For Artists\. All rights reserved\./)
    ).toBeInTheDocument()
  })

  it('contains the current year (2026)', () => {
    render(<Footer />)
    expect(screen.getByText(/2026/)).toBeInTheDocument()
  })
})
