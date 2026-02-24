import { getLocale, getTranslations } from 'next-intl/server'

type AgendaItem = {
  id: string
  title: string
  description: string | null
  startTime: Date
  endTime: Date | null
  speaker: { name: string } | null
}

type EventAgendaProps = {
  items: AgendaItem[]
}

export async function EventAgenda({ items }: EventAgendaProps) {
  const locale = await getLocale()
  const t = await getTranslations('eventDetails')
  const timeFmt = new Intl.DateTimeFormat(locale, { timeStyle: 'short' })

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="text-xl font-semibold text-gray-900">{t('agendaTitle')}</h2>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-gray-600">{t('agendaEmpty')}</p>
      ) : (
        <ul className="mt-4 space-y-4">
          {items.map((item) => (
            <li key={item.id} className="rounded-lg border border-gray-100 bg-gray-50 p-4">
              <p className="text-sm text-gray-600">
                {timeFmt.format(new Date(item.startTime))}
                {item.endTime ? ` - ${timeFmt.format(new Date(item.endTime))}` : ''}
              </p>
              <h3 className="mt-1 text-base font-semibold text-gray-900">{item.title}</h3>
              {item.speaker ? <p className="text-sm text-blue-700">{item.speaker.name}</p> : null}
              {item.description ? <p className="mt-2 text-sm text-gray-700">{item.description}</p> : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
