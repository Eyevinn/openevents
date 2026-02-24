import { EventStatus } from '@prisma/client'
import { isTicketAvailable } from '@/lib/utils'

export type CheckoutUnavailableReason =
  | 'EVENT_NOT_PUBLISHED'
  | 'EVENT_STARTED'
  | 'NO_PURCHASABLE_TICKETS'

export interface CheckoutAvailabilityTicketType {
  salesStartDate: Date | null
  salesEndDate: Date | null
  maxCapacity: number | null
  soldCount: number
  reservedCount: number
  isVisible?: boolean
}

export interface CheckoutAvailabilityEvent {
  status: EventStatus
  startDate: Date
  ticketTypes: CheckoutAvailabilityTicketType[]
}

export const CHECKOUT_UNAVAILABLE_NOTICE: Record<CheckoutUnavailableReason, string> = {
  EVENT_NOT_PUBLISHED: 'checkout-unavailable-event-status',
  EVENT_STARTED: 'checkout-unavailable-started',
  NO_PURCHASABLE_TICKETS: 'checkout-unavailable-no-tickets',
}

const ORDER_ERROR_BY_REASON: Record<CheckoutUnavailableReason, string> = {
  EVENT_NOT_PUBLISHED: 'Event is not open for ticket sales',
  EVENT_STARTED: 'Event has already started',
  NO_PURCHASABLE_TICKETS: 'No tickets are currently available for this event',
}

export function getCheckoutUnavailableReason(
  event: CheckoutAvailabilityEvent,
  now: Date = new Date()
): CheckoutUnavailableReason | null {
  if (event.status !== 'PUBLISHED') {
    return 'EVENT_NOT_PUBLISHED'
  }

  if (event.startDate <= now) {
    return 'EVENT_STARTED'
  }

  const hasPurchasableTicketType = event.ticketTypes
    .filter((ticketType) => ticketType.isVisible ?? true)
    .some((ticketType) =>
      isTicketAvailable(
        ticketType.salesStartDate,
        ticketType.salesEndDate,
        ticketType.maxCapacity,
        ticketType.soldCount,
        ticketType.reservedCount
      )
    )

  if (!hasPurchasableTicketType) {
    return 'NO_PURCHASABLE_TICKETS'
  }

  return null
}

export function getCheckoutUnavailableNotice(reason: CheckoutUnavailableReason): string {
  return CHECKOUT_UNAVAILABLE_NOTICE[reason]
}

export function getOrderErrorForCheckoutUnavailableReason(reason: CheckoutUnavailableReason): string {
  return ORDER_ERROR_BY_REASON[reason]
}
