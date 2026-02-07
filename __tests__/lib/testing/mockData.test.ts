import {
  createMockPlatformEntry,
  createMockExtractedContent,
  createMockUploadedImage,
  createMockBrandReport,
} from '@/lib/testing/mockData'

describe('mockData factories', () => {
  describe('createMockPlatformEntry', () => {
    it('returns a valid PlatformEntry with defaults', () => {
      const entry = createMockPlatformEntry()

      expect(entry.platform).toBe('website')
      expect(entry.url).toBe('https://example.com')
      expect(entry.fetchable).toBe(true)
      expect(entry.fetchStatus).toBe('pending')
    })

    it('accepts overrides', () => {
      const entry = createMockPlatformEntry({
        platform: 'instagram',
        url: 'https://instagram.com/custom',
        fetchable: false,
        fetchStatus: 'success',
      })

      expect(entry.platform).toBe('instagram')
      expect(entry.url).toBe('https://instagram.com/custom')
      expect(entry.fetchable).toBe(false)
      expect(entry.fetchStatus).toBe('success')
    })

    it('allows partial overrides', () => {
      const entry = createMockPlatformEntry({ platform: 'etsy' })

      expect(entry.platform).toBe('etsy')
      expect(entry.url).toBe('https://example.com')
      expect(entry.fetchable).toBe(true)
    })
  })

  describe('createMockExtractedContent', () => {
    it('returns valid ExtractedContent with defaults', () => {
      const content = createMockExtractedContent()

      expect(content.title).toBe('Artist Portfolio')
      expect(content.description).toContain('Jane Artist')
      expect(content.headings).toEqual(['Welcome', 'About Me', 'Gallery'])
      expect(content.links).toHaveLength(2)
      expect(content.images.profilePhoto).toBeDefined()
      expect(content.images.ogImage).toBeDefined()
      expect(content.colors).toHaveLength(3)
      expect(content.textContent).toContain('mixed media artist')
    })

    it('accepts overrides', () => {
      const content = createMockExtractedContent({
        title: 'Custom Title',
        headings: ['Custom Heading'],
      })

      expect(content.title).toBe('Custom Title')
      expect(content.headings).toEqual(['Custom Heading'])
      expect(content.description).toContain('Jane Artist')
    })
  })

  describe('createMockUploadedImage', () => {
    it('returns a valid UploadedImage with defaults', () => {
      const image = createMockUploadedImage()

      expect(image.data).toContain('base64')
      expect(image.mimeType).toBe('image/png')
      expect(image.fileName).toBe('screenshot.png')
      expect(image.fileSize).toBe(1024)
      expect(image.width).toBe(1080)
      expect(image.height).toBe(1920)
    })

    it('accepts overrides', () => {
      const image = createMockUploadedImage({
        mimeType: 'image/jpeg',
        fileName: 'custom.jpg',
        fileSize: 2048,
      })

      expect(image.mimeType).toBe('image/jpeg')
      expect(image.fileName).toBe('custom.jpg')
      expect(image.fileSize).toBe(2048)
      expect(image.width).toBe(1080)
    })
  })

  describe('createMockBrandReport', () => {
    it('returns a valid BrandReport with all sections', () => {
      const report = createMockBrandReport()

      // Summary
      expect(report.summary).toBeDefined()
      expect(typeof report.summary).toBe('string')

      // Consistency
      expect(report.consistency.overallScore).toBe(78)
      expect(report.consistency.categories).toHaveLength(6)
      expect(report.consistency.mismatches).toHaveLength(2)

      // Completeness
      expect(report.completeness.overallScore).toBe(55)
      expect(report.completeness.categories).toHaveLength(5)
      expect(report.completeness.gaps).toHaveLength(1)

      // Action items
      expect(report.actionItems).toHaveLength(3)
      expect(report.actionItems[0].priority).toBe(1)
    })

    it('has valid consistency categories', () => {
      const report = createMockBrandReport()
      const categoryNames = report.consistency.categories.map((c) => c.category)

      expect(categoryNames).toContain('name')
      expect(categoryNames).toContain('bio')
      expect(categoryNames).toContain('visual')
      expect(categoryNames).toContain('contact')
      expect(categoryNames).toContain('crossLinks')
      expect(categoryNames).toContain('tone')
    })

    it('has valid completeness categories', () => {
      const report = createMockBrandReport()
      const categoryNames = report.completeness.categories.map((c) => c.category)

      expect(categoryNames).toContain('platformCoverage')
      expect(categoryNames).toContain('purchasePath')
      expect(categoryNames).toContain('socialProof')
      expect(categoryNames).toContain('eventsAndShows')
      expect(categoryNames).toContain('artistStory')
    })

    it('has action items with required fields', () => {
      const report = createMockBrandReport()

      for (const item of report.actionItems) {
        expect(item.priority).toBeGreaterThan(0)
        expect(['consistency', 'completeness']).toContain(item.source)
        expect(item.action).toBeDefined()
        expect(item.platform).toBeDefined()
        expect(['high', 'medium', 'low']).toContain(item.impact)
        expect(['quick', 'moderate', 'significant']).toContain(item.effort)
      }
    })

    it('accepts overrides for top-level fields', () => {
      const report = createMockBrandReport({
        summary: 'Custom summary',
      })

      expect(report.summary).toBe('Custom summary')
    })
  })
})
