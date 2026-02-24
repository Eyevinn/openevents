import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { getCurrentUser, hasRole } from '@/lib/auth'
import { EventForm } from '@/components/events/EventForm'

export const dynamic = 'force-dynamic'

export default async function CreateEventPage() {
  const t = await getTranslations('createEvent')
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  if (!hasRole(user.roles, 'ORGANIZER')) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
          <h1 className="text-2xl font-semibold text-amber-900">{t('accessRequired')}</h1>
          <p className="mt-2 text-sm text-amber-800">
            {t('accessDescription')}
          </p>
          <div className="mt-5">
            <Link
              href="/dashboard"
              className="inline-flex items-center rounded-md border border-amber-300 bg-white px-4 py-2 text-sm font-medium text-amber-900"
            >
              {t('goToDashboard')}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <EventForm mode="create" />
    </div>
  )
}
