import Link from 'next/link'
import { EventStatus } from '@prisma/client'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EventStatusBadge } from '@/components/dashboard/EventStatusBadge'
import { SalesChart } from '@/components/dashboard/SalesChart'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { getTranslations } from 'next-intl/server'

type EventDashboardProps = {
  event: {
    id: string
    slug: string
    title: string
    status: EventStatus
    startDate: Date
    endDate: Date
    createdAt: Date
    _count: {
      orders: number
      ticketTypes: number
    }
  }
  stats: {
    totalRevenue: number
    totalOrders: number
    paidOrders: number
    pendingInvoiceOrders: number
    cancelledOrders: number
    refundedOrders: number
    ticketsByType: Array<{
      name: string
      revenue: number
      sold: number
      remaining: number | null
    }>
  }
}

export async function EventDashboard({ event, stats }: EventDashboardProps) {
  const t = await getTranslations('dashboard.eventDashboard')

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
            <div className="mt-2 flex items-center gap-2">
              <EventStatusBadge status={event.status} />
              <span className="text-sm text-gray-500">{t('createdDate', { date: formatDateTime(event.createdAt) })}</span>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              {formatDateTime(event.startDate)} - {formatDateTime(event.endDate)}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link href={`/dashboard/events/${event.id}/edit`}>
              <Button variant="outline">{t('editEvent')}</Button>
            </Link>
            <Link href={`/dashboard/events/${event.id}/tickets`}>
              <Button variant="outline">{t('manageTickets')}</Button>
            </Link>
            <Link href={`/dashboard/events/${event.id}/discounts`}>
              <Button variant="outline">{t('manageDiscounts')}</Button>
            </Link>
            <Link href={`/dashboard/events/${event.id}/orders`}>
              <Button variant="outline">{t('viewOrders')}</Button>
            </Link>
            <Link href={`/dashboard/events/${event.id}/scan`}>
              <Button variant="outline">{t('scanTickets')}</Button>
            </Link>
            <a href={`/api/dashboard/events/${event.id}/attendees/export`} download>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                {t('exportCsv')}
              </Button>
            </a>
            <a href={`/api/dashboard/events/${event.id}/attendees/export-excel`} download>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                {t('exportExcel')}
              </Button>
            </a>
            <Link href={`/events/${event.slug}`}>
              <Button>{t('openPublicPage')}</Button>
            </Link>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">{t('revenue')}</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">{t('orders')}</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">{stats.totalOrders}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">{t('ticketTypes')}</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">{event._count.ticketTypes}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SalesChart
          title={t('revenueByTicketType')}
          data={stats.ticketsByType.map((item) => ({ label: item.name, value: item.revenue }))}
        />

        <section className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-gray-900">{t('orderSummaryTitle')}</h3>
          <ul className="mt-4 space-y-2 text-sm text-gray-700">
            <li>{t('paid', { count: stats.paidOrders })}</li>
            <li>{t('pendingInvoice', { count: stats.pendingInvoiceOrders })}</li>
            <li>{t('cancelled', { count: stats.cancelledOrders })}</li>
            <li>{t('refunded', { count: stats.refundedOrders })}</li>
            <li>{t('totalOrders', { count: event._count.orders })}</li>
          </ul>
        </section>
      </div>
    </div>
  )
}
