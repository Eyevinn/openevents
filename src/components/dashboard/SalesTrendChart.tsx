import { formatCurrency } from '@/lib/utils'

type SalesTrendChartProps = {
  title: string
  noDataText: string
  data: Array<{ date: string; revenue: number }>
  currency?: string
}

function shortDate(iso: string): string {
  const parts = iso.split('-')
  if (parts.length < 3) return iso
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[parseInt(parts[1], 10) - 1]} ${parseInt(parts[2], 10)}`
}

export function SalesTrendChart({
  title,
  noDataText,
  data,
  currency = 'SEK',
}: SalesTrendChartProps) {
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1)
  const hasData = data.some((d) => d.revenue > 0)
  const periodTotal = data.reduce((s, d) => s + d.revenue, 0)

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {hasData && (
          <span className="shrink-0 text-sm font-medium text-gray-700">
            {formatCurrency(periodTotal, currency)}
          </span>
        )}
      </div>

      {!hasData ? (
        <p className="mt-3 text-sm text-gray-500">{noDataText}</p>
      ) : (
        <div className="mt-4">
          {/* Bars */}
          <div className="flex items-end gap-px h-28 sm:h-36">
            {data.map(({ date, revenue }) => (
              <div key={date} className="flex-1 min-w-0 flex flex-col justify-end">
                <div
                  className="w-full rounded-t-sm bg-blue-500 hover:bg-blue-600 transition-colors cursor-default"
                  style={{
                    height:
                      revenue > 0
                        ? `${Math.max((revenue / maxRevenue) * 100, 6)}%`
                        : '2px',
                    backgroundColor: revenue > 0 ? undefined : '#f3f4f6',
                  }}
                  title={`${shortDate(date)}: ${formatCurrency(revenue, currency)}`}
                />
              </div>
            ))}
          </div>

          {/* Date labels: first and last */}
          {data.length > 0 && (
            <div className="flex justify-between mt-2">
              <span className="text-xs text-gray-400">{shortDate(data[0].date)}</span>
              <span className="text-xs text-gray-400">
                {shortDate(data[data.length - 1].date)}
              </span>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
