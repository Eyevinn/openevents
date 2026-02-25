import { OrderStatus } from '@prisma/client'
import { prisma } from '@/lib/db'
import { requireOrganizerProfile } from '@/lib/dashboard/organizer'
import { DashboardStats } from '@/components/dashboard/DashboardStats'
import { UpcomingEvents } from '@/components/dashboard/UpcomingEvents'
import { RecentOrders } from '@/components/dashboard/RecentOrders'
import { SalesChart } from '@/components/dashboard/SalesChart'
import { SalesTrendChart } from '@/components/dashboard/SalesTrendChart'
import { getDashboardAnalytics } from '@/lib/analytics/dashboard-analytics'

const revenueStatuses: OrderStatus[] = ['PAID', 'PENDING_INVOICE']

export default async function DashboardHomePage() {
  const { organizerProfile } = await requireOrganizerProfile()

  const now = new Date()

  // Run cached analytics and live dashboard data in parallel
  const [analytics, [eventsByStatus, ticketAgg, revenueAgg, upcomingEvents, recentOrders]] =
    await Promise.all([
      getDashboardAnalytics(organizerProfile.id),
      prisma.$transaction([
        prisma.event.findMany({
          where: { organizerId: organizerProfile.id },
          select: { status: true },
        }),
        prisma.ticketType.aggregate({
          where: { event: { organizerId: organizerProfile.id } },
          _sum: { soldCount: true },
        }),
        prisma.order.aggregate({
          where: {
            event: { organizerId: organizerProfile.id },
            status: { in: revenueStatuses },
          },
          _sum: { totalAmount: true },
        }),
        prisma.event.findMany({
          where: {
            organizerId: organizerProfile.id,
            startDate: { gte: now },
          },
          select: { id: true, slug: true, title: true, startDate: true, status: true },
          orderBy: { startDate: 'asc' },
          take: 6,
        }),
        prisma.order.findMany({
          where: { event: { organizerId: organizerProfile.id } },
          select: {
            id: true,
            orderNumber: true,
            status: true,
            totalAmount: true,
            currency: true,
            buyerEmail: true,
            createdAt: true,
            event: { select: { id: true, title: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 8,
        }),
      ]),
    ])

  const statusCounts = eventsByStatus.reduce<Record<string, number>>((acc, row) => {
    acc[row.status] = (acc[row.status] ?? 0) + 1
    return acc
  }, {})

  const stats = {
    totalEvents: Object.values(statusCounts).reduce((sum, count) => sum + count, 0),
    publishedEvents: statusCounts.PUBLISHED ?? 0,
    draftEvents: statusCounts.DRAFT ?? 0,
    upcomingEvents: upcomingEvents.length,
    totalTicketsSold: ticketAgg._sum.soldCount ?? 0,
    totalRevenue: Number(revenueAgg._sum.totalAmount?.toString() ?? '0'),
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {`Welcome, ${organizerProfile.orgName}`}
          </h1>
          <p className="text-gray-600">Overview of your events, orders, and revenue.</p>
        </div>
      </div>

      <DashboardStats stats={stats} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <UpcomingEvents events={upcomingEvents} />
        <RecentOrders
          orders={recentOrders.map((order) => ({
            ...order,
            totalAmount: Number(order.totalAmount.toString()),
          }))}
        />
      </div>

      {/* Analytics section */}
      <div>
        <h2 className="mb-4 text-xl font-semibold text-gray-900">Analytics</h2>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <SalesChart
            title="Top Events by Revenue"
            data={analytics.topEvents.map((e) => ({ label: e.title, value: e.revenue }))}
          />
          <SalesTrendChart
            title="Sales Trend – Last 30 Days"
            noDataText="No data yet."
            data={analytics.dailySales}
          />
        </div>
      </div>
    </div>
  )
}
