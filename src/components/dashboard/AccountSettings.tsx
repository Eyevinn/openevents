import { getTranslations } from 'next-intl/server'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type DeletionNotice = 'requested' | 'scheduled' | 'cancelled' | 'invalid' | 'expired' | null

type AccountSettingsProps = {
  userEmail: string
  connectedAccounts: string[]
  updateEmailAction: (formData: FormData) => Promise<void>
  changePasswordAction: (formData: FormData) => Promise<void>
  deleteAccountAction: (formData: FormData) => Promise<void>
  cancelDeletionAction: (formData: FormData) => Promise<void>
  deletionRequestedAt: Date | null
  deletionScheduledFor: Date | null
  deletionNotice: DeletionNotice
}

export async function AccountSettings({
  userEmail,
  connectedAccounts,
  updateEmailAction,
  changePasswordAction,
  deleteAccountAction,
  cancelDeletionAction,
  deletionRequestedAt,
  deletionScheduledFor,
  deletionNotice,
}: AccountSettingsProps) {
  const t = await getTranslations('dashboard.account')

  const hasPendingConfirmation = Boolean(deletionRequestedAt) && !deletionScheduledFor
  const hasScheduledDeletion = Boolean(deletionScheduledFor)
  const scheduledForLabel = deletionScheduledFor
    ? new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }).format(deletionScheduledFor)
    : null

  const noticeMessage =
    deletionNotice === 'requested'
      ? t('deleteAccountRequestedNotice')
      : deletionNotice === 'scheduled'
        ? t('deleteAccountScheduledNotice')
        : deletionNotice === 'cancelled'
          ? t('deleteAccountCancelledNotice')
          : deletionNotice === 'expired'
            ? t('deleteAccountExpiredNotice')
            : deletionNotice === 'invalid'
              ? t('deleteAccountInvalidNotice')
              : null

  return (
    <div className="space-y-6">
      {noticeMessage ? (
        <section className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
          {noticeMessage}
        </section>
      ) : null}

      <form action={updateEmailAction} className="space-y-4 rounded-xl border border-gray-200 bg-white p-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
        <div>
          <Label htmlFor="email" required>{t('emailLabel')}</Label>
          <Input id="email" name="email" type="email" defaultValue={userEmail} required />
        </div>
        <Button type="submit">{t('updateEmailButton')}</Button>
      </form>

      <form action={changePasswordAction} className="space-y-4 rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">{t('changePasswordTitle')}</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <Label htmlFor="currentPassword" required>{t('currentPasswordLabel')}</Label>
            <Input id="currentPassword" name="currentPassword" type="password" required />
          </div>
          <div>
            <Label htmlFor="newPassword" required>{t('newPasswordLabel')}</Label>
            <Input id="newPassword" name="newPassword" type="password" required />
          </div>
        </div>
        <Button type="submit">{t('changePasswordButton')}</Button>
      </form>

      <section className="space-y-4 rounded-xl border border-red-200 bg-red-50 p-6">
        <h2 className="text-lg font-semibold text-red-900">{t('deleteAccountTitle')}</h2>

        {hasScheduledDeletion ? (
          <>
            <p className="text-sm text-red-800">
              {t('deleteAccountScheduledDescription', { date: scheduledForLabel || '' })}
            </p>
            <form action={cancelDeletionAction}>
              <Button type="submit" variant="outline">{t('cancelDeletionButton')}</Button>
            </form>
          </>
        ) : (
          <>
            <p className="text-sm text-red-800">{t('deleteAccountDescription')}</p>
            {hasPendingConfirmation ? (
              <p className="text-sm text-red-800">{t('deleteAccountPendingConfirmation')}</p>
            ) : null}
            <form action={deleteAccountAction}>
              <Button type="submit" variant="destructive">
                {hasPendingConfirmation
                  ? t('resendDeletionConfirmationButton')
                  : t('deleteAccountButton')}
              </Button>
            </form>
          </>
        )}
      </section>

      <section className="space-y-3 rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">{t('connectedAccountsTitle')}</h2>
        {connectedAccounts.length === 0 ? (
          <p className="text-sm text-gray-600">{t('noConnectedAccounts')}</p>
        ) : (
          <ul className="list-disc pl-5 text-sm text-gray-700">
            {connectedAccounts.map((provider) => (
              <li key={provider}>{provider}</li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
