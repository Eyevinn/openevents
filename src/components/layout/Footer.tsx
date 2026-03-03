import Link from "next/link";

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
                <Link
                  href="/info/core-features"
                  className="hover:text-gray-900"
                >
                  Core features
                </Link>
              </li>
              <li>
                <Link
                  href="/info/pro-experience"
                  className="hover:text-gray-900"
                >
                  Pro experience
                </Link>
              </li>
              <li>
                <Link href="/info/integrations" className="hover:text-gray-900">
                  Integrations
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900">Learn more</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link
                  href="/info/customer-stories"
                  className="hover:text-gray-900"
                >
                  Customer stories
                </Link>
              </li>
              <li>
                <Link
                  href="/info/best-practices"
                  className="hover:text-gray-900"
                >
                  Best practices
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Support</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:text-gray-900">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-gray-900">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-gray-900">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-gray-900">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-200 pt-6" />
      </div>
    </footer>
  );
}
