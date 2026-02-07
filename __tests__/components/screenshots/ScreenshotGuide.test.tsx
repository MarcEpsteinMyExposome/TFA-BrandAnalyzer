import { render, screen } from '@testing-library/react'
import ScreenshotGuide from '@/components/screenshots/ScreenshotGuide'

// Mock the platform registry
jest.mock('@/lib/platforms/registry', () => ({
  getPlatform: jest.fn((id: string) => {
    const platforms: Record<string, { id: string; name: string; fetchable: boolean; dataPoints: string[] }> = {
      instagram: {
        id: 'instagram',
        name: 'Instagram',
        fetchable: false,
        dataPoints: ['profilePhoto', 'bio', 'displayName', 'linkInBio', 'recentPosts', 'followerCount'],
      },
      tiktok: {
        id: 'tiktok',
        name: 'TikTok',
        fetchable: false,
        dataPoints: ['displayName', 'bio', 'profilePhoto', 'followerCount', 'recentVideos', 'links'],
      },
      facebook: {
        id: 'facebook',
        name: 'Facebook',
        fetchable: false,
        dataPoints: ['pageName', 'about', 'profilePhoto', 'coverPhoto', 'contactInfo', 'recentPosts'],
      },
    }
    return platforms[id] || { id: 'other', name: 'Other', fetchable: true, dataPoints: [] }
  }),
}))

describe('ScreenshotGuide', () => {
  it('renders the platform name in heading', () => {
    render(
      <ScreenshotGuide
        platformId="instagram"
        platformName="Instagram"
        instructions="Go to your profile page."
      />
    )

    expect(
      screen.getByText('How to screenshot Instagram')
    ).toBeInTheDocument()
  })

  it('shows screenshot instructions', () => {
    const instructions = 'Go to your profile page, scroll to show your bio and recent posts.'
    render(
      <ScreenshotGuide
        platformId="instagram"
        platformName="Instagram"
        instructions={instructions}
      />
    )

    expect(screen.getByText(instructions)).toBeInTheDocument()
  })

  it('shows checklist items based on platform dataPoints for Instagram', () => {
    render(
      <ScreenshotGuide
        platformId="instagram"
        platformName="Instagram"
        instructions="Test instructions"
      />
    )

    expect(screen.getByText('Profile photo')).toBeInTheDocument()
    expect(screen.getByText('Bio')).toBeInTheDocument()
    expect(screen.getByText('Display name')).toBeInTheDocument()
    expect(screen.getByText('Link in bio')).toBeInTheDocument()
    expect(screen.getByText('Recent posts')).toBeInTheDocument()
    expect(screen.getByText('Follower count')).toBeInTheDocument()
  })

  it('shows checklist items for TikTok platform', () => {
    render(
      <ScreenshotGuide
        platformId="tiktok"
        platformName="TikTok"
        instructions="Test instructions"
      />
    )

    expect(screen.getByText('Display name')).toBeInTheDocument()
    expect(screen.getByText('Bio')).toBeInTheDocument()
    expect(screen.getByText('Profile photo')).toBeInTheDocument()
    expect(screen.getByText('Follower count')).toBeInTheDocument()
    expect(screen.getByText('Recent videos')).toBeInTheDocument()
    expect(screen.getByText('Links')).toBeInTheDocument()
  })

  it('shows checklist items for Facebook platform', () => {
    render(
      <ScreenshotGuide
        platformId="facebook"
        platformName="Facebook"
        instructions="Test instructions"
      />
    )

    expect(screen.getByText('Page name')).toBeInTheDocument()
    expect(screen.getByText('About')).toBeInTheDocument()
    expect(screen.getByText('Profile photo')).toBeInTheDocument()
    expect(screen.getByText('Cover photo')).toBeInTheDocument()
    expect(screen.getByText('Contact info')).toBeInTheDocument()
    expect(screen.getByText('Recent posts')).toBeInTheDocument()
  })

  it('shows "Make sure your screenshot includes:" label', () => {
    render(
      <ScreenshotGuide
        platformId="instagram"
        platformName="Instagram"
        instructions="Test instructions"
      />
    )

    expect(
      screen.getByText('Make sure your screenshot includes:')
    ).toBeInTheDocument()
  })
})
