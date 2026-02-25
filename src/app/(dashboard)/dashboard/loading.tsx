export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="animate-pulse space-y-2">
          <div className="h-9 w-64 rounded-lg bg-gray-200" />
          <div className="h-5 w-48 rounded bg-gray-200" />
        </div>
      </div>

      {/* Stats grid — 6 cards, 3 cols on lg */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-xl border border-gray-200 bg-white p-5">
            <div className="h-4 w-24 rounded bg-gray-200" />
            <div className="mt-2 h-8 w-16 rounded bg-gray-200" />
          </div>
        ))}
      </div>

      {/* Two-column: upcoming events + recent orders */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Upcoming events card */}
        <div className="animate-pulse rounded-xl border border-gray-200 bg-white p-5">
          <div className="mb-4 h-6 w-36 rounded bg-gray-200" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-3">
                <div className="space-y-1.5">
                  <div className="h-4 w-40 rounded bg-gray-200" />
                  <div className="h-3 w-24 rounded bg-gray-200" />
                </div>
                <div className="h-5 w-16 rounded-full bg-gray-200" />
              </div>
            ))}
          </div>
        </div>

        {/* Recent orders card */}
        <div className="animate-pulse rounded-xl border border-gray-200 bg-white p-5">
          <div className="mb-4 h-6 w-28 rounded bg-gray-200" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between border-b border-gray-100 pb-2">
                <div className="space-y-1.5">
                  <div className="h-4 w-32 rounded bg-gray-200" />
                  <div className="h-3 w-20 rounded bg-gray-200" />
                </div>
                <div className="space-y-1.5 text-right">
                  <div className="h-4 w-16 rounded bg-gray-200" />
                  <div className="h-5 w-14 rounded-full bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
