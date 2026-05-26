import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { getSession } from '@/lib/auth'
import {
  sendOrderConfirmationEmail,
  sendInvoiceOrderNotificationEmail,
  sendAttendeeTicketEmailsForOrder,
} from '@/lib/email'
import { createOrder } from '@/lib/orders/createOrder'
import { getOrderReservationTtlMinutes } from '@/lib/orders/reservation'
import { createOrderSchema } from '@/lib/validations'
import { formatDateTime } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const reservationTtlMinutes = getOrderReservationTtlMinutes(
      process.env.ORDER_RESERVATION_TTL_MINUTES ??
        process.env.NEXT_PUBLIC_ORDER_RESERVATION_TTL_MINUTES
    )

    // Get session optionally — allow both authenticated and anonymous orders
    const session = await getSession()
    const user = session?.user || null

    const body = await request.json()

    // Reject attempts to stack multiple discount codes
    if (body.discountCodes && Array.isArray(body.discountCodes)) {
      return NextResponse.json(
        { error: 'Only one discount code can be applied per order' },
        { status: 422 }
      )
    }

    const parsed = createOrderSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const input = parsed.data

    const buyerEmail = input.buyer.email?.trim()
    if (!buyerEmail) {
      return NextResponse.json(
        { error: 'Buyer email is required to place an order' },
        { status: 400 }
      )
    }

    const { order, promoCodeWarning } = await createOrder(input, { userId: user?.id })

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
    }

    if (order.status === 'PENDING_INVOICE') {
      const organizerEmail = order.event.organizer?.user?.email
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
      checkout: {
        requiresPayment: order.status === 'PENDING',
        isInvoiceFlow: order.status === 'PENDING_INVOICE',
        isFreeOrder: order.status === 'PAID' && order.paymentMethod === 'FREE',
        reservationTtlMinutes,
        reservationExpiresAt: order.expiresAt?.toISOString() ?? null,
      },
      message:
        order.status === 'PAID'
          ? 'Order created and completed successfully'
          : 'Order created successfully',
      ...(promoCodeWarning && { warning: promoCodeWarning }),
    })
  } catch (error) {
    if (error instanceof Error) {
      const handledErrors = new Set([
        'Unauthorized',
        'Event not found',
        'Event is not open for ticket sales',
        'Event has already started',
        'No tickets are currently available for this event',
        'One or more ticket types were not found for this event',
        'Discount code not found',
        'Discount code is inactive, expired, or fully used',
        'Discount code has no remaining uses for this quantity of tickets.',
        'Discount code does not apply to selected ticket types',
        'Only one discount code can be applied per order',
      ])

      if (error.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      if (error.message === 'Event not found') {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 })
      }

      if (
        handledErrors.has(error.message) ||
        error.message.includes('remaining capacity') ||
        error.message.includes('ticket(s) of the applicable type')
      ) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      if (
        error.message.includes('Minimum quantity') ||
        error.message.includes('Maximum quantity')
      ) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
    }

    console.error('Failed to create order:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
