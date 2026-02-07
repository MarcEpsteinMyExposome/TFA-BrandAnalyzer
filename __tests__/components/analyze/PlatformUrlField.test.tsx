import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PlatformUrlField from '@/components/analyze/PlatformUrlField'

describe('PlatformUrlField', () => {
  const defaultProps = {
    index: 0,
    url: '',
    platformId: 'instagram' as const,
    platformName: 'Instagram',
    fetchable: false,
    onUrlChange: jest.fn(),
    onRemove: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders platform name', () => {
    render(<PlatformUrlField {...defaultProps} />)
    expect(screen.getByText('Instagram')).toBeInTheDocument()
  })

  it('renders URL input with correct aria-label', () => {
    render(<PlatformUrlField {...defaultProps} />)
    const input = screen.getByLabelText('Instagram URL')
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('type', 'url')
  })

  it('renders the URL value in the input', () => {
    render(
      <PlatformUrlField {...defaultProps} url="https://instagram.com/artist" />
    )
    const input = screen.getByLabelText('Instagram URL')
    expect(input).toHaveValue('https://instagram.com/artist')
  })

  it('calls onUrlChange when URL is typed', async () => {
    const user = userEvent.setup()
    const onUrlChange = jest.fn()
    render(<PlatformUrlField {...defaultProps} onUrlChange={onUrlChange} />)

    const input = screen.getByLabelText('Instagram URL')
    await user.type(input, 'https://instagram.com/test')

    // onUrlChange called for each character
    expect(onUrlChange).toHaveBeenCalled()
    // The first call should have index 0 and first character
    expect(onUrlChange).toHaveBeenCalledWith(0, expect.any(String))
  })

  it('calls onRemove when remove button is clicked', async () => {
    const user = userEvent.setup()
    const onRemove = jest.fn()
    render(<PlatformUrlField {...defaultProps} onRemove={onRemove} />)

    const removeButton = screen.getByRole('button', { name: 'Remove Instagram' })
    await user.click(removeButton)

    expect(onRemove).toHaveBeenCalledWith(0)
  })

  it('shows "Screenshot needed" indicator for non-fetchable platforms', () => {
    render(<PlatformUrlField {...defaultProps} fetchable={false} />)
    expect(screen.getByText('Screenshot needed')).toBeInTheDocument()
  })

  it('shows "Auto-fetch" indicator for fetchable platforms', () => {
    render(
      <PlatformUrlField
        {...defaultProps}
        platformId="linkedin"
        platformName="LinkedIn"
        fetchable={true}
      />
    )
    expect(screen.getAllByText('Auto-fetch').length).toBeGreaterThanOrEqual(1)
  })

  it('shows validation error for invalid URL after blur', async () => {
    const user = userEvent.setup()
    render(
      <PlatformUrlField {...defaultProps} url="not a valid url" onUrlChange={jest.fn()} />
    )

    const input = screen.getByLabelText('Instagram URL')
    // Focus and blur to trigger touched state
    await user.click(input)
    await user.tab()

    expect(screen.getByRole('alert')).toHaveTextContent('Please enter a valid URL')
  })

  it('does not show validation error for empty URL', async () => {
    const user = userEvent.setup()
    render(<PlatformUrlField {...defaultProps} url="" />)

    const input = screen.getByLabelText('Instagram URL')
    await user.click(input)
    await user.tab()

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('does not show validation error for valid URL', async () => {
    const user = userEvent.setup()
    render(
      <PlatformUrlField
        {...defaultProps}
        url="https://instagram.com/artist"
        onUrlChange={jest.fn()}
      />
    )

    const input = screen.getByLabelText('Instagram URL')
    await user.click(input)
    await user.tab()

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
