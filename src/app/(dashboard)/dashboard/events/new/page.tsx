import { redirect } from 'next/navigation'
import { getCurrentUser, hasRole } from '@/lib/auth'
import { EventForm } from '@/components/events/EventForm'

export default async function NewEventPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  if (!hasRole(user.roles, 'ORGANIZER')) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
          Organizer role is required to create events.
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900">Create New Event</h1>
      <EventForm mode="create" />
    </div>
  )
}
