import { getTranslations } from 'next-intl/server'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type AccountSettingsProps = {
  userEmail: string
  connectedAccounts: string[]
  updateEmailAction: (formData: FormData) => Promise<void>
  changePasswordAction: (formData: FormData) => Promise<void>
  deleteAccountAction: (formData: FormData) => Promise<void>
}

export async function AccountSettings({ userEmail, connectedAccounts, updateEmailAction, changePasswordAction, deleteAccountAction }: AccountSettingsProps) {
  const t = await getTranslations('dashboard.account')

  return (
    <div className="space-y-6">
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

      <form action={deleteAccountAction} className="space-y-4 rounded-xl border border-red-200 bg-red-50 p-6">
        <h2 className="text-lg font-semibold text-red-900">{t('deleteAccountTitle')}</h2>
        <p className="text-sm text-red-800">{t('deleteAccountDescription')}</p>
        <input type="hidden" name="confirm" value="true" />
        <Button type="submit" variant="destructive">{t('deleteAccountButton')}</Button>
      </form>

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
