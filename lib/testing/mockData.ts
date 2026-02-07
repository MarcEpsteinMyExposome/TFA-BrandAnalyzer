import type {
  PlatformEntry,
  UploadedImage,
  ExtractedContent,
} from '@/lib/schemas/platform.schema'
import type { BrandReport } from '@/lib/schemas/report.schema'

export function createMockPlatformEntry(
  overrides: Partial<PlatformEntry> = {}
): PlatformEntry {
  return {
    platform: 'website',
    url: 'https://example.com',
    fetchable: true,
    fetchStatus: 'pending',
    ...overrides,
  }
}

export function createMockExtractedContent(
  overrides: Partial<ExtractedContent> = {}
): ExtractedContent {
  return {
    title: 'Artist Portfolio',
    description: 'A portfolio of artwork by Jane Artist',
    headings: ['Welcome', 'About Me', 'Gallery'],
    links: [
      'https://instagram.com/janeartist',
      'https://etsy.com/shop/janeartist',
    ],
    images: {
      profilePhoto: 'https://example.com/photo.jpg',
      ogImage: 'https://example.com/og.jpg',
    },
    colors: ['#1a1a2e', '#e94560', '#f5f5f5'],
    textContent:
      'Jane Artist is a mixed media artist based in Portland, OR...',
    ...overrides,
  }
}

export function createMockUploadedImage(
  overrides: Partial<UploadedImage> = {}
): UploadedImage {
  return {
    data: 'data:image/png;base64,iVBORw0KGgo=',
    mimeType: 'image/png',
    fileName: 'screenshot.png',
    fileSize: 1024,
    width: 1080,
    height: 1920,
    ...overrides,
  }
}

export function createMockBrandReport(
  overrides: Partial<BrandReport> = {}
): BrandReport {
  return {
    summary:
      'Your brand shows good consistency across platforms but has some completeness gaps.',
    consistency: {
      overallScore: 78,
      categories: [
        {
          category: 'name',
          score: 95,
          summary: 'Name is consistent across all platforms.',
          platforms: ['website', 'instagram', 'etsy'],
        },
        {
          category: 'bio',
          score: 70,
          summary: 'Bio varies significantly between platforms.',
          platforms: ['website', 'instagram', 'etsy'],
        },
        {
          category: 'visual',
          score: 85,
          summary: 'Visual identity is mostly consistent.',
          platforms: ['website', 'instagram'],
        },
        {
          category: 'contact',
          score: 60,
          summary: 'Contact info differs across platforms.',
          platforms: ['website', 'linkedin'],
        },
        {
          category: 'crossLinks',
          score: 80,
          summary: 'Most platforms link to each other.',
          platforms: ['website', 'instagram', 'etsy'],
        },
        {
          category: 'tone',
          score: 75,
          summary:
            'Tone is generally consistent with minor variations.',
          platforms: ['website', 'instagram'],
        },
      ],
      mismatches: [
        {
          type: 'text',
          severity: 'high',
          description:
            'Instagram bio says "oil painter" but website says "mixed media artist".',
          platforms: ['instagram', 'website'],
          recommendation:
            'Update Instagram bio to match website description.',
        },
        {
          type: 'contact',
          severity: 'medium',
          description:
            'Website shows email@example.com but LinkedIn shows different@example.com.',
          platforms: ['website', 'linkedin'],
          recommendation: 'Use the same email across all platforms.',
        },
      ],
      ...overrides.consistency,
    },
    completeness: {
      overallScore: 55,
      categories: [
        {
          category: 'platformCoverage',
          score: 70,
          summary: 'Present on most relevant platforms.',
          details:
            'Found on website, Instagram, Etsy. Missing: Behance, Pinterest.',
        },
        {
          category: 'purchasePath',
          score: 40,
          summary: 'Purchase path is incomplete.',
          details:
            'Etsy shop exists but not linked from social profiles.',
        },
        {
          category: 'socialProof',
          score: 50,
          summary: 'Some social proof present.',
          details:
            'Testimonials on website but none on Etsy or social.',
        },
        {
          category: 'eventsAndShows',
          score: 30,
          summary: 'Limited event promotion.',
          details: 'No upcoming events listed on any platform.',
        },
        {
          category: 'artistStory',
          score: 85,
          summary: 'Strong artist story.',
          details:
            'Detailed about page on website with artist statement.',
        },
      ],
      gaps: [
        {
          category: 'purchasePath',
          severity: 'high',
          description:
            'No purchase link found on Instagram or any social platform.',
          platforms: ['instagram'],
          recommendation:
            'Add your Etsy shop link to your Instagram bio.',
        },
      ],
      ...overrides.completeness,
    },
    actionItems: [
      {
        priority: 1,
        source: 'consistency',
        action:
          'Update Instagram bio to say "mixed media artist" to match website.',
        platform: 'instagram',
        impact: 'high',
        effort: 'quick',
      },
      {
        priority: 2,
        source: 'completeness',
        action: 'Add Etsy shop link to Instagram bio.',
        platform: 'instagram',
        impact: 'high',
        effort: 'quick',
      },
      {
        priority: 3,
        source: 'consistency',
        action: 'Standardize contact email across all platforms.',
        platform: 'all',
        impact: 'medium',
        effort: 'moderate',
      },
    ],
    ...overrides,
  }
}
