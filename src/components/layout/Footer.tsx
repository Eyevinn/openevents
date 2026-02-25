import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 text-gray-600 print:hidden">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-5">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              OpenEvents
            </Link>
            <p className="mt-4 text-sm text-gray-500">
              Organizing events starts here
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900">Features</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-gray-900">Core features</a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-900">Pro experience</a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-900">Integrations</a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900">Learn more</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-gray-900">Customer stories</a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-900">Best practices</a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              Support
            </h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-gray-900">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-900">
                  Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-200 pt-6" />
      </div>
    </footer>
  )
}
