'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Import types from schema files
import type {
  PlatformId,
  FetchStatus,
  UploadedImage,
  ExtractedContent,
  PlatformEntry,
} from '@/lib/schemas/platform.schema'
import type { BrandReport } from '@/lib/schemas/report.schema'

// Re-export types for convenience
export type { PlatformId, FetchStatus, UploadedImage, ExtractedContent, PlatformEntry, BrandReport }

// Analysis step type (UI-only, not in schemas)
export type AnalysisStep = 'urls' | 'screenshots' | 'processing' | 'report'

// Store state interface
export interface AnalysisState {
  // State
  step: AnalysisStep
  platforms: PlatformEntry[]
  report: BrandReport | null
  isAnalyzing: boolean
  error: string | null

  // Actions
  addPlatform: (platform: PlatformId, url: string, fetchable: boolean) => void
  removePlatform: (index: number) => void
  updatePlatformUrl: (index: number, url: string) => void
  updateFetchStatus: (index: number, status: FetchStatus, content?: ExtractedContent, error?: string) => void
  setScreenshot: (index: number, image: UploadedImage) => void
  removeScreenshot: (index: number) => void
  setReport: (report: BrandReport) => void
  setStep: (step: AnalysisStep) => void
  setIsAnalyzing: (isAnalyzing: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

const initialState = {
  step: 'urls' as AnalysisStep,
  platforms: [] as PlatformEntry[],
  report: null as BrandReport | null,
  isAnalyzing: false,
  error: null as string | null,
}

export const useAnalysisStore = create<AnalysisState>()(
  persist(
    (set) => ({
      ...initialState,

      addPlatform: (platform, url, fetchable) =>
        set((state) => ({
          platforms: [
            ...state.platforms,
            {
              platform,
              url,
              fetchable,
              fetchStatus: 'pending' as FetchStatus,
            },
          ],
        })),

      removePlatform: (index) =>
        set((state) => ({
          platforms: state.platforms.filter((_, i) => i !== index),
        })),

      updatePlatformUrl: (index, url) =>
        set((state) => ({
          platforms: state.platforms.map((p, i) =>
            i === index ? { ...p, url } : p
          ),
        })),

      updateFetchStatus: (index, status, content, error) =>
        set((state) => ({
          platforms: state.platforms.map((p, i) =>
            i === index
              ? {
                  ...p,
                  fetchStatus: status,
                  fetchedContent: content ?? p.fetchedContent,
                  fetchError: error ?? p.fetchError,
                }
              : p
          ),
        })),

      setScreenshot: (index, image) =>
        set((state) => ({
          platforms: state.platforms.map((p, i) =>
            i === index ? { ...p, screenshot: image } : p
          ),
        })),

      removeScreenshot: (index) =>
        set((state) => ({
          platforms: state.platforms.map((p, i) =>
            i === index ? { ...p, screenshot: undefined } : p
          ),
        })),

      setReport: (report) => set({ report }),

      setStep: (step) => set({ step }),

      setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),

      setError: (error) => set({ error }),

      reset: () => set(initialState),
    }),
    {
      name: 'tfa-brand-analysis',
      // Only persist platforms and step — not report or transient state
      partialize: (state) => ({
        step: state.step,
        platforms: state.platforms,
      }),
    }
  )
)
