import { render, screen } from '@testing-library/react'
import Card from '@/components/ui/Card'

describe('Card', () => {
  it('renders children content', () => {
    render(<Card><p>Card content</p></Card>)
    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<Card className="mt-8">Content</Card>)
    const card = container.firstChild as HTMLElement
    expect(card.className).toContain('mt-8')
  })

  it('has correct base styling', () => {
    const { container } = render(<Card>Content</Card>)
    const card = container.firstChild as HTMLElement
    expect(card.className).toContain('bg-white')
    expect(card.className).toContain('rounded-lg')
    expect(card.className).toContain('border')
    expect(card.className).toContain('border-gray-200')
    expect(card.className).toContain('p-6')
    expect(card.className).toContain('shadow-sm')
  })

  it('renders multiple children', () => {
    render(
      <Card>
        <h3>Title</h3>
        <p>Description</p>
      </Card>
    )
    expect(screen.getByText('Title')).toBeInTheDocument()
    expect(screen.getByText('Description')).toBeInTheDocument()
  })
})
