import Link from 'next/link'
import { prisma } from '@/lib/db'
import { EventList } from '@/components/events/EventList'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const now = new Date()

  const featuredEvents = await prisma.event.findMany({
    where: {
      status: 'PUBLISHED',
      visibility: 'PUBLIC',
      deletedAt: null,
      endDate: { gte: now },
    },
    include: {
      organizer: {
        select: {
          orgName: true,
        },
      },
      ticketTypes: {
        where: {
          isVisible: true,
        },
        select: {
          price: true,
          currency: true,
        },
      },
    },
    orderBy: [
      { publishedAt: 'desc' },
      { startDate: 'asc' },
    ],
    take: 12,
  })

  return (
    <div className="flex flex-col">
      <section className="px-4 pb-5 pt-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="relative w-full overflow-hidden rounded-[20px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/hero-image.jpg"
              alt="Events built for business"
              className="h-[220px] w-full object-cover sm:h-[300px] md:h-[360px] lg:h-[420px]"
            />
            <div className="absolute left-4 right-4 top-[10%] rounded-[20px] border border-[rgba(255,255,255,0.31)] bg-[rgba(217,217,217,0.10)] px-4 py-3 backdrop-blur-[17.5px] sm:left-8 sm:right-auto sm:px-6 sm:py-4 md:left-10">
              <h1
                className="text-2xl font-bold leading-tight text-white sm:text-4xl md:text-5xl lg:text-[55px]"
                style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
              >
                Events built for business
              </h1>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white pb-20 pt-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <h2
              className="text-3xl font-bold leading-normal text-black sm:text-[35px]"
              style={{ fontFamily: 'var(--font-outfit)' }}
            >
              Upcoming events
            </h2>
            <Link
              href="/events"
              className="inline-flex items-center justify-center rounded-[10px] bg-[#5c8bd9] px-[15px] py-[10px] text-[16px] font-semibold text-white transition-colors hover:bg-[#4a7ac8]"
              style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
            >
              View all events
            </Link>
          </div>
          <EventList events={featuredEvents} layout="showcase" />
        </div>
      </section>

    </div>
  )
}
