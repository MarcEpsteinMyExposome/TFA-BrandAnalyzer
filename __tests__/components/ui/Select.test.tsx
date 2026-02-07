import { render, screen } from '@testing-library/react'
import Select from '@/components/ui/Select'

const mockOptions = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'twitter', label: 'Twitter/X' },
  { value: 'website', label: 'Personal Website' },
]

describe('Select', () => {
  it('renders with a label', () => {
    render(<Select label="Platform" options={mockOptions} />)
    expect(screen.getByLabelText('Platform')).toBeInTheDocument()
  })

  it('links label to select via htmlFor using provided id', () => {
    render(<Select label="Platform" options={mockOptions} id="platform-select" />)
    const select = screen.getByLabelText('Platform')
    expect(select).toHaveAttribute('id', 'platform-select')
  })

  it('generates id from label when no id is provided', () => {
    render(<Select label="Choose Platform" options={mockOptions} />)
    const select = screen.getByLabelText('Choose Platform')
    expect(select).toHaveAttribute('id', 'choose-platform')
  })

  it('renders all options', () => {
    render(<Select label="Platform" options={mockOptions} />)
    const options = screen.getAllByRole('option')
    expect(options).toHaveLength(3)
    expect(options[0]).toHaveTextContent('Instagram')
    expect(options[1]).toHaveTextContent('Twitter/X')
    expect(options[2]).toHaveTextContent('Personal Website')
  })

  it('sets correct option values', () => {
    render(<Select label="Platform" options={mockOptions} />)
    const options = screen.getAllByRole('option')
    expect(options[0]).toHaveAttribute('value', 'instagram')
    expect(options[1]).toHaveAttribute('value', 'twitter')
    expect(options[2]).toHaveAttribute('value', 'website')
  })

  it('shows error message with role="alert"', () => {
    render(
      <Select label="Platform" options={mockOptions} error="Please select a platform" />
    )
    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('Please select a platform')
  })

  it('sets aria-invalid when error is present', () => {
    render(
      <Select label="Platform" options={mockOptions} error="Required" />
    )
    const select = screen.getByLabelText('Platform')
    expect(select).toHaveAttribute('aria-invalid', 'true')
  })

  it('does not set aria-invalid when no error', () => {
    render(<Select label="Platform" options={mockOptions} />)
    const select = screen.getByLabelText('Platform')
    expect(select).not.toHaveAttribute('aria-invalid')
  })

  it('links error message via aria-describedby', () => {
    render(
      <Select label="Platform" options={mockOptions} error="Required" />
    )
    const select = screen.getByLabelText('Platform')
    const errorId = select.getAttribute('aria-describedby')
    expect(errorId).toBeTruthy()
    expect(screen.getByRole('alert')).toHaveAttribute('id', errorId)
  })

  it('renders with no options', () => {
    render(<Select label="Empty" options={[]} />)
    const select = screen.getByLabelText('Empty')
    expect(select).toBeInTheDocument()
    expect(screen.queryAllByRole('option')).toHaveLength(0)
  })
})
