export default function MyTicketsLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 animate-pulse space-y-2">
        <div className="h-8 w-32 rounded-lg bg-gray-200" />
        <div className="h-4 w-56 rounded bg-gray-200" />
      </div>

      {/* Order cards — each has a cover image + card body */}
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse overflow-hidden rounded-lg border border-gray-200 bg-white">
            {/* Cover image */}
            <div className="h-44 w-full bg-gray-200" />
            {/* Card header */}
            <div className="space-y-2 px-6 pb-2 pt-4">
              <div className="h-6 w-2/3 rounded bg-gray-200" />
              <div className="h-4 w-36 rounded bg-gray-200" />
            </div>
            {/* Card content */}
            <div className="px-6 pb-5 pt-1">
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="h-4 w-28 rounded bg-gray-200" />
                <div className="h-4 w-36 rounded bg-gray-200" />
                <div className="h-4 w-24 rounded bg-gray-200" />
              </div>
              <div className="mt-3 flex gap-2">
                <div className="h-8 w-24 rounded-md bg-gray-200" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
