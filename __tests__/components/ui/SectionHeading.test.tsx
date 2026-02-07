import { render, screen } from '@testing-library/react'
import SectionHeading from '@/components/ui/SectionHeading'

describe('SectionHeading', () => {
  it('renders the title as an h2 heading', () => {
    render(<SectionHeading title="Brand Analysis" />)
    const heading = screen.getByRole('heading', { level: 2, name: 'Brand Analysis' })
    expect(heading).toBeInTheDocument()
  })

  it('renders description when provided', () => {
    render(
      <SectionHeading
        title="Brand Analysis"
        description="Review your brand consistency across platforms."
      />
    )
    expect(screen.getByText('Review your brand consistency across platforms.')).toBeInTheDocument()
  })

  it('does not render description paragraph when not provided', () => {
    const { container } = render(<SectionHeading title="Brand Analysis" />)
    const paragraphs = container.querySelectorAll('p')
    expect(paragraphs).toHaveLength(0)
  })

  it('applies correct heading styles', () => {
    render(<SectionHeading title="Test" />)
    const heading = screen.getByRole('heading', { level: 2 })
    expect(heading.className).toContain('text-lg')
    expect(heading.className).toContain('font-semibold')
    expect(heading.className).toContain('text-gray-900')
  })

  it('applies correct description styles', () => {
    render(<SectionHeading title="Test" description="A description" />)
    const description = screen.getByText('A description')
    expect(description.className).toContain('text-sm')
    expect(description.className).toContain('text-gray-500')
  })
})
