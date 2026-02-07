import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex-1 flex items-center justify-center py-24">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Page Not Found</h1>
          <p className="text-gray-600 mt-4">
            The page you&#39;re looking for doesn&#39;t exist.
          </p>
          <a
            href="/"
            className="bg-gray-900 text-white rounded-md px-6 py-3 font-medium hover:bg-gray-800 inline-block mt-8"
          >
            Go Home
          </a>
        </div>
      </main>
      <Footer />
    </>
  )
}
