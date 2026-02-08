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
    existingImages: [] as UploadedImage[],
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

  it('shows existing image previews when provided', () => {
    const existingImages: UploadedImage[] = [
      {
        data: 'data:image/png;base64,existingdata',
        mimeType: 'image/png',
        fileName: 'existing-screenshot.png',
        fileSize: 50000,
      },
    ]

    render(
      <ScreenshotUpload {...defaultProps} existingImages={existingImages} />
    )

    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('src', existingImages[0].data)
    expect(screen.getByText('existing-screenshot.png')).toBeInTheDocument()
  })

  it('shows remove button for each existing image', () => {
    const existingImages: UploadedImage[] = [
      {
        data: 'data:image/png;base64,existingdata',
        mimeType: 'image/png',
        fileName: 'existing-screenshot.png',
        fileSize: 50000,
      },
    ]

    render(
      <ScreenshotUpload {...defaultProps} existingImages={existingImages} />
    )

    expect(
      screen.getByRole('button', { name: /remove existing-screenshot\.png/i })
    ).toBeInTheDocument()
  })

  it('calls onRemove with correct index when remove button is clicked', async () => {
    const user = userEvent.setup()
    const onRemove = jest.fn()
    const existingImages: UploadedImage[] = [
      {
        data: 'data:image/png;base64,existingdata',
        mimeType: 'image/png',
        fileName: 'existing-screenshot.png',
        fileSize: 50000,
      },
    ]

    render(
      <ScreenshotUpload
        {...defaultProps}
        existingImages={existingImages}
        onRemove={onRemove}
      />
    )

    await user.click(
      screen.getByRole('button', { name: /remove existing-screenshot\.png/i })
    )

    expect(onRemove).toHaveBeenCalledTimes(1)
    expect(onRemove).toHaveBeenCalledWith(0)
  })

  it('has a hidden file input that accepts image types and allows multiple', () => {
    render(<ScreenshotUpload {...defaultProps} />)

    const fileInput = screen.getByTestId(
      `file-input-${defaultProps.platformId}`
    ) as HTMLInputElement
    expect(fileInput).toHaveAttribute('type', 'file')
    expect(fileInput).toHaveAttribute('accept', 'image/png,image/jpeg,image/webp')
    expect(fileInput).toHaveAttribute('multiple')
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

  it('always shows upload zone even when existing images are provided', () => {
    const existingImages: UploadedImage[] = [
      {
        data: 'data:image/png;base64,existingdata',
        mimeType: 'image/png',
        fileName: 'existing-screenshot.png',
        fileSize: 50000,
      },
    ]

    render(
      <ScreenshotUpload {...defaultProps} existingImages={existingImages} />
    )

    // Upload zone should always be visible for adding more screenshots
    expect(
      screen.getByText(/drag & drop more screenshots here/i)
    ).toBeInTheDocument()
  })

  it('shows multiple existing images in a grid', () => {
    const existingImages: UploadedImage[] = [
      {
        data: 'data:image/png;base64,img1',
        mimeType: 'image/png',
        fileName: 'screenshot-1.png',
        fileSize: 50000,
      },
      {
        data: 'data:image/png;base64,img2',
        mimeType: 'image/png',
        fileName: 'screenshot-2.png',
        fileSize: 60000,
      },
    ]

    render(
      <ScreenshotUpload {...defaultProps} existingImages={existingImages} />
    )

    const images = screen.getAllByRole('img')
    expect(images).toHaveLength(2)
    expect(screen.getByText('screenshot-1.png')).toBeInTheDocument()
    expect(screen.getByText('screenshot-2.png')).toBeInTheDocument()
  })

  it('calls onRemove with correct index for second image', async () => {
    const user = userEvent.setup()
    const onRemove = jest.fn()
    const existingImages: UploadedImage[] = [
      {
        data: 'data:image/png;base64,img1',
        mimeType: 'image/png',
        fileName: 'screenshot-1.png',
        fileSize: 50000,
      },
      {
        data: 'data:image/png;base64,img2',
        mimeType: 'image/png',
        fileName: 'screenshot-2.png',
        fileSize: 60000,
      },
    ]

    render(
      <ScreenshotUpload
        {...defaultProps}
        existingImages={existingImages}
        onRemove={onRemove}
      />
    )

    await user.click(
      screen.getByRole('button', { name: /remove screenshot-2\.png/i })
    )

    expect(onRemove).toHaveBeenCalledWith(1)
  })
})
