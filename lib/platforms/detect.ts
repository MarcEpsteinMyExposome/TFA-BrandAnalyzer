import { PlatformId } from './types'
import { PLATFORM_LIST } from './registry'

/**
 * Detect platform from a URL string.
 * Handles: http://, https://, no protocol, www. prefix, trailing slashes.
 * Returns 'website' for valid URLs not matching any known platform.
 * Returns 'other' for invalid URLs.
 */
export function detectPlatform(url: string): PlatformId {
  // Normalize: add protocol if missing, lowercase
  let normalized = url.trim().toLowerCase()
  if (
    !normalized.startsWith('http://') &&
    !normalized.startsWith('https://')
  ) {
    normalized = 'https://' + normalized
  }

  try {
    const urlObj = new URL(normalized)
    const hostname = urlObj.hostname.replace(/^www\./, '')
    const fullUrl = hostname + urlObj.pathname

    // Check each platform's URL patterns (skip 'website' and 'other')
    for (const platform of PLATFORM_LIST) {
      if (platform.id === 'website' || platform.id === 'other') continue
      for (const pattern of platform.urlPatterns) {
        if (pattern.test(normalized) || pattern.test(fullUrl)) {
          return platform.id
        }
      }
    }

    // Valid URL but no platform match — treat as generic website
    return 'website'
  } catch {
    // Invalid URL
    return 'other'
  }
}

/**
 * Check if a string looks like a valid URL.
 * Accepts URLs with or without protocol prefix.
 */
export function isValidUrl(url: string): boolean {
  let normalized = url.trim()
  if (!normalized) return false
  if (
    !normalized.startsWith('http://') &&
    !normalized.startsWith('https://')
  ) {
    normalized = 'https://' + normalized
  }
  try {
    new URL(normalized)
    return true
  } catch {
    return false
  }
}

/**
 * Normalize a URL: ensure protocol, trim whitespace.
 */
export function normalizeUrl(url: string): string {
  let normalized = url.trim()
  if (
    !normalized.startsWith('http://') &&
    !normalized.startsWith('https://')
  ) {
    normalized = 'https://' + normalized
  }
  return normalized
}
