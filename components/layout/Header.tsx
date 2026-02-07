'use client'

import Link from 'next/link'

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200">
      <nav className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold text-gray-900">
          Tech For Artists
        </Link>
        <span className="text-sm text-gray-500">Brand Health Analyzer</span>
      </nav>
    </header>
  )
}
