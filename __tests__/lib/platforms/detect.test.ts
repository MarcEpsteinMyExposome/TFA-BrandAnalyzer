import { detectPlatform, isValidUrl, normalizeUrl } from '@/lib/platforms/detect'

describe('detectPlatform', () => {
  describe('Instagram', () => {
    it('detects https://instagram.com/username', () => {
      expect(detectPlatform('https://instagram.com/username')).toBe('instagram')
    })

    it('detects https://www.instagram.com/username', () => {
      expect(detectPlatform('https://www.instagram.com/username')).toBe(
        'instagram'
      )
    })

    it('detects instagram.com/username without protocol', () => {
      expect(detectPlatform('instagram.com/username')).toBe('instagram')
    })

    it('detects Instagram with trailing slash', () => {
      expect(detectPlatform('https://instagram.com/username/')).toBe(
        'instagram'
      )
    })
  })

  describe('Twitter / X', () => {
    it('detects https://twitter.com/username', () => {
      expect(detectPlatform('https://twitter.com/username')).toBe('twitter')
    })

    it('detects https://x.com/username', () => {
      expect(detectPlatform('https://x.com/username')).toBe('twitter')
    })

    it('detects twitter.com without protocol', () => {
      expect(detectPlatform('twitter.com/username')).toBe('twitter')
    })

    it('detects x.com without protocol', () => {
      expect(detectPlatform('x.com/username')).toBe('twitter')
    })

    it('detects www.x.com', () => {
      expect(detectPlatform('https://www.x.com/username')).toBe('twitter')
    })
  })

  describe('LinkedIn', () => {
    it('detects https://linkedin.com/in/john-doe', () => {
      expect(detectPlatform('https://linkedin.com/in/john-doe')).toBe(
        'linkedin'
      )
    })

    it('detects https://www.linkedin.com/company/myco', () => {
      expect(detectPlatform('https://www.linkedin.com/company/myco')).toBe(
        'linkedin'
      )
    })

    it('detects linkedin without protocol', () => {
      expect(detectPlatform('linkedin.com/in/jane-smith')).toBe('linkedin')
    })
  })

  describe('Etsy', () => {
    it('detects https://www.etsy.com/shop/myshop', () => {
      expect(detectPlatform('https://www.etsy.com/shop/myshop')).toBe('etsy')
    })

    it('detects etsy listing URLs', () => {
      expect(detectPlatform('https://etsy.com/listing/12345')).toBe('etsy')
    })
  })

  describe('YouTube', () => {
    it('detects https://youtube.com/@channel', () => {
      expect(detectPlatform('https://youtube.com/@channel')).toBe('youtube')
    })

    it('detects https://www.youtube.com/channel/UCxxx', () => {
      expect(detectPlatform('https://www.youtube.com/channel/UCxxx')).toBe(
        'youtube'
      )
    })

    it('detects youtube.com without protocol', () => {
      expect(detectPlatform('youtube.com/@artist')).toBe('youtube')
    })
  })

  describe('Behance', () => {
    it('detects https://www.behance.net/username', () => {
      expect(detectPlatform('https://www.behance.net/username')).toBe('behance')
    })

    it('detects behance.net without protocol', () => {
      expect(detectPlatform('behance.net/username')).toBe('behance')
    })
  })

  describe('DeviantArt', () => {
    it('detects https://www.deviantart.com/username', () => {
      expect(detectPlatform('https://www.deviantart.com/username')).toBe(
        'deviantart'
      )
    })

    it('detects deviantart.com without protocol', () => {
      expect(detectPlatform('deviantart.com/username')).toBe('deviantart')
    })
  })

  describe('ArtStation', () => {
    it('detects https://www.artstation.com/username', () => {
      expect(detectPlatform('https://www.artstation.com/username')).toBe(
        'artstation'
      )
    })

    it('detects artstation.com without protocol', () => {
      expect(detectPlatform('artstation.com/username')).toBe('artstation')
    })
  })

  describe('Pinterest', () => {
    it('detects https://pinterest.com/username', () => {
      expect(detectPlatform('https://pinterest.com/username')).toBe('pinterest')
    })

    it('detects www.pinterest.com', () => {
      expect(detectPlatform('https://www.pinterest.com/username')).toBe(
        'pinterest'
      )
    })
  })

  describe('TikTok', () => {
    it('detects https://www.tiktok.com/@username', () => {
      expect(detectPlatform('https://www.tiktok.com/@username')).toBe('tiktok')
    })

    it('detects tiktok.com without protocol', () => {
      expect(detectPlatform('tiktok.com/@username')).toBe('tiktok')
    })
  })

  describe('Threads', () => {
    it('detects https://www.threads.net/@username', () => {
      expect(detectPlatform('https://www.threads.net/@username')).toBe(
        'threads'
      )
    })

    it('detects threads.net without protocol', () => {
      expect(detectPlatform('threads.net/@username')).toBe('threads')
    })
  })

  describe('Facebook', () => {
    it('detects https://facebook.com/pagename', () => {
      expect(detectPlatform('https://facebook.com/pagename')).toBe('facebook')
    })

    it('detects www.facebook.com', () => {
      expect(detectPlatform('https://www.facebook.com/pagename')).toBe(
        'facebook'
      )
    })
  })

  describe('generic website', () => {
    it('returns "website" for https://www.myportfolio.com', () => {
      expect(detectPlatform('https://www.myportfolio.com')).toBe('website')
    })

    it('returns "website" for https://example.com/about', () => {
      expect(detectPlatform('https://example.com/about')).toBe('website')
    })

    it('returns "website" for a custom domain without protocol', () => {
      expect(detectPlatform('myartsite.com')).toBe('website')
    })
  })

  describe('invalid URLs', () => {
    it('returns "other" for completely invalid input', () => {
      expect(detectPlatform('not a url')).toBe('other')
    })

    it('returns "other" for empty string', () => {
      expect(detectPlatform('')).toBe('other')
    })
  })

  describe('case insensitivity', () => {
    it('detects uppercase URLs', () => {
      expect(detectPlatform('HTTPS://INSTAGRAM.COM/USER')).toBe('instagram')
    })

    it('detects mixed case URLs', () => {
      expect(detectPlatform('https://Twitter.com/User')).toBe('twitter')
    })
  })

  describe('whitespace handling', () => {
    it('trims leading and trailing whitespace', () => {
      expect(detectPlatform('  https://instagram.com/user  ')).toBe(
        'instagram'
      )
    })
  })
})

describe('isValidUrl', () => {
  it('returns true for https://example.com', () => {
    expect(isValidUrl('https://example.com')).toBe(true)
  })

  it('returns true for example.com (no protocol)', () => {
    expect(isValidUrl('example.com')).toBe(true)
  })

  it('returns true for http://example.com', () => {
    expect(isValidUrl('http://example.com')).toBe(true)
  })

  it('returns true for URL with path', () => {
    expect(isValidUrl('https://example.com/about/page')).toBe(true)
  })

  it('returns false for "not a url"', () => {
    expect(isValidUrl('not a url')).toBe(false)
  })

  it('returns false for empty string', () => {
    expect(isValidUrl('')).toBe(false)
  })

  it('returns false for just whitespace', () => {
    expect(isValidUrl('   ')).toBe(false)
  })
})

describe('normalizeUrl', () => {
  it('adds https:// to example.com', () => {
    expect(normalizeUrl('example.com')).toBe('https://example.com')
  })

  it('preserves existing https://', () => {
    expect(normalizeUrl('https://example.com')).toBe('https://example.com')
  })

  it('preserves existing http://', () => {
    expect(normalizeUrl('http://example.com')).toBe('http://example.com')
  })

  it('trims whitespace', () => {
    expect(normalizeUrl('  example.com  ')).toBe('https://example.com')
  })

  it('adds protocol to URL with path', () => {
    expect(normalizeUrl('instagram.com/user')).toBe(
      'https://instagram.com/user'
    )
  })
})
