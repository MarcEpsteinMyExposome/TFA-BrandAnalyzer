import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ImagePreview from '@/components/screenshots/ImagePreview'

describe('ImagePreview', () => {
  const defaultProps = {
    src: 'data:image/png;base64,abc123',
    fileName: 'instagram-screenshot.png',
    onRemove: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders an image with the correct src', () => {
    render(<ImagePreview {...defaultProps} />)

    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('src', defaultProps.src)
  })

  it('renders image with accessible alt text', () => {
    render(<ImagePreview {...defaultProps} />)

    const img = screen.getByRole('img')
    expect(img).toHaveAttribute(
      'alt',
      `Screenshot: ${defaultProps.fileName}`
    )
  })

  it('shows the file name', () => {
    render(<ImagePreview {...defaultProps} />)

    expect(screen.getByText(defaultProps.fileName)).toBeInTheDocument()
  })

  it('has a remove button', () => {
    render(<ImagePreview {...defaultProps} />)

    const removeButton = screen.getByRole('button', {
      name: `Remove ${defaultProps.fileName}`,
    })
    expect(removeButton).toBeInTheDocument()
  })

  it('calls onRemove when remove button is clicked', async () => {
    const user = userEvent.setup()
    const onRemove = jest.fn()

    render(<ImagePreview {...defaultProps} onRemove={onRemove} />)

    await user.click(
      screen.getByRole('button', {
        name: `Remove ${defaultProps.fileName}`,
      })
    )

    expect(onRemove).toHaveBeenCalledTimes(1)
  })

  it('truncates long file names', () => {
    const longFileName = 'this-is-a-very-long-file-name-that-should-be-truncated.png'
    render(<ImagePreview {...defaultProps} fileName={longFileName} />)

    const nameElement = screen.getByText(longFileName)
    expect(nameElement).toHaveClass('truncate')
  })
})
