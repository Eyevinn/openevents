import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'

const locales = ['en', 'sv']

export default getRequestConfig(async ({ requestLocale }) => {
  const routingLocale = await requestLocale
  const cookieStore = await cookies()
  const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value

  const locale =
    (locales.includes(routingLocale ?? '') ? routingLocale : null) ??
    (locales.includes(cookieLocale ?? '') ? cookieLocale : null) ??
    'en'

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  }
})
