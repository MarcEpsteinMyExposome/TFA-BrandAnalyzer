import { PlatformId, PlatformConfig } from './types'

/**
 * Registry of all supported platforms with their configuration.
 *
 * Each platform defines:
 * - Whether its pages can be auto-fetched (fetchable)
 * - URL patterns for detection
 * - Screenshot instructions for non-fetchable platforms
 * - Data points we can extract from the platform
 */
export const PLATFORMS: Record<PlatformId, PlatformConfig> = {
  website: {
    id: 'website',
    name: 'Website',
    fetchable: true,
    urlPatterns: [], // Catch-all for URLs not matching other platforms
    icon: '/platforms/website.svg',
    dataPoints: ['title', 'bio', 'about', 'contactInfo', 'links', 'images'],
  },

  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn',
    fetchable: true,
    urlPatterns: [/linkedin\.com\/in\//, /linkedin\.com\/company\//],
    icon: '/platforms/linkedin.svg',
    dataPoints: [
      'headline',
      'summary',
      'experience',
      'profilePhoto',
      'skills',
      'contactInfo',
    ],
  },

  behance: {
    id: 'behance',
    name: 'Behance',
    fetchable: true,
    urlPatterns: [/behance\.net\//],
    icon: '/platforms/behance.svg',
    dataPoints: [
      'displayName',
      'bio',
      'projects',
      'profilePhoto',
      'skills',
      'links',
    ],
  },

  deviantart: {
    id: 'deviantart',
    name: 'DeviantArt',
    fetchable: true,
    urlPatterns: [/deviantart\.com\//, /\.deviantart\.com/],
    icon: '/platforms/deviantart.svg',
    dataPoints: [
      'displayName',
      'bio',
      'gallery',
      'profilePhoto',
      'links',
      'groups',
    ],
  },

  etsy: {
    id: 'etsy',
    name: 'Etsy',
    fetchable: true,
    urlPatterns: [/etsy\.com\/shop\//, /etsy\.com\/listing\//],
    icon: '/platforms/etsy.svg',
    dataPoints: [
      'shopName',
      'shopDescription',
      'products',
      'shopPhoto',
      'reviews',
      'policies',
    ],
  },

  instagram: {
    id: 'instagram',
    name: 'Instagram',
    fetchable: false,
    urlPatterns: [/instagram\.com\//],
    screenshotInstructions:
      'Go to your profile page, scroll to show your bio and recent posts, then take a screenshot.',
    icon: '/platforms/instagram.svg',
    dataPoints: [
      'profilePhoto',
      'bio',
      'displayName',
      'linkInBio',
      'recentPosts',
      'followerCount',
    ],
  },

  tiktok: {
    id: 'tiktok',
    name: 'TikTok',
    fetchable: false,
    urlPatterns: [/tiktok\.com\/@/],
    screenshotInstructions:
      'Open your profile page showing your bio, follower count, and recent videos.',
    icon: '/platforms/tiktok.svg',
    dataPoints: [
      'displayName',
      'bio',
      'profilePhoto',
      'followerCount',
      'recentVideos',
      'links',
    ],
  },

  facebook: {
    id: 'facebook',
    name: 'Facebook',
    fetchable: false,
    urlPatterns: [/facebook\.com\//],
    screenshotInstructions:
      'Navigate to your artist page or profile, capture the about section and recent posts.',
    icon: '/platforms/facebook.svg',
    dataPoints: [
      'pageName',
      'about',
      'profilePhoto',
      'coverPhoto',
      'contactInfo',
      'recentPosts',
    ],
  },

  twitter: {
    id: 'twitter',
    name: 'Twitter / X',
    fetchable: false,
    urlPatterns: [/twitter\.com\//, /x\.com\//],
    screenshotInstructions:
      'Go to your profile showing your bio, header image, and recent tweets.',
    icon: '/platforms/twitter.svg',
    dataPoints: [
      'displayName',
      'handle',
      'bio',
      'profilePhoto',
      'headerImage',
      'links',
      'recentTweets',
    ],
  },

  pinterest: {
    id: 'pinterest',
    name: 'Pinterest',
    fetchable: false,
    urlPatterns: [/pinterest\.com\//],
    screenshotInstructions:
      'Open your profile page showing your boards and profile info.',
    icon: '/platforms/pinterest.svg',
    dataPoints: [
      'displayName',
      'bio',
      'profilePhoto',
      'boards',
      'followerCount',
    ],
  },

  artstation: {
    id: 'artstation',
    name: 'ArtStation',
    fetchable: true,
    urlPatterns: [/artstation\.com\//],
    icon: '/platforms/artstation.svg',
    dataPoints: [
      'displayName',
      'bio',
      'projects',
      'profilePhoto',
      'skills',
      'software',
      'links',
    ],
  },

  youtube: {
    id: 'youtube',
    name: 'YouTube',
    fetchable: true,
    urlPatterns: [/youtube\.com\//, /youtu\.be\//],
    icon: '/platforms/youtube.svg',
    dataPoints: [
      'channelName',
      'description',
      'profilePhoto',
      'bannerImage',
      'recentVideos',
      'subscriberCount',
      'links',
    ],
  },

  threads: {
    id: 'threads',
    name: 'Threads',
    fetchable: false,
    urlPatterns: [/threads\.net\/@/],
    screenshotInstructions:
      'Open your profile showing your bio and recent posts.',
    icon: '/platforms/threads.svg',
    dataPoints: [
      'displayName',
      'bio',
      'profilePhoto',
      'recentPosts',
      'followerCount',
    ],
  },

  other: {
    id: 'other',
    name: 'Other',
    fetchable: true,
    urlPatterns: [], // Fallback — never matched by detection
    icon: '/platforms/other.svg',
    dataPoints: ['title', 'bio', 'about', 'contactInfo', 'links', 'images'],
  },
}

/**
 * Array of all platform configs, ordered for display.
 * Specific platforms first, then generic fallbacks last.
 */
export const PLATFORM_LIST: PlatformConfig[] = Object.values(PLATFORMS)

/**
 * Only the fetchable platforms.
 */
export const FETCHABLE_PLATFORMS = PLATFORM_LIST.filter((p) => p.fetchable)

/**
 * Only the non-fetchable platforms (require screenshots).
 */
export const SCREENSHOT_PLATFORMS = PLATFORM_LIST.filter((p) => !p.fetchable)

/**
 * Get a platform config by ID. Returns the 'other' config if not found.
 */
export function getPlatform(id: PlatformId): PlatformConfig {
  return PLATFORMS[id] ?? PLATFORMS.other
}
