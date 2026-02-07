export type PlatformId =
  | 'website'
  | 'linkedin'
  | 'behance'
  | 'deviantart'
  | 'etsy'
  | 'instagram'
  | 'tiktok'
  | 'facebook'
  | 'twitter'
  | 'pinterest'
  | 'artstation'
  | 'youtube'
  | 'threads'
  | 'other'

export interface PlatformConfig {
  id: PlatformId
  name: string
  fetchable: boolean
  urlPatterns: RegExp[]
  screenshotInstructions?: string
  icon: string // path to SVG in /public/platforms/
  dataPoints: string[]
}
