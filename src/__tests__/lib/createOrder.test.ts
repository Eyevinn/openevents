/**
 * Tests for createOrder (src/lib/orders/createOrder.ts)
 *
 * Covers both entry points:
 *   - Public checkout  (isManualOrder: false, the default)
 *   - Dashboard manual order (isManualOrder: true)
 */
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'
import { Prisma } from '@prisma/client'
import {
  createOrder,
  calculateGroupDiscountAmount,
  type GroupDiscountRecord,
} from '@/lib/orders/createOrder'
import { prisma } from '@/lib/db'
import { prepareOrderItems } from '@/lib/orders'
import {
  getCheckoutUnavailableReason,
  getOrderErrorForCheckoutUnavailableReason,
} from '@/lib/orders/checkoutAvailability'
import { isTicketAvailable } from '@/lib/utils'

// ── Module mocks ──────────────────────────────────────────────────────────────

vi.mock('@/lib/db', () => ({
  prisma: { $transaction: vi.fn() },
}))

vi.mock('@/lib/orders', () => ({
  lockTicketTypes: vi.fn().mockResolvedValue(undefined),
  prepareOrderItems: vi.fn(),
  generateTicketCreateInput: vi.fn().mockReturnValue([]),
}))

vi.mock('@/lib/orders/checkoutAvailability', () => ({
  getCheckoutUnavailableReason: vi.fn(),
  getOrderErrorForCheckoutUnavailableReason: vi.fn(
    () => 'Event is not open for ticket sales'
  ),
}))

vi.mock('@/lib/orders/discountUsage', () => ({
  claimDiscountCodeUsage: vi.fn().mockResolvedValue(true),
  getDiscountUsageUnitsFromItems: vi.fn().mockReturnValue(0),
}))

vi.mock('@/lib/tickets', () => ({
  calculateDiscountAmount: vi.fn().mockReturnValue(0),
  decimalToNumber: vi.fn((d: Prisma.Decimal | number) =>
    typeof d === 'number' ? d : parseFloat(d.toString())
  ),
  getApplicableTicketTypeIds: vi.fn().mockReturnValue([]),
  getDiscountCodeRemainingTicketUses: vi.fn().mockReturnValue(null),
  normalizeDiscountCode: vi.fn((code: string) => code.toUpperCase()),
}))

vi.mock('@/lib/utils', () => ({
  generateOrderNumber: vi.fn().mockReturnValue('ORD-0001'),
  isTicketAvailable: vi.fn(),
  formatDateTime: vi.fn().mockReturnValue('2026-06-01 10:00'),
}))

vi.mock('@/lib/pricing/vatRates', () => ({
  getVatRateForCountryNameOrCode: vi.fn().mockReturnValue(0),
}))

vi.mock('@/lib/pricing/vat', () => ({
  getIncludedVatFromVatInclusiveTotal: vi.fn().mockReturnValue(0),
}))

// ── Shared fixtures ───────────────────────────────────────────────────────────

const BASE_INPUT = {
  eventId: 'event-1',
  buyer: {
    firstName: 'Anna',
    lastName: 'Svensson',
    email: 'anna@example.com',
    organization: 'ACME',
    address: 'Storgatan 1',
    city: 'Stockholm',
    postalCode: '11111',
    country: 'SE',
    title: 'Ms',
  },
  items: [{ ticketTypeId: 'tt-1', quantity: 2 }],
}

const MOCK_EVENT = {
  id: 'event-1',
  title: 'Test Event',
  slug: 'test-event',
  startDate: new Date('2026-06-01'),
  endDate: new Date('2026-06-01'),
  locationType: 'VENUE',
  venue: 'Test Venue',
  city: 'Stockholm',
  country: 'SE',
  onlineUrl: null,
  status: 'PUBLISHED',
  ticketTypes: [
    {
      salesStartDate: new Date('2026-01-01'),
      salesEndDate: new Date('2026-12-31'),
      maxCapacity: 100,
      soldCount: 10,
      reservedCount: 0,
      isVisible: true,
    },
  ],
}

const MOCK_TICKET_TYPES = [
  {
    id: 'tt-1',
    name: 'General Admission',
    price: new Prisma.Decimal(200),
    currency: 'SEK',
    minPerOrder: 1,
    maxPerOrder: 10,
    maxCapacity: 100,
    soldCount: 10,
    reservedCount: 0,
    salesStartDate: new Date('2026-01-01'),
    salesEndDate: new Date('2026-12-31'),
  },
]

const FINAL_ORDER_STUB = {
  id: 'order-1',
  orderNumber: 'ORD-0001',
  status: 'PAID',
  paymentMethod: 'FREE',
  totalAmount: new Prisma.Decimal(0),
  discountAmount: new Prisma.Decimal(400),
  subtotal: new Prisma.Decimal(400),
  vatRate: new Prisma.Decimal(0),
  vatAmount: new Prisma.Decimal(0),
  currency: 'SEK',
  buyerEmail: 'anna@example.com',
  buyerFirstName: 'Anna',
  buyerLastName: 'Svensson',
  expiresAt: null,
  paidAt: new Date(),
  items: [
    {
      ticketType: { name: 'General Admission' },
      quantity: 2,
      totalPrice: new Prisma.Decimal(400),
      unitPrice: new Prisma.Decimal(200),
    },
  ],
  tickets: [],
  groupDiscount: null,
  discountCode: null,
  event: {
    id: 'event-1',
    title: 'Test Event',
    startDate: new Date('2026-06-01'),
    locationType: 'VENUE',
    venue: 'Test Venue',
    city: 'Stockholm',
    country: 'SE',
    onlineUrl: null,
    organizer: { user: { email: 'organizer@example.com' } },
  },
}

const NON_FREE_PREPARED_ORDER = {
  items: [{ ticketTypeId: 'tt-1', quantity: 2, unitPrice: 200, totalPrice: 400, currency: 'SEK' }],
  subtotal: 400,
}

const FREE_PREPARED_ORDER = {
  items: [{ ticketTypeId: 'tt-1', quantity: 1, unitPrice: 0, totalPrice: 0, currency: 'SEK' }],
  subtotal: 0,
}

// ── Fake transaction builder ──────────────────────────────────────────────────

function buildFakeTx() {
  return {
    event: {
      findUnique: vi.fn().mockResolvedValue(MOCK_EVENT),
    },
    ticketType: {
      findMany: vi.fn().mockResolvedValue(MOCK_TICKET_TYPES),
      update: vi.fn().mockResolvedValue({}),
    },
    order: {
      create: vi.fn().mockResolvedValue({ id: 'order-1' }),
      findUniqueOrThrow: vi.fn().mockResolvedValue(FINAL_ORDER_STUB),
    },
    orderItem: { createMany: vi.fn().mockResolvedValue({ count: 1 }) },
    ticket: { createMany: vi.fn().mockResolvedValue({ count: 1 }) },
    discountCode: { findUnique: vi.fn().mockResolvedValue(null) },
    groupDiscount: { findUnique: vi.fn().mockResolvedValue(null) },
  }
}

function setupTransaction(fakeTx: ReturnType<typeof buildFakeTx>) {
  ;(prisma.$transaction as Mock).mockImplementation(
    (callback: (tx: unknown) => Promise<unknown>) => callback(fakeTx)
  )
}

// ── calculateGroupDiscountAmount ──────────────────────────────────────────────

describe('calculateGroupDiscountAmount', () => {
  // total qty = 5, subtotal = 400
  const items = [
    { ticketTypeId: 'tt-1', quantity: 3, unitPrice: 100, totalPrice: 300 },
    { ticketTypeId: 'tt-2', quantity: 2, unitPrice: 50, totalPrice: 100 },
  ]

  function makeGd(overrides: Partial<GroupDiscountRecord>): GroupDiscountRecord {
    return {
      id: 'gd-1',
      ticketTypeId: null,
      minQuantity: 4,
      discountType: 'PERCENTAGE',
      discountValue: new Prisma.Decimal(10),
      isActive: true,
      ...overrides,
    }
  }

  it('returns 0 when global quantity is below minQuantity', () => {
    expect(calculateGroupDiscountAmount(makeGd({ minQuantity: 10 }), items, 0)).toBe(0)
  })

  it('applies global PERCENTAGE discount', () => {
    // 10% of subtotal 400 = 40
    expect(
      calculateGroupDiscountAmount(
        makeGd({ minQuantity: 4, discountType: 'PERCENTAGE', discountValue: new Prisma.Decimal(10) }),
        items,
        0
      )
    ).toBe(40)
  })

  it('applies global TIER_PRICE discount', () => {
    // Target unit price 80 (vatRate=0 so no adjustment).
    // tt-1: (100-80)*3 = 60; tt-2: max(0, 50-80)*2 = 0 → total reduction = 60
    expect(
      calculateGroupDiscountAmount(
        makeGd({ minQuantity: 4, discountType: 'TIER_PRICE', discountValue: new Prisma.Decimal(80) }),
        items,
        0
      )
    ).toBe(60)
  })

  it('applies global FIXED discount', () => {
    // Fixed 50 off a 400 subtotal → 50
    expect(
      calculateGroupDiscountAmount(
        makeGd({ minQuantity: 4, discountType: 'FIXED', discountValue: new Prisma.Decimal(50) }),
        items,
        0
      )
    ).toBe(50)
  })

  it('caps global FIXED discount at subtotal', () => {
    expect(
      calculateGroupDiscountAmount(
        makeGd({ minQuantity: 4, discountType: 'FIXED', discountValue: new Prisma.Decimal(1000) }),
        items,
        0
      )
    ).toBe(400)
  })

  it('applies per-ticket PERCENTAGE discount when item quantity is met', () => {
    // tt-1 qty=3 >= minQuantity=2; 20% of 300 = 60
    expect(
      calculateGroupDiscountAmount(
        makeGd({ ticketTypeId: 'tt-1', minQuantity: 2, discountType: 'PERCENTAGE', discountValue: new Prisma.Decimal(20) }),
        items,
        0
      )
    ).toBe(60)
  })

  it('returns 0 for per-ticket discount when item quantity is below minQuantity', () => {
    // tt-2 qty=2, minQuantity=5 → 0
    expect(
      calculateGroupDiscountAmount(
        makeGd({ ticketTypeId: 'tt-2', minQuantity: 5 }),
        items,
        0
      )
    ).toBe(0)
  })
})

// ── createOrder: public checkout ─────────────────────────────────────────────

describe('createOrder (public checkout, isManualOrder: false)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(prepareOrderItems as Mock).mockReturnValue(NON_FREE_PREPARED_ORDER)
    ;(getCheckoutUnavailableReason as Mock).mockReturnValue(null)
    ;(isTicketAvailable as Mock).mockReturnValue(true)
  })

  it('creates a PENDING/PAYPAL order for a non-free order', async () => {
    const fakeTx = buildFakeTx()
    setupTransaction(fakeTx)

    await createOrder(BASE_INPUT)

    const { status, paymentMethod } = fakeTx.order.create.mock.calls[0][0].data
    expect(status).toBe('PENDING')
    expect(paymentMethod).toBe('PAYPAL')
  })

  it('creates a PAID/FREE order when total is zero', async () => {
    ;(prepareOrderItems as Mock).mockReturnValue(FREE_PREPARED_ORDER)
    const fakeTx = buildFakeTx()
    setupTransaction(fakeTx)

    await createOrder(BASE_INPUT)

    const { status, paymentMethod } = fakeTx.order.create.mock.calls[0][0].data
    expect(status).toBe('PAID')
    expect(paymentMethod).toBe('FREE')
  })

  it('throws and does not create an order when checkout is unavailable', async () => {
    ;(getCheckoutUnavailableReason as Mock).mockReturnValue('NOT_OPEN')
    ;(getOrderErrorForCheckoutUnavailableReason as Mock).mockReturnValue(
      'Event is not open for ticket sales'
    )
    const fakeTx = buildFakeTx()
    setupTransaction(fakeTx)

    await expect(createOrder(BASE_INPUT)).rejects.toThrow('Event is not open for ticket sales')
    expect(fakeTx.order.create).not.toHaveBeenCalled()
  })

  it('throws and does not create an order when a ticket type is unavailable', async () => {
    ;(isTicketAvailable as Mock).mockReturnValue(false)
    const fakeTx = buildFakeTx()
    setupTransaction(fakeTx)

    await expect(createOrder(BASE_INPUT)).rejects.toThrow('is not currently available')
    expect(fakeTx.order.create).not.toHaveBeenCalled()
  })

  it('throws when the discount code does not exist', async () => {
    const fakeTx = buildFakeTx()
    fakeTx.discountCode.findUnique.mockResolvedValue(null)
    setupTransaction(fakeTx)

    await expect(
      createOrder({ ...BASE_INPUT, discountCode: 'BADCODE' })
    ).rejects.toThrow('Discount code not found')
  })
})

// ── createOrder: manual order ─────────────────────────────────────────────────

describe('createOrder (manual order, isManualOrder: true)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(prepareOrderItems as Mock).mockReturnValue(NON_FREE_PREPARED_ORDER)
    ;(getCheckoutUnavailableReason as Mock).mockReturnValue(null)
    ;(isTicketAvailable as Mock).mockReturnValue(true)
  })

  it('creates a PENDING_INVOICE/INVOICE order for a non-free order', async () => {
    const fakeTx = buildFakeTx()
    setupTransaction(fakeTx)

    await createOrder(BASE_INPUT, { isManualOrder: true })

    const { status, paymentMethod } = fakeTx.order.create.mock.calls[0][0].data
    expect(status).toBe('PENDING_INVOICE')
    expect(paymentMethod).toBe('INVOICE')
  })

  it('creates a PAID/FREE order when total is zero', async () => {
    ;(prepareOrderItems as Mock).mockReturnValue(FREE_PREPARED_ORDER)
    const fakeTx = buildFakeTx()
    setupTransaction(fakeTx)

    await createOrder(BASE_INPUT, { isManualOrder: true })

    const { status, paymentMethod } = fakeTx.order.create.mock.calls[0][0].data
    expect(status).toBe('PAID')
    expect(paymentMethod).toBe('FREE')
  })

  it('proceeds when checkout is unavailable (skips availability check)', async () => {
    ;(getCheckoutUnavailableReason as Mock).mockReturnValue('NOT_OPEN')
    const fakeTx = buildFakeTx()
    setupTransaction(fakeTx)

    await expect(createOrder(BASE_INPUT, { isManualOrder: true })).resolves.toBeDefined()
    expect(fakeTx.order.create).toHaveBeenCalled()
  })

  it('proceeds when the ticket sales window is closed (skips per-ticket availability check)', async () => {
    ;(isTicketAvailable as Mock).mockReturnValue(false)
    const fakeTx = buildFakeTx()
    setupTransaction(fakeTx)

    await expect(createOrder(BASE_INPUT, { isManualOrder: true })).resolves.toBeDefined()
    expect(fakeTx.order.create).toHaveBeenCalled()
  })

  it('proceeds and ignores an invalid discount code without throwing', async () => {
    const fakeTx = buildFakeTx()
    fakeTx.discountCode.findUnique.mockResolvedValue(null)
    setupTransaction(fakeTx)

    await expect(
      createOrder({ ...BASE_INPUT, discountCode: 'BADCODE' }, { isManualOrder: true })
    ).resolves.toBeDefined()

    const { discountCodeId } = fakeTx.order.create.mock.calls[0][0].data
    expect(discountCodeId).toBeNull()
  })
})
