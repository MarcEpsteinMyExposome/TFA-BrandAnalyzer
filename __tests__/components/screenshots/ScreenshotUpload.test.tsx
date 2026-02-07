import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ScreenshotUpload from '@/components/screenshots/ScreenshotUpload'
import type { UploadedImage } from '@/lib/schemas/platform.schema'

// Mock the image utility modules
jest.mock('@/lib/images/resize', () => ({
  resizeImage: jest.fn(() =>
    Promise.resolve(new Blob(['resized'], { type: 'image/jpeg' }))
  ),
}))

jest.mock('@/lib/images/toBase64', () => ({
  toBase64: jest.fn(() => Promise.resolve('data:image/jpeg;base64,abc123')),
}))

describe('ScreenshotUpload', () => {
  const defaultProps = {
    platformId: 'instagram' as const,
    onUpload: jest.fn(),
    onRemove: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders upload zone with instructions', () => {
    render(<ScreenshotUpload {...defaultProps} />)

    expect(
      screen.getByText(/drag & drop a screenshot here/i)
    ).toBeInTheDocument()
    expect(screen.getByText(/or click to browse/i)).toBeInTheDocument()
  })

  it('shows accepted file types hint', () => {
    render(<ScreenshotUpload {...defaultProps} />)

    expect(
      screen.getByText(/PNG, JPEG, or WebP/i)
    ).toBeInTheDocument()
  })

  it('shows existing image preview when provided', () => {
    const existingImage: UploadedImage = {
      data: 'data:image/png;base64,existingdata',
      mimeType: 'image/png',
      fileName: 'existing-screenshot.png',
      fileSize: 50000,
    }

    render(
      <ScreenshotUpload {...defaultProps} existingImage={existingImage} />
    )

    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('src', existingImage.data)
    expect(screen.getByText('existing-screenshot.png')).toBeInTheDocument()
  })

  it('shows remove button for existing image', () => {
    const existingImage: UploadedImage = {
      data: 'data:image/png;base64,existingdata',
      mimeType: 'image/png',
      fileName: 'existing-screenshot.png',
      fileSize: 50000,
    }

    render(
      <ScreenshotUpload {...defaultProps} existingImage={existingImage} />
    )

    expect(
      screen.getByRole('button', { name: /remove existing-screenshot\.png/i })
    ).toBeInTheDocument()
  })

  it('calls onRemove when remove button is clicked on existing image', async () => {
    const user = userEvent.setup()
    const onRemove = jest.fn()
    const existingImage: UploadedImage = {
      data: 'data:image/png;base64,existingdata',
      mimeType: 'image/png',
      fileName: 'existing-screenshot.png',
      fileSize: 50000,
    }

    render(
      <ScreenshotUpload
        {...defaultProps}
        existingImage={existingImage}
        onRemove={onRemove}
      />
    )

    await user.click(
      screen.getByRole('button', { name: /remove existing-screenshot\.png/i })
    )

    expect(onRemove).toHaveBeenCalledTimes(1)
  })

  it('has a hidden file input that accepts image types', () => {
    render(<ScreenshotUpload {...defaultProps} />)

    const fileInput = screen.getByTestId(
      `file-input-${defaultProps.platformId}`
    ) as HTMLInputElement
    expect(fileInput).toHaveAttribute('type', 'file')
    expect(fileInput).toHaveAttribute('accept', 'image/png,image/jpeg,image/webp')
  })

  it('shows error for invalid file type', async () => {
    render(<ScreenshotUpload {...defaultProps} />)

    const fileInput = screen.getByTestId(
      `file-input-${defaultProps.platformId}`
    ) as HTMLInputElement

    const invalidFile = new File(['test'], 'document.pdf', {
      type: 'application/pdf',
    })

    // Use fireEvent.change to bypass the accept attribute filtering
    // that userEvent.upload respects, so we can test our own validation
    fireEvent.change(fileInput, { target: { files: [invalidFile] } })

    expect(
      screen.getByText('Please upload a PNG, JPEG, or WebP image.')
    ).toBeInTheDocument()
  })

  it('shows error for oversized file', () => {
    render(<ScreenshotUpload {...defaultProps} />)

    const fileInput = screen.getByTestId(
      `file-input-${defaultProps.platformId}`
    ) as HTMLInputElement

    // Create a file larger than 10MB using Object.defineProperty to mock size
    const largeFile = new File(['x'], 'huge.jpg', {
      type: 'image/jpeg',
    })
    Object.defineProperty(largeFile, 'size', { value: 11 * 1024 * 1024 })

    fireEvent.change(fileInput, { target: { files: [largeFile] } })

    expect(
      screen.getByText('File size must be under 10MB.')
    ).toBeInTheDocument()
  })

  it('does not show upload zone when existing image is provided', () => {
    const existingImage: UploadedImage = {
      data: 'data:image/png;base64,existingdata',
      mimeType: 'image/png',
      fileName: 'existing-screenshot.png',
      fileSize: 50000,
    }

    render(
      <ScreenshotUpload {...defaultProps} existingImage={existingImage} />
    )

    expect(
      screen.queryByText(/drag & drop a screenshot here/i)
    ).not.toBeInTheDocument()
  })
})
