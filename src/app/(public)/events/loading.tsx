export default function EventsLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      {/* Heading */}
      <div className="space-y-2">
        <div className="h-10 w-48 animate-pulse rounded-lg bg-gray-200" />
        <div className="h-5 w-64 animate-pulse rounded bg-gray-200" />
      </div>

      {/* Filters bar */}
      <div className="grid animate-pulse grid-cols-1 gap-3 rounded-xl border border-gray-200 bg-white p-4 md:grid-cols-4">
        <div className="h-10 rounded-md bg-gray-200 md:col-span-2" />
        <div className="h-10 rounded-md bg-gray-200" />
        <div className="h-10 rounded-md bg-gray-200" />
      </div>

      {/* Event cards grid — 9 cards matching the 3-col layout */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="animate-pulse overflow-hidden rounded-xl border border-gray-200 bg-white">
            {/* Image placeholder */}
            <div className="h-44 bg-gray-200" />
            <div className="space-y-3 p-4">
              {/* Category badge */}
              <div className="h-4 w-16 rounded-full bg-gray-200" />
              {/* Title */}
              <div className="h-5 w-full rounded bg-gray-200" />
              <div className="h-5 w-3/4 rounded bg-gray-200" />
              {/* Meta: date + location */}
              <div className="flex gap-2">
                <div className="h-4 w-24 rounded bg-gray-200" />
                <div className="h-4 w-24 rounded bg-gray-200" />
              </div>
              {/* Price */}
              <div className="h-5 w-20 rounded bg-gray-200" />
            </div>
          </div>
        ))}
      </div>

      {/* Pagination bar */}
      <div className="flex animate-pulse items-center justify-between rounded-xl border border-gray-200 bg-white p-4">
        <div className="h-4 w-32 rounded bg-gray-200" />
        <div className="flex gap-2">
          <div className="h-9 w-20 rounded-md bg-gray-200" />
          <div className="h-9 w-16 rounded-md bg-gray-200" />
        </div>
      </div>
    </div>
  )
}
