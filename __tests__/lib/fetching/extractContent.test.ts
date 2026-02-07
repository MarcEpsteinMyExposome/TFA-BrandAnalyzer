import { extractContent } from '@/lib/fetching/extractContent'

describe('extractContent', () => {
  it('extracts title from <title> tag', () => {
    const html = '<html><head><title>My Art Portfolio</title></head><body></body></html>'
    const result = extractContent(html, 'https://example.com')

    expect(result.title).toBe('My Art Portfolio')
  })

  it('extracts title from og:title meta tag (preferred over <title>)', () => {
    const html = `
      <html>
        <head>
          <meta property="og:title" content="OG Title" />
          <title>Fallback Title</title>
        </head>
        <body></body>
      </html>
    `
    const result = extractContent(html, 'https://example.com')

    expect(result.title).toBe('OG Title')
  })

  it('extracts title from first <h1> when no meta or title tag', () => {
    const html = '<html><head></head><body><h1>Welcome to My Gallery</h1></body></html>'
    const result = extractContent(html, 'https://example.com')

    expect(result.title).toBe('Welcome to My Gallery')
  })

  it('extracts description from meta description', () => {
    const html = `
      <html>
        <head>
          <meta name="description" content="A portfolio of digital art and illustrations." />
        </head>
        <body></body>
      </html>
    `
    const result = extractContent(html, 'https://example.com')

    expect(result.description).toBe('A portfolio of digital art and illustrations.')
  })

  it('extracts description from og:description (preferred over meta description)', () => {
    const html = `
      <html>
        <head>
          <meta property="og:description" content="OG Description" />
          <meta name="description" content="Fallback Description" />
        </head>
        <body></body>
      </html>
    `
    const result = extractContent(html, 'https://example.com')

    expect(result.description).toBe('OG Description')
  })

  it('extracts headings (h1, h2, h3)', () => {
    const html = `
      <html>
        <head></head>
        <body>
          <h1>Main Title</h1>
          <h2>About Me</h2>
          <h3>My Process</h3>
          <h2>Portfolio</h2>
          <h4>This should not be extracted</h4>
        </body>
      </html>
    `
    const result = extractContent(html, 'https://example.com')

    expect(result.headings).toEqual(['Main Title', 'About Me', 'My Process', 'Portfolio'])
  })

  it('extracts outbound links and filters same-domain links', () => {
    const html = `
      <html>
        <head></head>
        <body>
          <a href="https://instagram.com/artist">Instagram</a>
          <a href="https://example.com/about">About</a>
          <a href="https://behance.net/artist">Behance</a>
          <a href="/relative-link">Relative</a>
        </body>
      </html>
    `
    const result = extractContent(html, 'https://example.com')

    expect(result.links).toContain('https://instagram.com/artist')
    expect(result.links).toContain('https://behance.net/artist')
    // Same-domain link should be filtered out
    expect(result.links).not.toContain('https://example.com/about')
    // Relative links should be filtered out (don't start with http)
    expect(result.links).not.toContain('/relative-link')
  })

  it('deduplicates outbound links', () => {
    const html = `
      <html>
        <head></head>
        <body>
          <a href="https://instagram.com/artist">Instagram 1</a>
          <a href="https://instagram.com/artist">Instagram 2</a>
          <a href="https://behance.net/artist">Behance</a>
        </body>
      </html>
    `
    const result = extractContent(html, 'https://example.com')

    const instagramCount = result.links.filter(
      (link) => link === 'https://instagram.com/artist'
    ).length
    expect(instagramCount).toBe(1)
    expect(result.links).toHaveLength(2)
  })

  it('extracts theme-color', () => {
    const html = `
      <html>
        <head>
          <meta name="theme-color" content="#ff6600" />
        </head>
        <body></body>
      </html>
    `
    const result = extractContent(html, 'https://example.com')

    expect(result.colors).toContain('#ff6600')
  })

  it('extracts og:image into images object', () => {
    const html = `
      <html>
        <head>
          <meta property="og:image" content="https://example.com/og-image.jpg" />
        </head>
        <body></body>
      </html>
    `
    const result = extractContent(html, 'https://example.com')

    expect(result.images.ogImage).toBe('https://example.com/og-image.jpg')
    expect(result.images.profilePhoto).toBe('https://example.com/og-image.jpg')
    expect(result.images.coverImage).toBe('https://example.com/og-image.jpg')
  })

  it('extracts text content and truncates to 3000 chars', () => {
    const longText = 'A'.repeat(5000)
    const html = `<html><head></head><body><p>${longText}</p></body></html>`
    const result = extractContent(html, 'https://example.com')

    expect(result.textContent.length).toBeLessThanOrEqual(3000)
  })

  it('removes script and style elements from text content', () => {
    const html = `
      <html>
        <head></head>
        <body>
          <p>Visible text</p>
          <script>console.log('hidden')</script>
          <style>.hidden { display: none; }</style>
          <p>More visible text</p>
        </body>
      </html>
    `
    const result = extractContent(html, 'https://example.com')

    expect(result.textContent).toContain('Visible text')
    expect(result.textContent).toContain('More visible text')
    expect(result.textContent).not.toContain('console.log')
    expect(result.textContent).not.toContain('.hidden')
  })

  it('handles empty/minimal HTML gracefully', () => {
    const html = '<html><head></head><body></body></html>'
    const result = extractContent(html, 'https://example.com')

    expect(result.title).toBe('')
    expect(result.description).toBe('')
    expect(result.headings).toEqual([])
    expect(result.links).toEqual([])
    expect(result.colors).toEqual([])
    expect(result.textContent).toBe('')
  })

  it('handles completely empty string', () => {
    const result = extractContent('', 'https://example.com')

    expect(result.title).toBe('')
    expect(result.description).toBe('')
    expect(result.headings).toEqual([])
    expect(result.links).toEqual([])
  })

  it('limits headings to 20', () => {
    const headingTags = Array.from({ length: 30 }, (_, i) => `<h2>Heading ${i}</h2>`).join('')
    const html = `<html><head></head><body>${headingTags}</body></html>`
    const result = extractContent(html, 'https://example.com')

    expect(result.headings.length).toBeLessThanOrEqual(20)
  })

  it('limits links to 50', () => {
    const linkTags = Array.from(
      { length: 60 },
      (_, i) => `<a href="https://external${i}.com/page">Link ${i}</a>`
    ).join('')
    const html = `<html><head></head><body>${linkTags}</body></html>`
    const result = extractContent(html, 'https://example.com')

    expect(result.links.length).toBeLessThanOrEqual(50)
  })
})
