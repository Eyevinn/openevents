import { Prisma } from '@prisma/client'

export type QuantityLike = {
  quantity: number
}

export function getDiscountUsageUnitsFromItems(items: QuantityLike[]): number {
  return items.reduce((sum, item) => sum + Math.max(0, item.quantity), 0)
}

export async function claimDiscountCodeUsage(
  tx: Prisma.TransactionClient,
  discountCodeId: string,
  usageUnits: number,
  maxUses: number | null
): Promise<boolean> {
  if (usageUnits <= 0) return true

  if (maxUses === null) {
    await tx.discountCode.update({
      where: { id: discountCodeId },
      data: {
        usedCount: {
          increment: usageUnits,
        },
        redeemedTicketCount: {
          increment: usageUnits,
        },
      },
    })
    return true
  }

  const claimed = await tx.discountCode.updateMany({
    where: {
      id: discountCodeId,
      usedCount: {
        lte: maxUses - usageUnits,
      },
      redeemedTicketCount: {
        lte: maxUses - usageUnits,
      },
    },
    data: {
      usedCount: {
        increment: usageUnits,
      },
      redeemedTicketCount: {
        increment: usageUnits,
      },
    },
  })

  return claimed.count > 0
}

export async function releaseDiscountCodeUsage(
  tx: Prisma.TransactionClient,
  discountCodeId: string,
  usageUnits: number
): Promise<number> {
  if (usageUnits <= 0) return 0

  const discountCode = await tx.discountCode.findUnique({
    where: { id: discountCodeId },
    select: {
      usedCount: true,
      redeemedTicketCount: true,
    },
  })

  if (!discountCode) {
    return 0
  }

  const nextUsedCount = Math.max(0, discountCode.usedCount - usageUnits)
  const nextRedeemedTicketCount = Math.max(0, discountCode.redeemedTicketCount - usageUnits)

  if (
    nextUsedCount === discountCode.usedCount &&
    nextRedeemedTicketCount === discountCode.redeemedTicketCount
  ) {
    return 0
  }

  await tx.discountCode.update({
    where: { id: discountCodeId },
    data: {
      usedCount: nextUsedCount,
      redeemedTicketCount: nextRedeemedTicketCount,
    },
  })

  return usageUnits
}
