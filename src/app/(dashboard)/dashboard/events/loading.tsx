export default function DashboardEventsLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="animate-pulse space-y-2">
          <div className="h-9 w-24 rounded-lg bg-gray-200" />
          <div className="h-5 w-56 rounded bg-gray-200" />
        </div>
        <div className="h-9 w-28 animate-pulse rounded-md bg-gray-200" />
      </div>

      {/* Filter form */}
      <div className="animate-pulse grid grid-cols-1 gap-3 rounded-xl border border-gray-200 bg-white p-4 md:grid-cols-4">
        <div className="h-10 rounded-md bg-gray-200 md:col-span-2" />
        <div className="h-10 rounded-md bg-gray-200" />
        <div className="h-10 rounded-md bg-gray-200" />
      </div>

      {/* Events table */}
      <div className="animate-pulse overflow-hidden rounded-xl border border-gray-200 bg-white">
        {/* Table header */}
        <div className="grid grid-cols-5 gap-4 border-b border-gray-200 bg-gray-50 px-4 py-3">
          {['w-16', 'w-32', 'w-20', 'w-20', 'w-16'].map((w, i) => (
            <div key={i} className={`h-4 rounded bg-gray-200 ${w}`} />
          ))}
        </div>
        {/* Table rows */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-5 items-center gap-4 border-b border-gray-100 px-4 py-4 last:border-0"
          >
            <div className="h-5 w-40 rounded bg-gray-200" />
            <div className="h-4 w-28 rounded bg-gray-200" />
            <div className="h-5 w-16 rounded-full bg-gray-200" />
            <div className="h-4 w-10 rounded bg-gray-200" />
            <div className="flex gap-2">
              <div className="h-7 w-12 rounded bg-gray-200" />
              <div className="h-7 w-12 rounded bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
