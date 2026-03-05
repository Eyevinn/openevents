import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 text-gray-600 print:hidden">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-8 md:flex-row md:justify-between">
          {/* Brand */}
          <div>
            <Link href="/" className="text-2xl font-bold text-gray-900">
              OpenEvents
            </Link>
            <p className="mt-2 text-sm text-gray-500">
              Organizing events starts here
            </p>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
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

        <div className="mt-10 border-t border-gray-200 pt-6" />
      </div>
    </footer>
  );
}
