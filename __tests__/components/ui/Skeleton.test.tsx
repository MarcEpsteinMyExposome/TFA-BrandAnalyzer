import { render, screen } from '@testing-library/react'
import Skeleton from '@/components/ui/Skeleton'

describe('Skeleton', () => {
  it('renders with default text variant', () => {
    render(<Skeleton />)
    const el = screen.getByRole('status', { name: /loading/i })
    expect(el).toBeInTheDocument()
    expect(el.className).toContain('h-4')
    expect(el.className).toContain('w-full')
    expect(el.className).toContain('rounded')
    expect(el.className).toContain('animate-pulse')
  })

  it('renders circle variant', () => {
    render(<Skeleton variant="circle" />)
    const el = screen.getByRole('status', { name: /loading/i })
    expect(el.className).toContain('rounded-full')
    expect(el.className).toContain('h-10')
    expect(el.className).toContain('w-10')
  })

  it('renders rect variant', () => {
    render(<Skeleton variant="rect" />)
    const el = screen.getByRole('status', { name: /loading/i })
    expect(el.className).toContain('h-24')
    expect(el.className).toContain('rounded-md')
  })

  it('applies custom className', () => {
    render(<Skeleton className="w-32 h-8" />)
    const el = screen.getByRole('status', { name: /loading/i })
    expect(el.className).toContain('w-32')
    expect(el.className).toContain('h-8')
  })

  it('has accessible loading label', () => {
    render(<Skeleton />)
    expect(screen.getByRole('status', { name: /loading/i })).toBeInTheDocument()
  })
})
