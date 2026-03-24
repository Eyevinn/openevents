'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'

type FooterProps = {
  platformName?: string
}

export function Footer({ platformName = 'OpenEvents' }: FooterProps) {
  const { status } = useSession()
  const showOrganizerLogin = status === 'unauthenticated'

  return (
    <footer className="border-t border-gray-200 bg-gray-50 text-gray-600 print:hidden">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 md:flex-row md:items-start md:justify-between">
          {/* Brand */}
          <div>
            <Link href="/" className="text-2xl font-bold text-gray-900">
              {platformName}
            </Link>
            <p className="mt-2 text-sm text-gray-500">
              Organizing events starts here
            </p>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm sm:gap-x-6">
            <Link href="/about" className="hover:text-gray-900 transition-colors">
              About Us
            </Link>
            <Link href="/contact" className="hover:text-gray-900 transition-colors">
              Contact Us
            </Link>
            <Link href="/privacy" className="hover:text-gray-900 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-gray-900 transition-colors">
              Terms of Service
            </Link>
          </nav>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-6">
          {showOrganizerLogin ? (
            <div className="flex justify-center md:justify-end">
              <Link
                href="/login"
                className="text-sm font-medium text-[#5C8BD9] hover:text-[#4a7ac8]"
              >
                Organizer Login
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </footer>
  )
}
