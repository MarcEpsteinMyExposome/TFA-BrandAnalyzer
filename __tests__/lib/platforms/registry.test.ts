import {
  PLATFORMS,
  PLATFORM_LIST,
  FETCHABLE_PLATFORMS,
  SCREENSHOT_PLATFORMS,
  getPlatform,
} from '@/lib/platforms/registry'
import { PlatformId } from '@/lib/platforms/types'

const ALL_PLATFORM_IDS: PlatformId[] = [
  'website',
  'linkedin',
  'behance',
  'deviantart',
  'etsy',
  'instagram',
  'tiktok',
  'facebook',
  'twitter',
  'pinterest',
  'artstation',
  'youtube',
  'threads',
  'other',
]

const FETCHABLE_IDS: PlatformId[] = [
  'website',
  'linkedin',
  'behance',
  'deviantart',
  'etsy',
  'artstation',
  'youtube',
  'other',
]

const NON_FETCHABLE_IDS: PlatformId[] = [
  'instagram',
  'tiktok',
  'facebook',
  'twitter',
  'pinterest',
  'threads',
]

describe('Platform Registry', () => {
  describe('PLATFORMS record', () => {
    it('defines all expected platform IDs', () => {
      const definedIds = Object.keys(PLATFORMS) as PlatformId[]
      expect(definedIds).toHaveLength(ALL_PLATFORM_IDS.length)
      for (const id of ALL_PLATFORM_IDS) {
        expect(PLATFORMS[id]).toBeDefined()
      }
    })

    it.each(ALL_PLATFORM_IDS)(
      'platform "%s" has all required fields',
      (id) => {
        const platform = PLATFORMS[id]
        expect(platform.id).toBe(id)
        expect(typeof platform.name).toBe('string')
        expect(platform.name.length).toBeGreaterThan(0)
        expect(typeof platform.fetchable).toBe('boolean')
        expect(Array.isArray(platform.urlPatterns)).toBe(true)
        expect(typeof platform.icon).toBe('string')
        expect(platform.icon).toMatch(/^\/platforms\/.*\.svg$/)
        expect(Array.isArray(platform.dataPoints)).toBe(true)
        expect(platform.dataPoints.length).toBeGreaterThan(0)
      }
    )
  })

  describe('fetchable platforms', () => {
    it.each(FETCHABLE_IDS)('"%s" is fetchable', (id) => {
      expect(PLATFORMS[id].fetchable).toBe(true)
    })

    it('FETCHABLE_PLATFORMS array contains exactly the fetchable platforms', () => {
      const fetchableIds = FETCHABLE_PLATFORMS.map((p) => p.id).sort()
      expect(fetchableIds).toEqual([...FETCHABLE_IDS].sort())
    })
  })

  describe('non-fetchable platforms', () => {
    it.each(NON_FETCHABLE_IDS)('"%s" is non-fetchable', (id) => {
      expect(PLATFORMS[id].fetchable).toBe(false)
    })

    it.each(NON_FETCHABLE_IDS)(
      '"%s" has screenshotInstructions',
      (id) => {
        const platform = PLATFORMS[id]
        expect(platform.screenshotInstructions).toBeDefined()
        expect(typeof platform.screenshotInstructions).toBe('string')
        expect(platform.screenshotInstructions!.length).toBeGreaterThan(0)
      }
    )

    it('SCREENSHOT_PLATFORMS array contains exactly the non-fetchable platforms', () => {
      const screenshotIds = SCREENSHOT_PLATFORMS.map((p) => p.id).sort()
      expect(screenshotIds).toEqual([...NON_FETCHABLE_IDS].sort())
    })
  })

  describe('PLATFORM_LIST', () => {
    it('contains all platforms', () => {
      expect(PLATFORM_LIST).toHaveLength(ALL_PLATFORM_IDS.length)
    })

    it('contains every platform from PLATFORMS record', () => {
      const listIds = PLATFORM_LIST.map((p) => p.id).sort()
      const recordIds = (Object.keys(PLATFORMS) as PlatformId[]).sort()
      expect(listIds).toEqual(recordIds)
    })
  })

  describe('getPlatform', () => {
    it('returns correct platform for known IDs', () => {
      expect(getPlatform('instagram').id).toBe('instagram')
      expect(getPlatform('youtube').id).toBe('youtube')
      expect(getPlatform('website').id).toBe('website')
    })

    it('returns "other" config for unknown ID', () => {
      // Force an unknown string to test fallback
      const result = getPlatform('nonexistent' as PlatformId)
      expect(result.id).toBe('other')
    })
  })

  describe('URL patterns', () => {
    it('specific platforms have at least one URL pattern', () => {
      const platformsWithPatterns = ALL_PLATFORM_IDS.filter(
        (id) => id !== 'website' && id !== 'other'
      )
      for (const id of platformsWithPatterns) {
        expect(PLATFORMS[id].urlPatterns.length).toBeGreaterThan(0)
      }
    })

    it('website and other have empty URL patterns', () => {
      expect(PLATFORMS.website.urlPatterns).toHaveLength(0)
      expect(PLATFORMS.other.urlPatterns).toHaveLength(0)
    })

    it('twitter has patterns for both twitter.com and x.com', () => {
      const patterns = PLATFORMS.twitter.urlPatterns
      const hasTwitter = patterns.some((p) => p.test('twitter.com/user'))
      const hasX = patterns.some((p) => p.test('x.com/user'))
      expect(hasTwitter).toBe(true)
      expect(hasX).toBe(true)
    })
  })

  describe('data points', () => {
    it('website has expected data points', () => {
      const dp = PLATFORMS.website.dataPoints
      expect(dp).toContain('title')
      expect(dp).toContain('bio')
      expect(dp).toContain('contactInfo')
      expect(dp).toContain('links')
    })

    it('instagram has expected data points', () => {
      const dp = PLATFORMS.instagram.dataPoints
      expect(dp).toContain('profilePhoto')
      expect(dp).toContain('bio')
      expect(dp).toContain('displayName')
      expect(dp).toContain('linkInBio')
    })

    it('linkedin has expected data points', () => {
      const dp = PLATFORMS.linkedin.dataPoints
      expect(dp).toContain('headline')
      expect(dp).toContain('summary')
      expect(dp).toContain('profilePhoto')
    })
  })
})
