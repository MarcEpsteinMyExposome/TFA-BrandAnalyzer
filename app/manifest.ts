import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Brand Health Analyzer',
    short_name: 'BrandHealth',
    description:
      'Free AI-powered brand health analysis for artists. Check your online presence for consistency and completeness across all platforms.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f9fafb',
    theme_color: '#111827',
    icons: [
      {
        src: '/favicon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  }
}
