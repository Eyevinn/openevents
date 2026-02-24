import bcrypt from 'bcryptjs'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { requireRole } from '@/lib/auth'
import {
  cancelAccountDeletionForUser,
  requestAccountDeletion,
} from '@/lib/accountDeletion'
import { AccountSettings } from '@/components/dashboard/AccountSettings'

type PageProps = {
  searchParams: Promise<{ deletion?: string | string[] }>
}

type DeletionNotice = 'requested' | 'scheduled' | 'cancelled' | 'invalid' | 'expired' | null

function firstQueryValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0]
  }

  return value
}

function parseDeletionNotice(value: string | undefined): DeletionNotice {
  if (value === 'requested') return 'requested'
  if (value === 'scheduled') return 'scheduled'
  if (value === 'cancelled') return 'cancelled'
  if (value === 'invalid') return 'invalid'
  if (value === 'expired') return 'expired'
  return null
}

export default async function AccountSettingsPage({ searchParams }: PageProps) {
  const user = await requireRole('ORGANIZER')
  const query = await searchParams
  const deletionNotice = parseDeletionNotice(firstQueryValue(query.deletion))

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      email: true,
      passwordHash: true,
      deletionRequestedAt: true,
      deletionScheduledFor: true,
      accounts: {
        select: {
          provider: true,
        },
      },
    },
  })

  if (!dbUser) {
    redirect('/login')
  }

  async function updateEmailAction(formData: FormData) {
    'use server'

    const currentUser = await requireRole('ORGANIZER')
    const email = String(formData.get('email') || '').trim().toLowerCase()

    if (!email) return

    await prisma.user.update({
      where: { id: currentUser.id },
      data: { email },
    })

    revalidatePath('/dashboard/settings/account')
  }

  async function changePasswordAction(formData: FormData) {
    'use server'

    const currentUser = await requireRole('ORGANIZER')
    const currentPassword = String(formData.get('currentPassword') || '')
    const newPassword = String(formData.get('newPassword') || '')

    if (!currentPassword || !newPassword) return

    const currentDbUser = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: {
        id: true,
        passwordHash: true,
      },
    })

    if (!currentDbUser?.passwordHash) return

    const isValid = await bcrypt.compare(currentPassword, currentDbUser.passwordHash)
    if (!isValid) return

    const newHash = await bcrypt.hash(newPassword, 12)

    await prisma.user.update({
      where: { id: currentUser.id },
      data: { passwordHash: newHash },
    })

    revalidatePath('/dashboard/settings/account')
  }

  async function deleteAccountAction(formData: FormData) {
    'use server'
    void formData

    const currentUser = await requireRole('ORGANIZER')
    await requestAccountDeletion(currentUser.id)

    revalidatePath('/dashboard/settings/account')
  }

  async function cancelDeletionAction(formData: FormData) {
    'use server'
    void formData

    const currentUser = await requireRole('ORGANIZER')
    await cancelAccountDeletionForUser(currentUser.id)

    revalidatePath('/dashboard/settings/account')
  }

  return (
    <AccountSettings
      userEmail={dbUser.email}
      connectedAccounts={dbUser.accounts.map((account) => account.provider)}
      updateEmailAction={updateEmailAction}
      changePasswordAction={changePasswordAction}
      deleteAccountAction={deleteAccountAction}
      cancelDeletionAction={cancelDeletionAction}
      deletionRequestedAt={dbUser.deletionRequestedAt}
      deletionScheduledFor={dbUser.deletionScheduledFor}
      deletionNotice={deletionNotice}
    />
  )
}
