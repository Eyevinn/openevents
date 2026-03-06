import { PaymentMethod } from '@prisma/client'

export function formatPaymentMethodLabel(
  paymentMethod: PaymentMethod | string | null | undefined,
  fallback = '-'
): string {
  if (!paymentMethod) return fallback

  switch (paymentMethod) {
    case 'PAYPAL':
      return 'Stripe'
    case 'INVOICE':
      return 'Invoice'
    case 'FREE':
      return 'Free'
    default:
      return paymentMethod
  }
}
