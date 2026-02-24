import Link from 'next/link'
import { prisma } from '@/lib/db'
import { EventList } from '@/components/events/EventList'
import { HeroSearchBar } from '@/components/events/HeroSearchBar'
import { getTranslations } from 'next-intl/server'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const t = await getTranslations('home')

  const categories = await prisma.category.findMany({
    select: { id: true, name: true, slug: true },
    orderBy: { name: 'asc' },
  })

  const featuredEvents = await prisma.event.findMany({
    where: {
      status: 'PUBLISHED',
      visibility: 'PUBLIC',
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
    take: 6,
  })

  return (
    <div className="flex flex-col">
      <section className="px-4 pb-5 pt-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="relative w-full overflow-hidden rounded-tl-[20px] rounded-tr-[20px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/hero-image.jpg"
              alt={t('heroAlt')}
              className="h-[220px] w-full object-cover sm:h-[300px] md:h-[360px] lg:h-[420px]"
            />
            <div className="absolute left-6 top-[12%] rounded-[20px] border border-[rgba(255,255,255,0.31)] bg-[rgba(217,217,217,0.10)] px-6 py-4 backdrop-blur-[17.5px] sm:left-8 md:left-10">
              <h1
                className="text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl lg:text-[55px]"
                style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
              >
                {t('heroTitle')}
              </h1>
            </div>
          </div>
          <div className="mt-4">
            <HeroSearchBar categories={categories} />
          </div>
        </div>
      </section>

      <section className="bg-white pb-20 pt-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <h2
              className="text-[35px] font-bold leading-normal text-black"
              style={{ fontFamily: 'var(--font-outfit)' }}
            >
              {t('upcomingEvents')}
            </h2>
            <Link
              href="/events"
              className="inline-flex items-center justify-center rounded-[10px] bg-[#5c8bd9] px-[15px] py-[10px] text-[16px] font-semibold text-white transition-colors hover:bg-[#4a7ac8]"
              style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
            >
              {t('viewAllEvents')}
            </Link>
          </div>
          <EventList events={featuredEvents} />
        </div>
      </section>

      <section className="bg-white py-15">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              {t('featuresTitle')}
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              {t('featuresSubtitle')}
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="mt-6 text-lg font-semibold text-gray-900">
                {t('easyCreationTitle')}
              </h3>
              <p className="mt-2 text-gray-600">
                {t('easyCreationDescription')}
              </p>
            </div>

            <div className="p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </div>
              <h3 className="mt-6 text-lg font-semibold text-gray-900">
                {t('flexibleTicketingTitle')}
              </h3>
              <p className="mt-2 text-gray-600">
                {t('flexibleTicketingDescription')}
              </p>
            </div>

            <div className="p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="mt-6 text-lg font-semibold text-gray-900">
                {t('powerfulAnalyticsTitle')}
              </h3>
              <p className="mt-2 text-gray-600">
                {t('powerfulAnalyticsDescription')}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
