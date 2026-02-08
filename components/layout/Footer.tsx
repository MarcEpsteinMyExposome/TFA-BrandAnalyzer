'use client'

import { APP_VERSION } from '@/lib/version'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-5xl mx-auto px-4 py-6 text-center">
        <p className="text-sm text-gray-500">
          &copy; 2026 Technology for Artists. All rights reserved.
        </p>
        <p className="text-xs text-gray-400 mt-1">v{APP_VERSION}</p>
      </div>
    </footer>
  )
}
