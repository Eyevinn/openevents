import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'
import { lockTicketTypes, prepareOrderItems, generateTicketCreateInput } from '@/lib/orders'
import { claimDiscountCodeUsage, getDiscountUsageUnitsFromItems } from '@/lib/orders/discountUsage'
import {
  getCheckoutUnavailableReason,
  getOrderErrorForCheckoutUnavailableReason,
} from '@/lib/orders/checkoutAvailability'
import {
  calculateDiscountAmount,
  decimalToNumber,
  getApplicableTicketTypeIds,
  getDiscountCodeRemainingTicketUses,
  normalizeDiscountCode,
} from '@/lib/tickets'
import { generateOrderNumber, isTicketAvailable } from '@/lib/utils'
import { getVatRateForCountryNameOrCode } from '@/lib/pricing/vatRates'
import { getIncludedVatFromVatInclusiveTotal } from '@/lib/pricing/vat'
import { type CreateOrderInput } from '@/lib/validations/order'

// ── Shared types ────────────────────────────────────────────────────────────

export type DiscountCodeWithLinks = Prisma.DiscountCodeGetPayload<{
  include: { ticketTypes: true }
}>

export type GroupDiscountRecord = {
  id: string
  ticketTypeId: string | null
  minQuantity: number
  discountType: string
  discountValue: Prisma.Decimal
  isActive: boolean
}

// ── Shared helpers ───────────────────────────────────────────────────────────

export function calculateGroupDiscountAmount(
  groupDiscount: GroupDiscountRecord,
  items: { ticketTypeId: string; quantity: number; unitPrice: number; totalPrice: number }[],
  vatRate: number
): number {
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0)
  const value = decimalToNumber(groupDiscount.discountValue)
  // TIER_PRICE: organizer enters the exact per-ticket price (ex-VAT, matching
  // ticketType.price convention) that applies when minQuantity is reached.
  // Convert to VAT-inclusive so it matches the stored item.unitPrice.
  const targetUnitInclVat = value * (1 + (vatRate ?? 0))

  if (groupDiscount.ticketTypeId === null) {
    // Global discount — check total quantity
    if (totalQuantity < groupDiscount.minQuantity) return 0

    if (groupDiscount.discountType === 'PERCENTAGE') {
      return Number(Math.min(subtotal, (subtotal * value) / 100).toFixed(2))
    } else if (groupDiscount.discountType === 'TIER_PRICE') {
      const reduced = items.reduce(
        (sum, item) => sum + Math.max(0, item.unitPrice - targetUnitInclVat) * item.quantity,
        0
      )
      return Number(Math.min(subtotal, reduced).toFixed(2))
    } else {
      return Number(Math.min(subtotal, value).toFixed(2))
    }
  } else {
    // Ticket-specific discount
    const applicableItem = items.find((item) => item.ticketTypeId === groupDiscount.ticketTypeId)
    if (!applicableItem || applicableItem.quantity < groupDiscount.minQuantity) return 0

    if (groupDiscount.discountType === 'PERCENTAGE') {
      return Number(
        Math.min(applicableItem.totalPrice, (applicableItem.totalPrice * value) / 100).toFixed(2)
      )
    } else if (groupDiscount.discountType === 'TIER_PRICE') {
      const reduced =
        Math.max(0, applicableItem.unitPrice - targetUnitInclVat) * applicableItem.quantity
      return Number(Math.min(applicableItem.totalPrice, reduced).toFixed(2))
    } else {
      return Number(Math.min(applicableItem.totalPrice, value).toFixed(2))
    }
  }
}

// ── createOrder ──────────────────────────────────────────────────────────────

export interface CreateOrderOptions {
  /** Associate the order with a logged-in user. Null for anonymous or manual orders. */
  userId?: string | null
  /**
   * When true, applies the manual-order path:
   *  - Skips event checkout-availability and per-ticket sales-window checks
   *  - Skips discount-code minCartAmount validation
   *  - Discount-code errors are silently ignored instead of thrown
   *  - Order status is always PAID (free) or PENDING_INVOICE (invoiced); never PENDING/PAYPAL
   */
  isManualOrder?: boolean
}

// Keep the include shape in a const so the return type can be inferred precisely.
const ORDER_RESULT_INCLUDE = {
  items: {
    include: {
      ticketType: {
        select: { name: true },
      },
    },
  },
  tickets: true,
  groupDiscount: {
    select: {
      minQuantity: true,
      discountType: true,
      discountValue: true,
    },
  },
  discountCode: {
    select: { code: true },
  },
  event: {
    select: {
      id: true,
      title: true,
      startDate: true,
      locationType: true,
      venue: true,
      city: true,
      country: true,
      onlineUrl: true,
      organizer: {
        select: {
          user: {
            select: { email: true },
          },
        },
      },
    },
  },
} as const

export type CreatedOrder = Prisma.OrderGetPayload<{ include: typeof ORDER_RESULT_INCLUDE }>

export interface CreateOrderResult {
  order: CreatedOrder
  /** Non-null when a valid promo code was present but a group discount was applied instead. */
  promoCodeWarning: string | null
}

export async function createOrder(
  input: CreateOrderInput,
  opts: CreateOrderOptions = {}
): Promise<CreateOrderResult> {
  const { userId = null, isManualOrder = false } = opts
  const buyerEmail = input.buyer.email.trim()

  return prisma.$transaction(
    async (tx) => {
      // ── 1. Fetch event ──────────────────────────────────────────────────────
      const event = await tx.event.findUnique({
        where: { id: input.eventId },
        select: {
          id: true,
          title: true,
          slug: true,
          startDate: true,
          endDate: true,
          locationType: true,
          venue: true,
          city: true,
          country: true,
          onlineUrl: true,
          status: true,
          ticketTypes: {
            where: { isVisible: true },
            select: {
              salesStartDate: true,
              salesEndDate: true,
              maxCapacity: true,
              soldCount: true,
              reservedCount: true,
              isVisible: true,
            },
          },
        },
      })

      if (!event) {
        throw new Error('Event not found')
      }

      // ── 2. Checkout availability (public only) ──────────────────────────────
      if (!isManualOrder) {
        const checkoutUnavailableReason = getCheckoutUnavailableReason(event)
        if (checkoutUnavailableReason) {
          throw new Error(getOrderErrorForCheckoutUnavailableReason(checkoutUnavailableReason))
        }
      }

      // ── 3. Lock and fetch ticket types ──────────────────────────────────────
      const ticketTypeIds = Array.from(new Set(input.items.map((item) => item.ticketTypeId)))

      await lockTicketTypes(tx, ticketTypeIds)

      const ticketTypes = await tx.ticketType.findMany({
        where: { eventId: input.eventId, id: { in: ticketTypeIds } },
        select: {
          id: true,
          name: true,
          price: true,
          currency: true,
          minPerOrder: true,
          maxPerOrder: true,
          maxCapacity: true,
          soldCount: true,
          reservedCount: true,
          salesStartDate: true,
          salesEndDate: true,
        },
      })

      if (ticketTypes.length !== ticketTypeIds.length) {
        throw new Error('One or more ticket types were not found for this event')
      }

      const vatRate = getVatRateForCountryNameOrCode(event.country ?? '')
      const preparedOrder = prepareOrderItems(ticketTypes, input.items, { vatRate })

      // ── 4. Per-ticket availability and capacity checks ──────────────────────
      for (const item of preparedOrder.items) {
        const ticketType = ticketTypes.find((t) => t.id === item.ticketTypeId)

        if (!ticketType) {
          throw new Error('Ticket type not found')
        }

        if (!isManualOrder) {
          // Sales window + availability — public checkout only
          const available = isTicketAvailable(
            ticketType.salesStartDate,
            ticketType.salesEndDate,
            ticketType.maxCapacity,
            ticketType.soldCount,
            ticketType.reservedCount
          )
          if (!available) {
            throw new Error(`${ticketType.name} is not currently available`)
          }
        }

        if (ticketType.maxCapacity !== null) {
          const remaining =
            ticketType.maxCapacity - ticketType.soldCount - ticketType.reservedCount
          if (remaining < item.quantity) {
            throw new Error(
              `${ticketType.name} does not have enough remaining capacity (${remaining} left)`
            )
          }
        }
      }

      // ── 5. Discount code ────────────────────────────────────────────────────
      let discountCodeRecord: DiscountCodeWithLinks | null = null
      let discountUsageUnits = 0
      let discountApplicableTicketTypeIds: string[] = []
      let promoCodeDiscountAmount = 0
      let promoCodeError: string | null = null

      if (input.discountCode) {
        const foundDiscountCode = await tx.discountCode.findUnique({
          where: {
            eventId_code: {
              eventId: input.eventId,
              code: normalizeDiscountCode(input.discountCode),
            },
          },
          include: { ticketTypes: true },
        })

        let discountCodeApplicable = true

        if (!foundDiscountCode) {
          if (!isManualOrder) promoCodeError = 'Discount code not found'
          discountCodeApplicable = false
        } else {
          const now = new Date()
          const isValid =
            foundDiscountCode.isActive &&
            (!foundDiscountCode.validFrom || foundDiscountCode.validFrom <= now) &&
            (!foundDiscountCode.validUntil || foundDiscountCode.validUntil > now)

          if (!isValid) {
            if (!isManualOrder)
              promoCodeError = 'Discount code is inactive, expired, or fully used'
            discountCodeApplicable = false
          } else {
            discountApplicableTicketTypeIds = getApplicableTicketTypeIds(foundDiscountCode)
            const appliesToAll = discountApplicableTicketTypeIds.length === 0

            if (discountApplicableTicketTypeIds.length > 0) {
              const hasApplicableItem = preparedOrder.items.some((item) =>
                discountApplicableTicketTypeIds.includes(item.ticketTypeId)
              )
              if (!hasApplicableItem) {
                if (!isManualOrder)
                  promoCodeError = 'Discount code does not apply to selected ticket types'
                discountCodeApplicable = false
              }
            }

            if (discountCodeApplicable) {
              const applicableItems = preparedOrder.items.filter(
                (item) =>
                  appliesToAll || discountApplicableTicketTypeIds.includes(item.ticketTypeId)
              )

              // Compute discountable subtotal and usage units in one pass
              let discountableSubtotal: number
              if (foundDiscountCode.maxTicketsPerOrder !== null) {
                const ticketPrices = applicableItems
                  .flatMap((item) => Array(item.quantity).fill(item.unitPrice) as number[])
                  .sort((a, b) => b - a)
                const cappedPrices = ticketPrices.slice(0, foundDiscountCode.maxTicketsPerOrder)
                discountableSubtotal = Number(
                  cappedPrices.reduce((sum, p) => sum + p, 0).toFixed(2)
                )
                discountUsageUnits = cappedPrices.length
              } else if (foundDiscountCode.applyToWholeOrder) {
                discountableSubtotal = applicableItems.reduce(
                  (sum, item) => Number((sum + item.totalPrice).toFixed(2)),
                  0
                )
                discountUsageUnits = getDiscountUsageUnitsFromItems(applicableItems)
              } else {
                // Apply to the single most-expensive applicable ticket
                const maxUnitPrice = Math.max(
                  0,
                  ...applicableItems.map((item) => item.unitPrice)
                )
                discountableSubtotal = maxUnitPrice
                discountUsageUnits = 1
              }

              // Max uses check
              if (foundDiscountCode.maxUses !== null) {
                const remainingUses = getDiscountCodeRemainingTicketUses(foundDiscountCode) ?? 0
                if (discountUsageUnits > remainingUses) {
                  if (!isManualOrder) {
                    promoCodeError =
                      'Discount code has no remaining uses for this quantity of tickets.'
                  }
                  discountCodeApplicable = false
                }
              }

              // minCartAmount check — public only
              if (
                discountCodeApplicable &&
                !isManualOrder &&
                foundDiscountCode.minCartAmount !== null
              ) {
                const minQuantity = decimalToNumber(foundDiscountCode.minCartAmount)
                const totalApplicableQuantity = preparedOrder.items.reduce((sum, item) => {
                  if (
                    appliesToAll ||
                    discountApplicableTicketTypeIds.includes(item.ticketTypeId)
                  ) {
                    return sum + item.quantity
                  }
                  return sum
                }, 0)
                if (totalApplicableQuantity < minQuantity) {
                  promoCodeError = `At least ${minQuantity} ticket(s) of the applicable type are required for this discount code`
                  discountCodeApplicable = false
                }
              }

              if (discountCodeApplicable) {
                discountCodeRecord = foundDiscountCode
                promoCodeDiscountAmount = calculateDiscountAmount(
                  discountableSubtotal,
                  foundDiscountCode.discountType,
                  decimalToNumber(foundDiscountCode.discountValue)
                )
              }
            }
          }
        }
      }

      // ── 6. Group discount ───────────────────────────────────────────────────
      let groupDiscountRecord: GroupDiscountRecord | null = null
      let groupDiscountAmount = 0

      if (input.groupDiscountId) {
        const gd = await tx.groupDiscount.findUnique({
          where: { id: input.groupDiscountId },
          select: {
            id: true,
            eventId: true,
            ticketTypeId: true,
            minQuantity: true,
            discountType: true,
            discountValue: true,
            isActive: true,
          },
        })
        if (gd && gd.eventId === input.eventId && gd.isActive) {
          groupDiscountRecord = gd
          groupDiscountAmount = calculateGroupDiscountAmount(gd, preparedOrder.items, vatRate)
        }
      }

      // ── 7. Discount arbitration ─────────────────────────────────────────────
      const subtotal = preparedOrder.subtotal
      let discountAmount = 0
      let appliedGroupDiscountId: string | null = null
      let appliedDiscountCodeId: string | null = null
      let promoCodeIgnoredForGroupDiscount = false

      const isInvoiceCode = discountCodeRecord?.discountType === 'INVOICE'
      const isFreeNonInvoiceCode =
        discountCodeRecord &&
        !isInvoiceCode &&
        (discountCodeRecord.discountType === 'FREE_TICKET' ||
          (discountCodeRecord.discountType === 'PERCENTAGE' &&
            decimalToNumber(discountCodeRecord.discountValue) >= 100))

      if (isInvoiceCode) {
        // Invoice codes stack with group discounts: group discount for price, invoice for payment method
        discountAmount = groupDiscountAmount
        appliedGroupDiscountId = groupDiscountRecord?.id ?? null
        appliedDiscountCodeId = discountCodeRecord?.id ?? null
        // Don't consume ticket-based usage for invoice codes (they only change payment method)
        discountUsageUnits = 0
      } else if (isFreeNonInvoiceCode) {
        // Non-invoice 100% off codes: order is free, ignore group discount
        discountAmount = promoCodeDiscountAmount
        appliedDiscountCodeId = discountCodeRecord?.id ?? null
      } else if (groupDiscountAmount > promoCodeDiscountAmount) {
        // Group discount wins
        discountAmount = groupDiscountAmount
        appliedGroupDiscountId = groupDiscountRecord?.id ?? null
        discountUsageUnits = 0
        if (promoCodeDiscountAmount > 0) {
          promoCodeIgnoredForGroupDiscount = true
        }
      } else if (promoCodeDiscountAmount > 0) {
        // Promo code wins (or tie goes to promo code)
        discountAmount = promoCodeDiscountAmount
        appliedDiscountCodeId = discountCodeRecord?.id ?? null
      } else if (promoCodeError && groupDiscountAmount > 0) {
        // Promo code was invalid but group discount applies — use group discount silently
        discountAmount = groupDiscountAmount
        appliedGroupDiscountId = groupDiscountRecord?.id ?? null
        promoCodeIgnoredForGroupDiscount = true
      } else if (promoCodeError) {
        // Promo code was invalid and no group discount available — surface the error
        // (isManualOrder never sets promoCodeError so this branch is public-only)
        throw new Error(promoCodeError)
      }

      const totalAmount = Number(Math.max(0, subtotal - discountAmount).toFixed(2))
      const vatAmount = getIncludedVatFromVatInclusiveTotal(totalAmount, vatRate)

      // ── 8. Status and payment method ────────────────────────────────────────
      let status: 'PENDING' | 'PENDING_INVOICE' | 'PAID'
      let paymentMethod: 'PAYPAL' | 'INVOICE' | 'FREE'

      if (isManualOrder) {
        // Manual orders: free → PAID/FREE, otherwise always invoice
        // A zero-total order is never invoiced.
        status = totalAmount === 0 ? 'PAID' : 'PENDING_INVOICE'
        paymentMethod = totalAmount === 0 ? 'FREE' : 'INVOICE'
      } else {
        // Public checkout: default to Stripe pending
        status = 'PENDING'
        paymentMethod = 'PAYPAL'
        // A zero-total order is never invoiced — even when the applied discount
        // code is INVOICE-typed (e.g. stacked with a 100% group discount).
        if (totalAmount === 0) {
          status = 'PAID'
          paymentMethod = 'FREE'
        } else if (discountCodeRecord?.discountType === 'INVOICE') {
          status = 'PAID'
          paymentMethod = 'INVOICE'
        } else if (discountCodeRecord?.discountType === 'FREE_TICKET') {
          status = 'PAID'
          paymentMethod = 'FREE'
        }
      }

      const now = new Date()
      // PENDING orders no longer auto-expire; organizers manage them manually
      // via the dashboard (reminder flow + manual cancel).
      const expiresAt = null

      // ── 9. Create order record ──────────────────────────────────────────────
      const order = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId,
          eventId: input.eventId,
          discountCodeId: appliedDiscountCodeId,
          groupDiscountId: appliedGroupDiscountId,
          buyerFirstName: input.buyer.firstName,
          buyerLastName: input.buyer.lastName,
          buyerTitle: input.buyer.title,
          buyerEmail,
          buyerOrganization: input.buyer.organization,
          buyerAddress: input.buyer.address,
          buyerCity: input.buyer.city,
          buyerPostalCode: input.buyer.postalCode,
          buyerCountry: input.buyer.country,
          subtotal,
          discountAmount,
          totalAmount,
          vatRate,
          vatAmount,
          currency: ticketTypes[0]?.currency ?? 'SEK',
          status,
          paymentMethod,
          expiresAt,
          paidAt: status === 'PAID' ? now : null,
        },
      })

      // ── 10. Order items ─────────────────────────────────────────────────────
      const attendeesByTicketType = new Map(
        input.items
          .filter((item) => item.attendees && item.attendees.length > 0)
          .map((item) => [item.ticketTypeId, item.attendees!])
      )

      if (preparedOrder.items.length > 0) {
        await tx.orderItem.createMany({
          data: preparedOrder.items.map((item) => ({
            orderId: order.id,
            ticketTypeId: item.ticketTypeId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            attendeeData: attendeesByTicketType.get(item.ticketTypeId) ?? undefined,
          })),
        })
      }

      // ── 11. Tickets / reservations ──────────────────────────────────────────
      if (status === 'PAID') {
        for (const item of preparedOrder.items) {
          await tx.ticketType.update({
            where: { id: item.ticketTypeId },
            data: { soldCount: { increment: item.quantity } },
          })
        }
        const tickets = generateTicketCreateInput(
          order.id,
          preparedOrder.items.map((item) => ({
            ...item,
            attendees: attendeesByTicketType.get(item.ticketTypeId),
          }))
        )
        if (tickets.length > 0) {
          await tx.ticket.createMany({ data: tickets })
        }
      } else {
        for (const item of preparedOrder.items) {
          await tx.ticketType.update({
            where: { id: item.ticketTypeId },
            data: { reservedCount: { increment: item.quantity } },
          })
        }
      }

      // ── 12. Claim discount code usage ───────────────────────────────────────
      if (discountCodeRecord && appliedDiscountCodeId && discountUsageUnits > 0) {
        const usageClaimed = await claimDiscountCodeUsage(
          tx,
          discountCodeRecord.id,
          discountUsageUnits,
          discountCodeRecord.maxUses
        )
        if (!usageClaimed) {
          throw new Error('Discount code has no remaining uses for this quantity of tickets.')
        }
      }

      // ── 13. Final read with full includes ───────────────────────────────────
      const finalOrder = await tx.order.findUniqueOrThrow({
        where: { id: order.id },
        include: ORDER_RESULT_INCLUDE,
      })

      return {
        order: finalOrder,
        promoCodeWarning:
          promoCodeError && promoCodeIgnoredForGroupDiscount
            ? `${promoCodeError}. A group discount was applied instead.`
            : null,
      }
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
  )
}
