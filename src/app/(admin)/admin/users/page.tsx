import { redirect } from 'next/navigation'

type SearchParams = Promise<Record<string, string | string[] | undefined>>

export default async function LegacyAdminUsersRedirectPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const params = await searchParams
  const query = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      for (const entry of value) {
        query.append(key, entry)
      }
    } else if (value) {
      query.set(key, value)
    }
  }

  const qs = query.toString()
  redirect(`/dashboard/admin/users${qs ? `?${qs}` : ''}`)
}
