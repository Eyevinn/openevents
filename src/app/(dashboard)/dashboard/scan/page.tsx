import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/db'
import { requireOrganizerProfile } from '@/lib/dashboard/organizer'
import { EventStatusBadge } from '@/components/dashboard/EventStatusBadge'
import { formatDateTime } from '@/lib/utils'

export default async function DashboardScanPage() {
  const t = await getTranslations('dashboard.scan')
  const { organizerProfile } = await requireOrganizerProfile()

  const events = await prisma.event.findMany({
    where: {
      organizerId: organizerProfile.id,
    },
    select: {
      id: true,
      title: true,
      status: true,
      startDate: true,
      _count: {
        select: {
          orders: true,
        },
      },
    },
    orderBy: [
      { startDate: 'asc' },
      { createdAt: 'desc' },
    ],
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
        <p className="text-gray-600">{t('subtitle')}</p>
      </div>

      {events.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-600">
          {t('noEvents')}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {events.map((event) => (
            <div key={event.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-lg font-semibold text-gray-900">{event.title}</h2>
                <EventStatusBadge status={event.status} />
              </div>
              <p className="mt-2 text-sm text-gray-600">{formatDateTime(event.startDate)}</p>
              <p className="mt-1 text-xs text-gray-500">{t('orders', { count: event._count.orders })}</p>
              <div className="mt-4 flex items-center gap-2">
                <Link
                  href={`/dashboard/events/${event.id}/scan`}
                  className="inline-flex rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  {t('openScanner')}
                </Link>
                <Link
                  href={`/dashboard/events/${event.id}`}
                  className="inline-flex rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  {t('viewEvent')}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
