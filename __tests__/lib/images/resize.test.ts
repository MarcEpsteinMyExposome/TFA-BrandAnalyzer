import { resizeImage } from '@/lib/images/resize'

describe('resizeImage', () => {
  let mockDrawImage: jest.Mock
  let mockToBlob: jest.Mock
  let mockGetContext: jest.Mock

  beforeEach(() => {
    mockDrawImage = jest.fn()
    mockGetContext = jest.fn(() => ({
      drawImage: mockDrawImage,
    }))
    mockToBlob = jest.fn((callback: (blob: Blob | null) => void) => {
      callback(new Blob(['mock-image-data'], { type: 'image/jpeg' }))
    })

    // Mock Image
    global.Image = class MockImage {
      onload: (() => void) | null = null
      onerror: (() => void) | null = null
      src = ''
      width = 2000
      height = 1000

      constructor() {
        setTimeout(() => this.onload?.(), 0)
      }
    } as unknown as typeof Image

    // Mock URL.createObjectURL
    URL.createObjectURL = jest.fn(() => 'blob:mock-url')

    // Mock canvas
    HTMLCanvasElement.prototype.getContext = mockGetContext as unknown as typeof HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.toBlob = mockToBlob as unknown as typeof HTMLCanvasElement.prototype.toBlob
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('resizes image larger than max dimensions', async () => {
    const file = new File(['test'], 'photo.jpg', { type: 'image/jpeg' })
    const blob = await resizeImage(file, 1920, 1920)

    expect(blob).toBeInstanceOf(Blob)
    // Image was 2000x1000, max 1920x1920 => ratio = min(1920/2000, 1920/1000) = 0.96
    // => 1920x960
    expect(mockDrawImage).toHaveBeenCalledWith(
      expect.anything(),
      0,
      0,
      1920,
      960
    )
  })

  it('preserves aspect ratio when scaling down', async () => {
    // Set image to be 4000x2000 (2:1 ratio)
    global.Image = class MockImage {
      onload: (() => void) | null = null
      onerror: (() => void) | null = null
      src = ''
      width = 4000
      height = 2000

      constructor() {
        setTimeout(() => this.onload?.(), 0)
      }
    } as unknown as typeof Image

    const file = new File(['test'], 'wide.jpg', { type: 'image/jpeg' })
    await resizeImage(file, 1920, 1920)

    // ratio = min(1920/4000, 1920/2000) = min(0.48, 0.96) = 0.48
    // => 1920 x 960
    expect(mockDrawImage).toHaveBeenCalledWith(
      expect.anything(),
      0,
      0,
      1920,
      960
    )
  })

  it('returns a blob', async () => {
    const file = new File(['test'], 'photo.jpg', { type: 'image/jpeg' })
    const blob = await resizeImage(file)

    expect(blob).toBeInstanceOf(Blob)
  })

  it('does not scale up images smaller than max dimensions', async () => {
    global.Image = class MockImage {
      onload: (() => void) | null = null
      onerror: (() => void) | null = null
      src = ''
      width = 800
      height = 600

      constructor() {
        setTimeout(() => this.onload?.(), 0)
      }
    } as unknown as typeof Image

    const file = new File(['test'], 'small.jpg', { type: 'image/jpeg' })
    await resizeImage(file, 1920, 1920)

    // Should keep original dimensions
    expect(mockDrawImage).toHaveBeenCalledWith(
      expect.anything(),
      0,
      0,
      800,
      600
    )
  })

  it('uses png output for png input', async () => {
    const file = new File(['test'], 'photo.png', { type: 'image/png' })
    await resizeImage(file)

    expect(mockToBlob).toHaveBeenCalledWith(
      expect.any(Function),
      'image/png',
      0.85
    )
  })

  it('uses jpeg output for jpeg input', async () => {
    const file = new File(['test'], 'photo.jpg', { type: 'image/jpeg' })
    await resizeImage(file)

    expect(mockToBlob).toHaveBeenCalledWith(
      expect.any(Function),
      'image/jpeg',
      0.85
    )
  })

  it('rejects when image fails to load', async () => {
    global.Image = class MockImage {
      onload: (() => void) | null = null
      onerror: (() => void) | null = null
      src = ''
      width = 0
      height = 0

      constructor() {
        setTimeout(() => this.onerror?.(), 0)
      }
    } as unknown as typeof Image

    const file = new File(['test'], 'bad.jpg', { type: 'image/jpeg' })
    await expect(resizeImage(file)).rejects.toThrow('Failed to load image')
  })

  it('rejects when canvas context is not available', async () => {
    mockGetContext.mockReturnValue(null)

    const file = new File(['test'], 'photo.jpg', { type: 'image/jpeg' })
    await expect(resizeImage(file)).rejects.toThrow(
      'Canvas 2D context not available'
    )
  })

  it('rejects when toBlob returns null', async () => {
    mockToBlob.mockImplementation(
      (callback: (blob: Blob | null) => void) => {
        callback(null)
      }
    )

    const file = new File(['test'], 'photo.jpg', { type: 'image/jpeg' })
    await expect(resizeImage(file)).rejects.toThrow('Failed to create blob')
  })
})
