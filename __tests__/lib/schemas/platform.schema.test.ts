import {
  platformIdSchema,
  uploadedImageSchema,
  extractedContentSchema,
  fetchStatusSchema,
  platformEntrySchema,
} from '@/lib/schemas/platform.schema'

describe('platformIdSchema', () => {
  const validPlatforms = [
    'website', 'linkedin', 'behance', 'deviantart', 'etsy',
    'instagram', 'tiktok', 'facebook', 'twitter', 'pinterest',
    'artstation', 'youtube', 'threads', 'other',
  ]

  it.each(validPlatforms)('accepts valid platform ID: %s', (platform) => {
    const result = platformIdSchema.safeParse(platform)
    expect(result.success).toBe(true)
  })

  it('rejects an invalid platform ID', () => {
    const result = platformIdSchema.safeParse('myspace')
    expect(result.success).toBe(false)
  })

  it('rejects a number', () => {
    const result = platformIdSchema.safeParse(42)
    expect(result.success).toBe(false)
  })

  it('rejects an empty string', () => {
    const result = platformIdSchema.safeParse('')
    expect(result.success).toBe(false)
  })
})

describe('uploadedImageSchema', () => {
  const validImage = {
    data: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk',
    mimeType: 'image/png',
    fileName: 'screenshot.png',
    fileSize: 1024,
  }

  it('accepts a valid uploaded image', () => {
    const result = uploadedImageSchema.safeParse(validImage)
    expect(result.success).toBe(true)
  })

  it('accepts an image with optional width and height', () => {
    const result = uploadedImageSchema.safeParse({
      ...validImage,
      width: 1920,
      height: 1080,
    })
    expect(result.success).toBe(true)
  })

  it('accepts image/jpeg mimeType', () => {
    const result = uploadedImageSchema.safeParse({
      ...validImage,
      mimeType: 'image/jpeg',
    })
    expect(result.success).toBe(true)
  })

  it('accepts image/webp mimeType', () => {
    const result = uploadedImageSchema.safeParse({
      ...validImage,
      mimeType: 'image/webp',
    })
    expect(result.success).toBe(true)
  })

  it('rejects an invalid mimeType', () => {
    const result = uploadedImageSchema.safeParse({
      ...validImage,
      mimeType: 'image/gif',
    })
    expect(result.success).toBe(false)
  })

  it('rejects missing data field', () => {
    const { data, ...noData } = validImage
    const result = uploadedImageSchema.safeParse(noData)
    expect(result.success).toBe(false)
  })

  it('rejects missing fileName', () => {
    const { fileName, ...noFileName } = validImage
    const result = uploadedImageSchema.safeParse(noFileName)
    expect(result.success).toBe(false)
  })

  it('rejects missing fileSize', () => {
    const { fileSize, ...noFileSize } = validImage
    const result = uploadedImageSchema.safeParse(noFileSize)
    expect(result.success).toBe(false)
  })

  it('rejects zero fileSize', () => {
    const result = uploadedImageSchema.safeParse({
      ...validImage,
      fileSize: 0,
    })
    expect(result.success).toBe(false)
  })

  it('rejects negative fileSize', () => {
    const result = uploadedImageSchema.safeParse({
      ...validImage,
      fileSize: -100,
    })
    expect(result.success).toBe(false)
  })

  it('rejects zero width', () => {
    const result = uploadedImageSchema.safeParse({
      ...validImage,
      width: 0,
    })
    expect(result.success).toBe(false)
  })

  it('rejects negative height', () => {
    const result = uploadedImageSchema.safeParse({
      ...validImage,
      height: -10,
    })
    expect(result.success).toBe(false)
  })
})

describe('extractedContentSchema', () => {
  const validContent = {
    title: 'My Art Portfolio',
    description: 'A collection of digital art',
    headings: ['About', 'Gallery', 'Contact'],
    links: ['https://instagram.com/artist', 'https://twitter.com/artist'],
    images: {
      profilePhoto: 'https://example.com/photo.jpg',
      coverImage: 'https://example.com/cover.jpg',
      ogImage: 'https://example.com/og.jpg',
    },
    colors: ['#ff0000', '#00ff00'],
    textContent: 'Welcome to my art portfolio...',
  }

  it('accepts valid extracted content', () => {
    const result = extractedContentSchema.safeParse(validContent)
    expect(result.success).toBe(true)
  })

  it('accepts content with optional rawHtml', () => {
    const result = extractedContentSchema.safeParse({
      ...validContent,
      rawHtml: '<html><body>Hello</body></html>',
    })
    expect(result.success).toBe(true)
  })

  it('accepts content with empty optional image fields', () => {
    const result = extractedContentSchema.safeParse({
      ...validContent,
      images: {},
    })
    expect(result.success).toBe(true)
  })

  it('accepts content with empty arrays', () => {
    const result = extractedContentSchema.safeParse({
      ...validContent,
      headings: [],
      links: [],
      colors: [],
    })
    expect(result.success).toBe(true)
  })

  it('rejects missing title', () => {
    const { title, ...noTitle } = validContent
    const result = extractedContentSchema.safeParse(noTitle)
    expect(result.success).toBe(false)
  })

  it('rejects missing description', () => {
    const { description, ...noDescription } = validContent
    const result = extractedContentSchema.safeParse(noDescription)
    expect(result.success).toBe(false)
  })

  it('rejects missing headings', () => {
    const { headings, ...noHeadings } = validContent
    const result = extractedContentSchema.safeParse(noHeadings)
    expect(result.success).toBe(false)
  })

  it('rejects missing links', () => {
    const { links, ...noLinks } = validContent
    const result = extractedContentSchema.safeParse(noLinks)
    expect(result.success).toBe(false)
  })

  it('rejects missing images object', () => {
    const { images, ...noImages } = validContent
    const result = extractedContentSchema.safeParse(noImages)
    expect(result.success).toBe(false)
  })

  it('rejects missing textContent', () => {
    const { textContent, ...noText } = validContent
    const result = extractedContentSchema.safeParse(noText)
    expect(result.success).toBe(false)
  })
})

describe('fetchStatusSchema', () => {
  it.each(['pending', 'fetching', 'success', 'error'])(
    'accepts valid fetch status: %s',
    (status) => {
      const result = fetchStatusSchema.safeParse(status)
      expect(result.success).toBe(true)
    }
  )

  it('rejects an invalid status', () => {
    const result = fetchStatusSchema.safeParse('loading')
    expect(result.success).toBe(false)
  })

  it('rejects an empty string', () => {
    const result = fetchStatusSchema.safeParse('')
    expect(result.success).toBe(false)
  })
})

describe('platformEntrySchema', () => {
  const validEntry = {
    platform: 'instagram',
    url: 'https://instagram.com/artist',
    fetchable: false,
    fetchStatus: 'pending',
  }

  it('accepts a valid platform entry', () => {
    const result = platformEntrySchema.safeParse(validEntry)
    expect(result.success).toBe(true)
  })

  it('accepts an entry with fetchedContent', () => {
    const result = platformEntrySchema.safeParse({
      ...validEntry,
      fetchStatus: 'success',
      fetchedContent: {
        title: 'Artist Instagram',
        description: 'Art posts',
        headings: [],
        links: [],
        images: {},
        colors: [],
        textContent: 'Artist bio...',
      },
    })
    expect(result.success).toBe(true)
  })

  it('accepts an entry with a screenshot', () => {
    const result = platformEntrySchema.safeParse({
      ...validEntry,
      screenshot: {
        data: 'base64data',
        mimeType: 'image/png',
        fileName: 'insta.png',
        fileSize: 2048,
      },
    })
    expect(result.success).toBe(true)
  })

  it('accepts an entry with a fetchError', () => {
    const result = platformEntrySchema.safeParse({
      ...validEntry,
      fetchStatus: 'error',
      fetchError: 'Failed to fetch: 403 Forbidden',
    })
    expect(result.success).toBe(true)
  })

  it('rejects an invalid platform', () => {
    const result = platformEntrySchema.safeParse({
      ...validEntry,
      platform: 'myspace',
    })
    expect(result.success).toBe(false)
  })

  it('rejects an invalid fetchStatus', () => {
    const result = platformEntrySchema.safeParse({
      ...validEntry,
      fetchStatus: 'loading',
    })
    expect(result.success).toBe(false)
  })

  it('rejects an empty url', () => {
    const result = platformEntrySchema.safeParse({
      ...validEntry,
      url: '',
    })
    expect(result.success).toBe(false)
  })

  it('rejects missing fetchable field', () => {
    const { fetchable, ...noFetchable } = validEntry
    const result = platformEntrySchema.safeParse(noFetchable)
    expect(result.success).toBe(false)
  })
})
