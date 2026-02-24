import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

export async function Footer() {
  const t = await getTranslations('footer')

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
              {t('tagline')}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900">{t('features.title')}</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-gray-900">{t('features.coreFeatures')}</a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-900">{t('features.proExperience')}</a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-900">{t('features.integrations')}</a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900">{t('learnMore.title')}</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-gray-900">{t('learnMore.customerStories')}</a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-900">{t('learnMore.bestPractices')}</a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              {t('support.title')}
            </h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-gray-900">
                  {t('support.contactUs')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-900">
                  {t('support.supportLink')}
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
