'use client'

import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <>
      <Header />
      <main className="flex-1 flex items-center justify-center py-24">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Something went wrong
          </h1>
          <p className="text-gray-600 mt-4">
            An unexpected error occurred. Please try again.
          </p>
          <button
            onClick={reset}
            className="bg-gray-900 text-white rounded-md px-6 py-3 font-medium hover:bg-gray-800 inline-block mt-8 cursor-pointer"
          >
            Try again
          </button>
        </div>
      </main>
      <Footer />
    </>
  )
}
