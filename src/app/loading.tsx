export default function HomeLoading() {
  return (
    <div className="flex flex-col">
      {/* Hero image + search bar */}
      <section className="px-4 pb-5 pt-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="animate-pulse overflow-hidden rounded-tl-[20px] rounded-tr-[20px] bg-gray-200">
            <div className="h-[220px] sm:h-[300px] md:h-[360px] lg:h-[420px]" />
          </div>
          {/* Search bar */}
          <div className="mt-4 animate-pulse rounded-xl border border-gray-200 bg-white p-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
              <div className="h-10 rounded-md bg-gray-200 sm:col-span-2" />
              <div className="h-10 rounded-md bg-gray-200" />
              <div className="h-10 rounded-md bg-gray-200" />
            </div>
          </div>
        </div>
      </section>

      {/* Featured events section */}
      <section className="bg-white pb-20 pt-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex animate-pulse flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="h-9 w-52 rounded-lg bg-gray-200" />
            <div className="h-10 w-32 rounded-[10px] bg-gray-200" />
          </div>

          {/* 6 event cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse overflow-hidden rounded-xl border border-gray-200 bg-white">
                <div className="h-44 bg-gray-200" />
                <div className="space-y-3 p-4">
                  <div className="h-4 w-16 rounded-full bg-gray-200" />
                  <div className="h-5 w-full rounded bg-gray-200" />
                  <div className="h-5 w-3/4 rounded bg-gray-200" />
                  <div className="flex gap-2">
                    <div className="h-4 w-24 rounded bg-gray-200" />
                    <div className="h-4 w-24 rounded bg-gray-200" />
                  </div>
                  <div className="h-5 w-20 rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="bg-white py-15">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse text-center">
            <div className="mx-auto h-9 w-64 rounded-lg bg-gray-200" />
            <div className="mx-auto mt-4 h-5 w-96 rounded bg-gray-200" />
          </div>
          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse p-6 text-center">
                <div className="mx-auto h-12 w-12 rounded-full bg-gray-200" />
                <div className="mx-auto mt-6 h-5 w-32 rounded bg-gray-200" />
                <div className="mx-auto mt-2 h-4 w-48 rounded bg-gray-200" />
                <div className="mx-auto mt-1 h-4 w-40 rounded bg-gray-200" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
