import { render, screen } from '@testing-library/react'
import { createRef } from 'react'
import Input from '@/components/ui/Input'

describe('Input', () => {
  it('renders with a label', () => {
    render(<Input label="Email Address" />)
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument()
  })

  it('links label to input via htmlFor using provided id', () => {
    render(<Input label="Username" id="custom-id" />)
    const input = screen.getByLabelText('Username')
    expect(input).toHaveAttribute('id', 'custom-id')
  })

  it('generates id from label when no id is provided', () => {
    render(<Input label="First Name" />)
    const input = screen.getByLabelText('First Name')
    expect(input).toHaveAttribute('id', 'first-name')
  })

  it('shows error message with role="alert"', () => {
    render(<Input label="Email" error="Email is required" />)
    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('Email is required')
  })

  it('sets aria-invalid when error is present', () => {
    render(<Input label="Email" error="Invalid email" />)
    const input = screen.getByLabelText('Email')
    expect(input).toHaveAttribute('aria-invalid', 'true')
  })

  it('does not set aria-invalid when no error', () => {
    render(<Input label="Email" />)
    const input = screen.getByLabelText('Email')
    expect(input).not.toHaveAttribute('aria-invalid')
  })

  it('shows helper text when provided', () => {
    render(<Input label="Website" helperText="Include https://" />)
    expect(screen.getByText('Include https://')).toBeInTheDocument()
  })

  it('hides helper text when error is present', () => {
    render(
      <Input label="Website" helperText="Include https://" error="URL is invalid" />
    )
    expect(screen.queryByText('Include https://')).not.toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('URL is invalid')
  })

  it('links error message via aria-describedby', () => {
    render(<Input label="Email" error="Required" />)
    const input = screen.getByLabelText('Email')
    const errorId = input.getAttribute('aria-describedby')
    expect(errorId).toBeTruthy()
    expect(screen.getByRole('alert')).toHaveAttribute('id', errorId)
  })

  it('links helper text via aria-describedby', () => {
    render(<Input label="Name" helperText="Your full name" />)
    const input = screen.getByLabelText('Name')
    const helperId = input.getAttribute('aria-describedby')
    expect(helperId).toBeTruthy()
    expect(screen.getByText('Your full name')).toHaveAttribute('id', helperId)
  })

  it('forwards ref to the input element', () => {
    const ref = createRef<HTMLInputElement>()
    render(<Input label="Test" ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
    expect(ref.current?.tagName).toBe('INPUT')
  })

  it('passes through additional HTML attributes', () => {
    render(<Input label="Email" type="email" placeholder="you@example.com" />)
    const input = screen.getByLabelText('Email')
    expect(input).toHaveAttribute('type', 'email')
    expect(input).toHaveAttribute('placeholder', 'you@example.com')
  })
})
