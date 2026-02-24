import { NextRequest, NextResponse } from 'next/server'
import { cleanupDueAccountDeletions } from '@/lib/accountDeletion'

function isAuthorized(request: NextRequest): boolean {
  const expectedToken = process.env.ACCOUNT_DELETION_CLEANUP_TOKEN
  if (!expectedToken) return true

  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice('Bearer '.length) === expectedToken
  }

  return request.headers.get('x-cleanup-token') === expectedToken
}

export async function POST(request: NextRequest) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const limitParam = request.nextUrl.searchParams.get('limit')
    const parsedLimit = limitParam ? Number.parseInt(limitParam, 10) : undefined

    const result = await cleanupDueAccountDeletions(parsedLimit)

    return NextResponse.json({
      ok: true,
      ...result,
    })
  } catch (error) {
    console.error('Failed to cleanup due account deletions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
