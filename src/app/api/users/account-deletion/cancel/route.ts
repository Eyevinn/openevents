import { NextRequest, NextResponse } from 'next/server'
import { cancelAccountDeletionByToken } from '@/lib/accountDeletion'

function redirectWithStatus(request: NextRequest, status: string) {
  return NextResponse.redirect(
    new URL(`/dashboard/settings/account?deletion=${encodeURIComponent(status)}`, request.url)
  )
}

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token')

    if (!token) {
      return redirectWithStatus(request, 'invalid')
    }

    const cancelled = await cancelAccountDeletionByToken(token)

    if (!cancelled) {
      return redirectWithStatus(request, 'invalid')
    }

    return redirectWithStatus(request, 'cancelled')
  } catch (error) {
    console.error('Failed to cancel account deletion:', error)
    return redirectWithStatus(request, 'invalid')
  }
}
