import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AddPlatformButton from '@/components/analyze/AddPlatformButton'

// jsdom does not implement scrollIntoView
Element.prototype.scrollIntoView = jest.fn()

describe('AddPlatformButton', () => {
  const defaultProps = {
    onAdd: jest.fn(),
    existingPlatforms: [] as string[],
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders "Add Platform" button', () => {
    render(<AddPlatformButton {...defaultProps} />)
    expect(screen.getByRole('button', { name: /add platform/i })).toBeInTheDocument()
  })

  it('opens dropdown on click', async () => {
    const user = userEvent.setup()
    render(<AddPlatformButton {...defaultProps} />)

    // Dropdown should not be visible initially
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /add platform/i }))

    // Dropdown should now be visible
    expect(screen.getByRole('listbox')).toBeInTheDocument()
  })

  it('lists platforms in the dropdown (excluding other and website)', async () => {
    const user = userEvent.setup()
    render(<AddPlatformButton {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /add platform/i }))

    // Should see specific platforms
    expect(screen.getByText('LinkedIn')).toBeInTheDocument()
    expect(screen.getByText('Behance')).toBeInTheDocument()
    expect(screen.getByText('Instagram')).toBeInTheDocument()
    expect(screen.getByText('YouTube')).toBeInTheDocument()
    expect(screen.getByText('ArtStation')).toBeInTheDocument()

    // "Custom URL" option should be present at the bottom
    expect(screen.getByText('Custom URL')).toBeInTheDocument()
  })

  it('disables already-added platforms', async () => {
    const user = userEvent.setup()
    render(
      <AddPlatformButton
        {...defaultProps}
        existingPlatforms={['instagram', 'linkedin']}
      />
    )

    await user.click(screen.getByRole('button', { name: /add platform/i }))

    // Instagram and LinkedIn should be disabled
    const instagramOption = screen.getByText('Instagram').closest('[role="option"]')
    expect(instagramOption).toHaveAttribute('aria-disabled', 'true')

    const linkedinOption = screen.getByText('LinkedIn').closest('[role="option"]')
    expect(linkedinOption).toHaveAttribute('aria-disabled', 'true')

    // Behance should NOT be disabled
    const behanceOption = screen.getByText('Behance').closest('[role="option"]')
    expect(behanceOption).toHaveAttribute('aria-disabled', 'false')
  })

  it('calls onAdd when a platform is selected', async () => {
    const user = userEvent.setup()
    const onAdd = jest.fn()
    render(<AddPlatformButton {...defaultProps} onAdd={onAdd} />)

    await user.click(screen.getByRole('button', { name: /add platform/i }))
    await user.click(screen.getByText('Behance'))

    expect(onAdd).toHaveBeenCalledWith('behance')
  })

  it('does not call onAdd when clicking a disabled platform', async () => {
    const user = userEvent.setup()
    const onAdd = jest.fn()
    render(
      <AddPlatformButton
        {...defaultProps}
        onAdd={onAdd}
        existingPlatforms={['instagram']}
      />
    )

    await user.click(screen.getByRole('button', { name: /add platform/i }))
    await user.click(screen.getByText('Instagram'))

    expect(onAdd).not.toHaveBeenCalled()
  })

  it('closes dropdown after selection', async () => {
    const user = userEvent.setup()
    render(<AddPlatformButton {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /add platform/i }))
    expect(screen.getByRole('listbox')).toBeInTheDocument()

    await user.click(screen.getByText('Behance'))
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('calls onAdd with "website" when "Custom URL" is clicked', async () => {
    const user = userEvent.setup()
    const onAdd = jest.fn()
    render(<AddPlatformButton {...defaultProps} onAdd={onAdd} />)

    await user.click(screen.getByRole('button', { name: /add platform/i }))
    await user.click(screen.getByText('Custom URL'))

    expect(onAdd).toHaveBeenCalledWith('website')
  })

  it('sets aria-expanded on the button', async () => {
    const user = userEvent.setup()
    render(<AddPlatformButton {...defaultProps} />)

    const button = screen.getByRole('button', { name: /add platform/i })
    expect(button).toHaveAttribute('aria-expanded', 'false')

    await user.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'true')
  })
})
