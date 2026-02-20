import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Heart, MapPin } from 'lucide-react'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: Promise<{ slug: string }>
}

export default async function EventDetailsPage({ params }: PageProps) {
  const { slug } = await params

  const event = await prisma.event.findUnique({
    where: { slug },
    include: {
      organizer: {
        select: {
          orgName: true,
          description: true,
          website: true,
        },
      },
      ticketTypes: {
        where: { isVisible: true },
        orderBy: { sortOrder: 'asc' },
      },
    },
  })

  if (!event || event.status !== 'PUBLISHED') {
    notFound()
  }

  const locationText = [event.venue, event.address, event.city, event.state, event.country]
    .filter(Boolean)
    .join(', ')

  const mapQuery = encodeURIComponent(locationText || event.title)
  const mapEmbedUrl = `https://www.google.com/maps?q=${mapQuery}&output=embed`

  const minPrice = event.ticketTypes.length
    ? Math.min(...event.ticketTypes.map((ticket) => Number(ticket.price)))
    : null
  const currency = event.ticketTypes[0]?.currency || 'EUR'

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-2xl bg-gray-900">
        {event.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.coverImage}
            alt={event.title}
            className="h-[260px] w-full object-cover sm:h-[380px]"
          />
        ) : (
          <div className="h-[260px] bg-gradient-to-r from-slate-700 to-slate-900 sm:h-[380px]" />
        )}
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 pb-5">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-gray-900">{event.title}</h1>
            <p className="mt-1 text-lg text-gray-600">By {event.organizer.orgName}</p>
          </div>
          <button
            type="button"
            className="rounded-full border border-gray-300 p-2 text-gray-700 transition hover:bg-gray-50"
            aria-label="Save event"
          >
            <Heart className="h-6 w-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 pt-5 md:grid-cols-[1fr_auto] md:items-center">
          <div className="space-y-2">
            {event.locationType !== 'ONLINE' ? (
              <p className="flex items-start gap-2 text-gray-700">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{locationText || 'Location TBD'}</span>
              </p>
            ) : (
              <p className="text-gray-700">Online event</p>
            )}
            <p className="text-gray-700">
              {new Date(event.startDate).toLocaleDateString(undefined, {
                month: 'long',
                day: 'numeric',
              })}{' '}
              at{' '}
              {new Date(event.startDate).toLocaleTimeString(undefined, {
                hour: 'numeric',
                minute: '2-digit',
              })}{' '}
              GMT+1
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 p-4">
            <p className="text-lg font-medium text-gray-900">
              {minPrice === null ? 'Free / unavailable' : `From ${currency} ${minPrice.toFixed(0)}`}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(event.startDate).toLocaleDateString(undefined, {
                month: 'long',
                day: 'numeric',
              })}{' '}
              at{' '}
              {new Date(event.startDate).toLocaleTimeString(undefined, {
                hour: 'numeric',
                minute: '2-digit',
              })}{' '}
              GMT+1
            </p>
            <Link
              href={`/events/${event.slug}/checkout`}
              className="mt-3 inline-flex rounded-md bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600"
            >
              Get tickets
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="text-5xl font-semibold tracking-tight text-gray-900">Overview</h2>
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
          <div className="text-lg leading-8 text-gray-800">
            {event.descriptionHtml ? (
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: event.descriptionHtml }} />
            ) : (
              <p>{event.description || 'Event details will be announced soon.'}</p>
            )}
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200">
            {event.locationType === 'ONLINE' ? (
              <div className="flex h-[230px] items-center justify-center bg-gray-50 p-4 text-center text-sm text-gray-500">
                Online event map preview not required.
              </div>
            ) : (
              <iframe
                title="Event location map"
                src={mapEmbedUrl}
                className="h-[230px] w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            )}
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl bg-gray-900">
        {event.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.coverImage}
            alt={`${event.title} visual`}
            className="h-[220px] w-full object-cover sm:h-[360px]"
          />
        ) : (
          <div className="h-[220px] bg-gradient-to-r from-cyan-700 via-indigo-700 to-sky-700 sm:h-[360px]" />
        )}
      </section>
    </div>
  )
}
