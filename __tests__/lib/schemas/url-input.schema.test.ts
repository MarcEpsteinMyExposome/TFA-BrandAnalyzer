import {
  urlInputSchema,
  urlListSchema,
} from '@/lib/schemas/url-input.schema'

describe('urlInputSchema', () => {
  it('accepts a valid https URL', () => {
    const result = urlInputSchema.safeParse({ url: 'https://example.com' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.url).toBe('https://example.com')
    }
  })

  it('accepts a valid http URL', () => {
    const result = urlInputSchema.safeParse({ url: 'http://example.com' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.url).toBe('http://example.com')
    }
  })

  it('accepts a URL with a path', () => {
    const result = urlInputSchema.safeParse({ url: 'https://example.com/artist/gallery' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.url).toBe('https://example.com/artist/gallery')
    }
  })

  it('transforms a URL without protocol by adding https://', () => {
    const result = urlInputSchema.safeParse({ url: 'example.com' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.url).toBe('https://example.com')
    }
  })

  it('transforms a URL with subdomain without protocol', () => {
    const result = urlInputSchema.safeParse({ url: 'www.example.com' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.url).toBe('https://www.example.com')
    }
  })

  it('transforms a URL with path without protocol', () => {
    const result = urlInputSchema.safeParse({ url: 'instagram.com/artist' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.url).toBe('https://instagram.com/artist')
    }
  })

  it('does not double-add protocol to https URLs', () => {
    const result = urlInputSchema.safeParse({ url: 'https://behance.net/user' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.url).toBe('https://behance.net/user')
    }
  })

  it('does not double-add protocol to http URLs', () => {
    const result = urlInputSchema.safeParse({ url: 'http://behance.net/user' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.url).toBe('http://behance.net/user')
    }
  })

  it('rejects an empty string with "URL is required"', () => {
    const result = urlInputSchema.safeParse({ url: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain('URL is required')
    }
  })

  it('rejects a string without a dot (invalid URL after transform)', () => {
    const result = urlInputSchema.safeParse({ url: 'notaurl' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain('Please enter a valid URL')
    }
  })

  it('rejects just a protocol', () => {
    const result = urlInputSchema.safeParse({ url: 'https://' })
    expect(result.success).toBe(false)
  })

  it('rejects missing url field', () => {
    const result = urlInputSchema.safeParse({})
    expect(result.success).toBe(false)
  })
})

describe('urlListSchema', () => {
  const makePlatforms = (count: number) =>
    Array.from({ length: count }, (_, i) => ({
      url: `https://example${i}.com`,
      platform: `platform${i}`,
    }))

  it('accepts a list with exactly 2 platforms', () => {
    const result = urlListSchema.safeParse({
      platforms: makePlatforms(2),
    })
    expect(result.success).toBe(true)
  })

  it('accepts a list with 5 platforms', () => {
    const result = urlListSchema.safeParse({
      platforms: makePlatforms(5),
    })
    expect(result.success).toBe(true)
  })

  it('accepts a list with exactly 10 platforms (max)', () => {
    const result = urlListSchema.safeParse({
      platforms: makePlatforms(10),
    })
    expect(result.success).toBe(true)
  })

  it('rejects an empty platforms array', () => {
    const result = urlListSchema.safeParse({ platforms: [] })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain('Please add at least 2 platforms to analyze')
    }
  })

  it('rejects a list with only 1 platform', () => {
    const result = urlListSchema.safeParse({
      platforms: makePlatforms(1),
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain('Please add at least 2 platforms to analyze')
    }
  })

  it('rejects a list with 11 platforms (exceeds max)', () => {
    const result = urlListSchema.safeParse({
      platforms: makePlatforms(11),
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain('Maximum 10 platforms per analysis')
    }
  })

  it('rejects a platform entry with empty url', () => {
    const result = urlListSchema.safeParse({
      platforms: [
        { url: '', platform: 'website' },
        { url: 'https://example.com', platform: 'linkedin' },
      ],
    })
    expect(result.success).toBe(false)
  })

  it('rejects missing platforms field', () => {
    const result = urlListSchema.safeParse({})
    expect(result.success).toBe(false)
  })
})
