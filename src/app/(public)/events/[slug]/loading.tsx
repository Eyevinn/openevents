export default function EventDetailLoading() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-6 sm:px-6 lg:px-8">
      {/* Cover image */}
      <section className="animate-pulse overflow-hidden rounded-xl bg-gray-200">
        <div className="h-[230px] sm:h-[340px]" />
      </section>

      {/* Title + info + ticket card */}
      <section className="border-b border-gray-200 pb-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          {/* Left: title, organizer, location, date */}
          <div className="flex flex-1 animate-pulse flex-col gap-4">
            <div className="h-12 w-3/4 rounded-lg bg-gray-200" />
            <div className="h-7 w-48 rounded bg-gray-200" />
            <div className="flex items-start gap-4">
              <div className="mt-1 h-5 w-5 shrink-0 rounded bg-gray-200" />
              <div className="flex flex-col gap-1">
                <div className="h-5 w-48 rounded bg-gray-200" />
                <div className="h-5 w-64 rounded bg-gray-200" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-6 w-6 shrink-0 rounded bg-gray-200" />
              <div className="h-5 w-56 rounded bg-gray-200" />
            </div>
          </div>

          {/* Right: price card */}
          <div className="flex w-full animate-pulse flex-col gap-2 lg:w-[247px] lg:shrink-0">
            <div className="h-9 w-24 self-end rounded-full bg-gray-200" />
            <div className="h-9 w-32 rounded bg-gray-200" />
            <div className="h-5 w-28 rounded bg-gray-200" />
            <div className="h-5 w-28 rounded bg-gray-200" />
            <div className="mt-4 h-[60px] rounded-[14px] bg-gray-200" />
          </div>
        </div>
      </section>

      {/* Overview section */}
      <section className="border-b border-gray-200 pb-8">
        <div className="h-8 w-32 animate-pulse rounded-lg bg-gray-200" />
        <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_270px]">
          {/* Description lines */}
          <div className="animate-pulse space-y-3">
            <div className="h-5 w-full rounded bg-gray-200" />
            <div className="h-5 w-full rounded bg-gray-200" />
            <div className="h-5 w-5/6 rounded bg-gray-200" />
            <div className="h-5 w-4/5 rounded bg-gray-200" />
            <div className="h-5 w-full rounded bg-gray-200" />
            <div className="h-5 w-3/4 rounded bg-gray-200" />
          </div>
          {/* Map placeholder */}
          <div className="h-[230px] animate-pulse overflow-hidden rounded-xl bg-gray-200" />
        </div>
      </section>

      {/* Speakers section */}
      <section className="pb-8">
        <div className="h-8 w-24 animate-pulse rounded-lg bg-gray-200" />
        <div className="mt-6 flex flex-wrap gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex h-[104px] w-[302px] animate-pulse items-center gap-4 rounded-[14px] bg-gray-100 pl-4 pr-4"
            >
              <div className="h-16 w-16 shrink-0 rounded-full bg-gray-200" />
              <div className="flex flex-col gap-2">
                <div className="h-5 w-28 rounded bg-gray-200" />
                <div className="h-4 w-20 rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
