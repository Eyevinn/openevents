import { LocationType } from '@prisma/client'
import { getLocale, getTranslations } from 'next-intl/server'

type EventInfoProps = {
  startDate: Date
  endDate: Date
  timezone: string
  locationType: LocationType
  venue: string | null
  address: string | null
  city: string | null
  state: string | null
  country: string | null
  onlineUrl: string | null
}

export async function EventInfo({
  startDate,
  endDate,
  timezone,
  locationType,
  venue,
  address,
  city,
  state,
  country,
  onlineUrl,
}: EventInfoProps) {
  const locale = await getLocale()
  const t = await getTranslations('eventDetails')

  const fmt = new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' })

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="text-xl font-semibold text-gray-900">{t('eventInfoTitle')}</h2>
      <div className="mt-4 space-y-3 text-sm text-gray-700">
        <p>
          <span className="font-semibold">{t('starts')}:</span>{' '}
          {fmt.format(new Date(startDate))} ({timezone})
        </p>
        <p>
          <span className="font-semibold">{t('ends')}:</span>{' '}
          {fmt.format(new Date(endDate))} ({timezone})
        </p>
        <p>
          <span className="font-semibold">{t('typeLabel')}:</span> {locationType}
        </p>
        {locationType !== 'ONLINE' ? (
          <p>
            <span className="font-semibold">{t('locationLabel')}:</span>{' '}
            {[venue, address, city, state, country].filter(Boolean).join(', ') || t('tbd')}
          </p>
        ) : null}
        {(locationType === 'ONLINE' || locationType === 'HYBRID') && onlineUrl ? (
          <p>
            <span className="font-semibold">{t('onlineUrlLabel')}:</span>{' '}
            <a href={onlineUrl} className="text-blue-600 underline" target="_blank" rel="noreferrer">
              {t('joinEvent')}
            </a>
          </p>
        ) : null}
      </div>
    </div>
  )
}
