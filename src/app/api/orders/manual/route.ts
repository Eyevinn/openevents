import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import {
  sendInvoiceOrderNotificationEmail,
  sendOrderConfirmationEmail,
  sendAttendeeTicketEmailsForOrder,
} from '@/lib/email'
import { createOrder } from '@/lib/orders/createOrder'
import { createOrderSchema } from '@/lib/validations'
import { formatDateTime } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()

    const body = await request.json()
    const parsed = createOrderSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const input = parsed.data

    // Verify the event exists and the caller has organizer access before
    // starting the transaction.
    const event = await prisma.event.findUnique({
      where: { id: input.eventId },
      select: {
        id: true,
        organizer: {
          select: {
            user: { select: { email: true } },
          },
        },
      },
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    const hasOrganizerRole =
      user.roles.includes('ORGANIZER') || user.roles.includes('SUPER_ADMIN')
    if (!hasOrganizerRole) {
      return NextResponse.json(
        { error: 'Only event organizers can create manual orders' },
        { status: 403 }
      )
    }

    const { order } = await createOrder(input, { isManualOrder: true })

    revalidateTag('event-analytics', 'max')
    revalidateTag('dashboard-analytics', 'max')

    if (order.status === 'PAID') {
      const eventLocation =
        order.event.locationType === 'ONLINE'
          ? order.event.onlineUrl || 'Online event'
          : [order.event.venue, order.event.city, order.event.country].filter(Boolean).join(', ')
      const eventDate = formatDateTime(order.event.startDate)
      const buyerName = `${order.buyerFirstName} ${order.buyerLastName}`

      await sendOrderConfirmationEmail(order.buyerEmail, {
        orderNumber: order.orderNumber,
        orderId: order.id,
        eventTitle: order.event.title,
        eventDate,
        eventLocation,
        tickets: order.items.map((item) => ({
          name: item.ticketType.name,
          quantity: item.quantity,
          price: `${item.totalPrice.toString()} ${order.currency}`,
        })),
        totalAmount: `${order.totalAmount.toString()} ${order.currency}`,
        buyerName,
        vatRate: parseFloat(order.vatRate.toString()),
        vatAmount: order.vatAmount.toString(),
        ticketCodes: order.tickets.map((t) => t.ticketCode),
      })

      await sendAttendeeTicketEmailsForOrder({
        orderNumber: order.orderNumber,
        buyerEmail: order.buyerEmail,
        buyerName,
        eventTitle: order.event.title,
        eventDate,
        eventLocation,
        tickets: order.tickets,
        items: order.items,
      })
    } else {
      // PENDING_INVOICE — notify the organizer
      const organizerEmail = order.event.organizer?.user?.email ?? event.organizer.user.email
      if (organizerEmail) {
        const discountLabel = order.groupDiscount
          ? `group ${order.groupDiscount.minQuantity}+, ${
              order.groupDiscount.discountType === 'PERCENTAGE'
                ? `${Number(order.groupDiscount.discountValue.toString())}%`
                : `${Number(order.groupDiscount.discountValue.toString())} ${order.currency}`
            } off`
          : order.discountCode
            ? `code ${order.discountCode.code}`
            : null
        await sendInvoiceOrderNotificationEmail(organizerEmail, {
          orderNumber: order.orderNumber,
          eventTitle: order.event.title,
          eventId: order.event.id,
          buyerName: `${order.buyerFirstName} ${order.buyerLastName}`,
          buyerEmail: order.buyerEmail,
          currency: order.currency,
          subtotal: Number(order.subtotal.toString()),
          discountAmount: Number(order.discountAmount.toString()),
          discountLabel,
          vatRate: order.vatRate ? parseFloat(order.vatRate.toString()) : null,
          vatAmount: order.vatAmount ? Number(order.vatAmount.toString()) : null,
          totalAmount: Number(order.totalAmount.toString()),
          tickets: order.items.map((item) => ({
            name: item.ticketType.name,
            quantity: item.quantity,
            unitPrice: Number(item.unitPrice.toString()),
            lineTotal: Number(item.totalPrice.toString()),
          })),
        })
      }
    }

    return NextResponse.json({
      order,
      message: 'Manual order created successfully',
    })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      if (error.message === 'Event not found') {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 })
      }

      if (
        error.message.includes('remaining capacity') ||
        error.message.includes('not found') ||
        error.message.includes('Discount code')
      ) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
    }

    console.error('Failed to create manual order:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
