import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'
import { getCurrentUser, hasRole } from '@/lib/auth'
import { EventList } from '@/components/events/EventList'

export const dynamic = 'force-dynamic'

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function readParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0]
  return value
}

export default async function MyEventsPage({ searchParams }: PageProps) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  if (!hasRole(user.roles, 'ORGANIZER')) {
    redirect('/events')
  }

  const params = await searchParams
  const page = Math.max(Number(readParam(params.page) || '1'), 1)
  const pageSize = 9
  const where: Prisma.EventWhereInput = {
    organizer: {
      userId: user.id,
    },
  }

  const [events, total] = await prisma.$transaction([
    prisma.event.findMany({
      where,
      include: {
        organizer: {
          select: {
            orgName: true,
          },
        },
        ticketTypes: {
          where: { isVisible: true },
          select: {
            price: true,
            currency: true,
          },
        },
      },
      orderBy: [{ createdAt: 'desc' }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.event.count({ where }),
  ])

  const totalPages = Math.max(Math.ceil(total / pageSize), 1)

  const buildPageHref = (targetPage: number) => {
    const q = new URLSearchParams()
    q.set('page', String(targetPage))
    return `/my-events?${q.toString()}`
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">My Events</h1>
          <p className="mt-2 text-gray-600">View and manage events you created.</p>
        </div>
        <Link
          href="/create-event"
          className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Create Event
        </Link>
      </div>

      <EventList events={events} />

      <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4">
        <p className="text-sm text-gray-600">
          {`Page ${page} of ${totalPages}`}
        </p>
        <div className="flex gap-2">
          <Link
            href={buildPageHref(Math.max(1, page - 1))}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700"
          >
            Previous
          </Link>
          <Link
            href={buildPageHref(Math.min(totalPages, page + 1))}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700"
          >
            Next
          </Link>
        </div>
      </div>
    </div>
  )
}
