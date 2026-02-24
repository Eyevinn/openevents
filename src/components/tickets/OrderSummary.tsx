'use client'

import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'

export interface SummaryLineItem {
  ticketTypeId: string
  name: string
  quantity: number
  unitPrice: number
  totalPrice: number
  currency: string
}

interface OrderSummaryProps {
  items: SummaryLineItem[]
  subtotal: number
  discountAmount: number
  totalAmount: number
  currency: string
  discountCode?: string | null
}

export function OrderSummary({
  items,
  subtotal,
  discountAmount,
  totalAmount,
  currency,
  discountCode,
}: OrderSummaryProps) {
  const t = useTranslations('orderSummary')

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t('title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.length === 0 ? (
          <p className="text-sm text-gray-500">{t('empty')}</p>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.ticketTypeId} className="flex items-start justify-between text-sm">
                <div>
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-gray-500">
                    {item.quantity} x {formatCurrency(item.unitPrice, item.currency)}
                  </p>
                </div>
                <p className="font-medium text-gray-900">
                  {formatCurrency(item.totalPrice, item.currency)}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-2 border-t border-gray-200 pt-3 text-sm">
          <div className="flex items-center justify-between text-gray-600">
            <span>{t('subtotal')}</span>
            <span>{formatCurrency(subtotal, currency)}</span>
          </div>

          {discountAmount > 0 && (
            <div className="flex items-center justify-between text-green-700">
              <span>{discountCode ? t('discountWithCode', { code: discountCode }) : t('discount')}</span>
              <span>-{formatCurrency(discountAmount, currency)}</span>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-gray-200 pt-2 font-semibold text-gray-900">
            <span>{t('total')}</span>
            <span>{formatCurrency(totalAmount, currency)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
