import { NextRequest, NextResponse } from 'next/server'
import { confirmAccountDeletionByToken } from '@/lib/accountDeletion'

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

    const result = await confirmAccountDeletionByToken(token)

    if (result.status === 'scheduled') {
      return redirectWithStatus(request, 'scheduled')
    }

    if (result.status === 'expired') {
      return redirectWithStatus(request, 'expired')
    }

    return redirectWithStatus(request, 'invalid')
  } catch (error) {
    console.error('Failed to confirm account deletion:', error)
    return redirectWithStatus(request, 'invalid')
  }
}
