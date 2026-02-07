import type { PlatformId } from '@/lib/platforms/types'
import type { ExtractedContent } from '@/lib/schemas/platform.schema'

export interface FetchPageRequest {
  url: string
  platform: PlatformId
}

export interface FetchPageResponse {
  success: boolean
  content?: ExtractedContent
  error?: string
}
