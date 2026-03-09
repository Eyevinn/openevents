import { redirect } from 'next/navigation'
import { getCurrentUser, hasRole } from '@/lib/auth'
import { WorkspaceAccessDenied } from '@/components/layout/WorkspaceShell'

export default async function DashboardAdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  if (!hasRole(user.roles, 'SUPER_ADMIN')) {
    return <WorkspaceAccessDenied message="Super admin role is required to access this area." />
  }

  return children
}
