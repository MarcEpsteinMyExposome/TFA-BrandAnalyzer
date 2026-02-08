import { useAnalysisStore } from '@/lib/store/analysisStore'
import {
  createMockExtractedContent,
  createMockUploadedImage,
  createMockBrandReport,
} from '@/lib/testing/mockData'

describe('analysisStore', () => {
  beforeEach(() => {
    useAnalysisStore.getState().reset()
  })

  describe('initial state', () => {
    it('has step set to "urls"', () => {
      const state = useAnalysisStore.getState()
      expect(state.step).toBe('urls')
    })

    it('has empty platforms array', () => {
      const state = useAnalysisStore.getState()
      expect(state.platforms).toEqual([])
    })

    it('has report as null', () => {
      const state = useAnalysisStore.getState()
      expect(state.report).toBeNull()
    })

    it('has isAnalyzing as false', () => {
      const state = useAnalysisStore.getState()
      expect(state.isAnalyzing).toBe(false)
    })

    it('has error as null', () => {
      const state = useAnalysisStore.getState()
      expect(state.error).toBeNull()
    })
  })

  describe('addPlatform', () => {
    it('adds a platform entry with correct fields', () => {
      useAnalysisStore.getState().addPlatform('instagram', 'https://instagram.com/artist', false)

      const state = useAnalysisStore.getState()
      expect(state.platforms).toHaveLength(1)
      expect(state.platforms[0]).toEqual({
        platform: 'instagram',
        url: 'https://instagram.com/artist',
        fetchable: false,
        fetchStatus: 'pending',
        screenshots: [],
      })
    })

    it('can add multiple platforms', () => {
      useAnalysisStore.getState().addPlatform('website', 'https://example.com', true)
      useAnalysisStore.getState().addPlatform('instagram', 'https://instagram.com/artist', false)
      useAnalysisStore.getState().addPlatform('etsy', 'https://etsy.com/shop/artist', true)

      const state = useAnalysisStore.getState()
      expect(state.platforms).toHaveLength(3)
      expect(state.platforms[0].platform).toBe('website')
      expect(state.platforms[1].platform).toBe('instagram')
      expect(state.platforms[2].platform).toBe('etsy')
    })
  })

  describe('removePlatform', () => {
    it('removes platform at correct index', () => {
      useAnalysisStore.getState().addPlatform('website', 'https://example.com', true)
      useAnalysisStore.getState().addPlatform('instagram', 'https://instagram.com/artist', false)
      useAnalysisStore.getState().addPlatform('etsy', 'https://etsy.com/shop/artist', true)

      useAnalysisStore.getState().removePlatform(1)

      const state = useAnalysisStore.getState()
      expect(state.platforms).toHaveLength(2)
      expect(state.platforms[0].platform).toBe('website')
      expect(state.platforms[1].platform).toBe('etsy')
    })

    it('handles removing the last item', () => {
      useAnalysisStore.getState().addPlatform('website', 'https://example.com', true)

      useAnalysisStore.getState().removePlatform(0)

      const state = useAnalysisStore.getState()
      expect(state.platforms).toHaveLength(0)
    })
  })

  describe('updatePlatformUrl', () => {
    it('updates URL at correct index', () => {
      useAnalysisStore.getState().addPlatform('website', 'https://old-url.com', true)
      useAnalysisStore.getState().addPlatform('instagram', 'https://instagram.com/artist', false)

      useAnalysisStore.getState().updatePlatformUrl(0, 'https://new-url.com')

      const state = useAnalysisStore.getState()
      expect(state.platforms[0].url).toBe('https://new-url.com')
      expect(state.platforms[1].url).toBe('https://instagram.com/artist')
    })
  })

  describe('updateFetchStatus', () => {
    beforeEach(() => {
      useAnalysisStore.getState().addPlatform('website', 'https://example.com', true)
    })

    it('updates status to "fetching"', () => {
      useAnalysisStore.getState().updateFetchStatus(0, 'fetching')

      const state = useAnalysisStore.getState()
      expect(state.platforms[0].fetchStatus).toBe('fetching')
    })

    it('updates status to "success" with content', () => {
      const content = createMockExtractedContent()
      useAnalysisStore.getState().updateFetchStatus(0, 'success', content)

      const state = useAnalysisStore.getState()
      expect(state.platforms[0].fetchStatus).toBe('success')
      expect(state.platforms[0].fetchedContent).toEqual(content)
    })

    it('updates status to "error" with error message', () => {
      useAnalysisStore.getState().updateFetchStatus(0, 'error', undefined, 'Failed to fetch')

      const state = useAnalysisStore.getState()
      expect(state.platforms[0].fetchStatus).toBe('error')
      expect(state.platforms[0].fetchError).toBe('Failed to fetch')
    })

    it('preserves existing content when updating status without new content', () => {
      const content = createMockExtractedContent()
      useAnalysisStore.getState().updateFetchStatus(0, 'success', content)
      useAnalysisStore.getState().updateFetchStatus(0, 'fetching')

      const state = useAnalysisStore.getState()
      expect(state.platforms[0].fetchStatus).toBe('fetching')
      expect(state.platforms[0].fetchedContent).toEqual(content)
    })
  })

  describe('addScreenshot', () => {
    it('adds screenshot to correct platform', () => {
      useAnalysisStore.getState().addPlatform('instagram', 'https://instagram.com/artist', false)
      useAnalysisStore.getState().addPlatform('tiktok', 'https://tiktok.com/@artist', false)

      const image = createMockUploadedImage()
      useAnalysisStore.getState().addScreenshot(0, image)

      const state = useAnalysisStore.getState()
      expect(state.platforms[0].screenshots).toEqual([image])
      expect(state.platforms[1].screenshots).toEqual([])
    })

    it('adds multiple screenshots to same platform', () => {
      useAnalysisStore.getState().addPlatform('instagram', 'https://instagram.com/artist', false)

      const image1 = createMockUploadedImage()
      const image2 = createMockUploadedImage()
      useAnalysisStore.getState().addScreenshot(0, image1)
      useAnalysisStore.getState().addScreenshot(0, image2)

      const state = useAnalysisStore.getState()
      expect(state.platforms[0].screenshots).toHaveLength(2)
    })
  })

  describe('removeScreenshot', () => {
    it('removes screenshot at correct index from platform', () => {
      useAnalysisStore.getState().addPlatform('instagram', 'https://instagram.com/artist', false)
      const image1 = createMockUploadedImage()
      const image2 = createMockUploadedImage()
      useAnalysisStore.getState().addScreenshot(0, image1)
      useAnalysisStore.getState().addScreenshot(0, image2)

      useAnalysisStore.getState().removeScreenshot(0, 0)

      const state = useAnalysisStore.getState()
      expect(state.platforms[0].screenshots).toHaveLength(1)
      expect(state.platforms[0].screenshots[0]).toEqual(image2)
    })
  })

  describe('setReport', () => {
    it('sets the brand report', () => {
      const report = createMockBrandReport()
      useAnalysisStore.getState().setReport(report)

      const state = useAnalysisStore.getState()
      expect(state.report).toEqual(report)
    })
  })

  describe('setStep', () => {
    it('changes step to "screenshots"', () => {
      useAnalysisStore.getState().setStep('screenshots')

      const state = useAnalysisStore.getState()
      expect(state.step).toBe('screenshots')
    })

    it('changes step to "processing"', () => {
      useAnalysisStore.getState().setStep('processing')

      const state = useAnalysisStore.getState()
      expect(state.step).toBe('processing')
    })

    it('changes step to "report"', () => {
      useAnalysisStore.getState().setStep('report')

      const state = useAnalysisStore.getState()
      expect(state.step).toBe('report')
    })
  })

  describe('setIsAnalyzing', () => {
    it('sets isAnalyzing to true', () => {
      useAnalysisStore.getState().setIsAnalyzing(true)

      const state = useAnalysisStore.getState()
      expect(state.isAnalyzing).toBe(true)
    })

    it('sets isAnalyzing back to false', () => {
      useAnalysisStore.getState().setIsAnalyzing(true)
      useAnalysisStore.getState().setIsAnalyzing(false)

      const state = useAnalysisStore.getState()
      expect(state.isAnalyzing).toBe(false)
    })
  })

  describe('setError', () => {
    it('sets an error message', () => {
      useAnalysisStore.getState().setError('Something went wrong')

      const state = useAnalysisStore.getState()
      expect(state.error).toBe('Something went wrong')
    })

    it('clears the error', () => {
      useAnalysisStore.getState().setError('Something went wrong')
      useAnalysisStore.getState().setError(null)

      const state = useAnalysisStore.getState()
      expect(state.error).toBeNull()
    })
  })

  describe('reset', () => {
    it('returns to initial state after modifications', () => {
      // Make various modifications
      useAnalysisStore.getState().addPlatform('website', 'https://example.com', true)
      useAnalysisStore.getState().addPlatform('instagram', 'https://instagram.com/artist', false)
      useAnalysisStore.getState().setStep('processing')
      useAnalysisStore.getState().setIsAnalyzing(true)
      useAnalysisStore.getState().setError('Some error')
      useAnalysisStore.getState().setReport(createMockBrandReport())

      // Reset
      useAnalysisStore.getState().reset()

      const state = useAnalysisStore.getState()
      expect(state.step).toBe('urls')
      expect(state.platforms).toEqual([])
      expect(state.report).toBeNull()
      expect(state.isAnalyzing).toBe(false)
      expect(state.error).toBeNull()
    })
  })
})
