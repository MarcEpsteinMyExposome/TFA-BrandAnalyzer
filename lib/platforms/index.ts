export type { PlatformId, PlatformConfig } from './types'
export {
  PLATFORMS,
  PLATFORM_LIST,
  FETCHABLE_PLATFORMS,
  SCREENSHOT_PLATFORMS,
  getPlatform,
} from './registry'
export { detectPlatform, isValidUrl, normalizeUrl } from './detect'
