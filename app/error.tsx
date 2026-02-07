'use client'

import { useEffect } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Unhandled error:', error)
  }, [error])

  return (
    <>
      <Header />
      <main className="flex-1 flex items-center justify-center py-24">
        <div className="text-center max-w-md mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900">
            Something went wrong
          </h1>
          <p className="text-gray-600 mt-4">
            An unexpected error occurred. This might be a temporary issue — please try again.
          </p>
          <button
            onClick={reset}
            className="bg-gray-900 text-white rounded-md px-6 py-3 font-medium hover:bg-gray-800 inline-block mt-8 cursor-pointer"
          >
            Try Again
          </button>
        </div>
      </main>
      <Footer />
    </>
  )
}
