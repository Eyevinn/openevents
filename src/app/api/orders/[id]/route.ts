import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { canAccessOrder } from '@/lib/orders/authorization'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id: orderId } = await context.params
    const user = await requireAuth()

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        event: {
          select: {
            id: true,
            slug: true,
            title: true,
            startDate: true,
            endDate: true,
            organizer: {
              select: {
                userId: true,
              },
            },
          },
        },
        items: {
          include: {
            ticketType: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        tickets: true,
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const authorized = canAccessOrder({
      orderUserId: order.userId,
      organizerUserId: order.event.organizer.userId,
      requesterUserId: user.id,
      requesterRoles: user.roles,
    })

    if (!authorized) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ order })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.error('Failed to fetch order:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
