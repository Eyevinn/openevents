export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 text-gray-900">
          Privacy Policy
        </h1>
        <p className="text-gray-600 mb-8">Last updated: March 2026</p>

        <p className="text-gray-700 mb-8">
          OpenEvents is a ticketing platform operated by Eyevinn Technology AB
          ("Eyevinn", "we", "us", or "our"). This Privacy Policy describes how
          we collect, use, and protect your personal data when you use
          OpenEvents and purchase tickets to events.
        </p>

        <p className="text-gray-700 mb-12 font-semibold">
          We process personal data in accordance with the EU General Data
          Protection Regulation (GDPR).
        </p>

        {/* Section 1 */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            1. Data Controller
          </h2>
          <div className="bg-gray-50 p-4 rounded-lg text-gray-700 space-y-1">
            <p className="font-semibold">Eyevinn Technology AB</p>
            <p>556919-9952</p>
            <p>Vasagatan 52, 111 20 Stockholm, Sweden</p>
            <p>Email: [info@eyevinn.se]</p>
          </div>
        </section>

        {/* Section 2 */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            2. What Personal Data We Collect
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Information You Provide
              </h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Full name</li>
                <li>Email address</li>
                <li>Company name</li>
                <li>Billing details</li>
                <li>VAT number (if applicable)</li>
                <li>Ticket purchase information</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Payment Information
              </h3>
              <p className="text-gray-700">
                Payments are processed through third-party payment providers. We
                do not store full credit card details.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Technical Data
              </h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>IP address</li>
                <li>Browser type</li>
                <li>Device information</li>
                <li>Cookies and usage data</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 3 */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            3. Purpose and Legal Basis for Processing
          </h2>
          <div className="space-y-3">
            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <p className="font-semibold text-gray-900">
                To fulfill ticket purchases
              </p>
              <p className="text-gray-600 text-sm">
                Legal basis: Performance of contract (GDPR Art. 6(1)(b))
              </p>
            </div>
            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <p className="font-semibold text-gray-900">
                To send event-related information
              </p>
              <p className="text-gray-600 text-sm">
                Legal basis: Performance of contract
              </p>
            </div>
            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <p className="font-semibold text-gray-900">
                To send administrative communication
              </p>
              <p className="text-gray-600 text-sm">
                Legal basis: Legitimate interest
              </p>
            </div>
            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <p className="font-semibold text-gray-900">
                For accounting and bookkeeping
              </p>
              <p className="text-gray-600 text-sm">
                Legal basis: Legal obligation
              </p>
            </div>
          </div>
        </section>

        {/* Section 4 */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            4. Data Sharing
          </h2>
          <p className="text-gray-700 mb-4">We may share your data with:</p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
            <li>Payment providers</li>
            <li>Email delivery providers</li>
            <li>Accounting service providers</li>
          </ul>
          <p className="text-gray-700 mb-3">
            All third parties process data under appropriate data processing
            agreements.
          </p>
          <p className="font-semibold text-gray-900">
            We do not sell personal data.
          </p>
        </section>

        {/* Section 5 */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            5. Data Retention
          </h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>As long as necessary to fulfill the purpose</li>
            <li>As required by Swedish bookkeeping laws</li>
            <li>Until consent is withdrawn (where applicable)</li>
          </ul>
        </section>

        {/* Section 6 */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            6. International Transfers
          </h2>
          <p className="text-gray-700">
            If personal data is transferred outside the EU/EEA, we ensure
            appropriate safeguards such as Standard Contractual Clauses.
          </p>
        </section>

        {/* Section 7 */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            7. Your Rights Under GDPR
          </h2>
          <p className="text-gray-700 mb-4">You have the right to:</p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
            <li>Access your personal data</li>
            <li>Rectify inaccurate data</li>
            <li>Erase data (right to be forgotten)</li>
            <li>Restrict processing</li>
            <li>Data portability</li>
            <li>Object to processing</li>
            <li>Withdraw consent</li>
          </ul>
          <p className="text-gray-700 mb-3">
            To exercise your rights, contact: [privacy@eyevinn.se]
          </p>
          <p className="text-gray-700">
            You also have the right to file a complaint with the Swedish
            Authority for Privacy Protection (IMY).
          </p>
        </section>

        {/* Section 8 */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Cookies</h2>
          <p className="text-gray-700 mb-4">
            OpenEvents uses cookies necessary for:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
            <li>Site functionality</li>
            <li>Payment processing</li>
            <li>Basic analytics</li>
          </ul>
          <p className="text-gray-700">
            You can manage cookies in your browser settings.
          </p>
        </section>

        {/* Section 9 */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Security</h2>
          <p className="text-gray-700">
            We implement appropriate technical and organizational measures to
            protect personal data from unauthorized access, alteration, or loss.
          </p>
        </section>

        {/* Section 10 */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            10. Changes to This Policy
          </h2>
          <p className="text-gray-700">
            We may update this Privacy Policy from time to time. Updates will be
            published on this page.
          </p>
        </section>
      </div>
    </main>
  );
}
