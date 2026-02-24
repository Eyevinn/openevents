import { Role } from '@prisma/client'
import { hasRole } from '@/lib/auth'

type OrderAccessInput = {
  orderUserId: string
  organizerUserId: string
  requesterUserId: string
  requesterRoles: Role[]
}

type OrderAccessFlags = {
  isOwner: boolean
  isOrganizer: boolean
  isSuperAdmin: boolean
}

export function getOrderAccessFlags(input: OrderAccessInput): OrderAccessFlags {
  const isOwner = input.orderUserId === input.requesterUserId
  const isOrganizer = input.organizerUserId === input.requesterUserId
  const isSuperAdmin = hasRole(input.requesterRoles, 'SUPER_ADMIN')

  return {
    isOwner,
    isOrganizer,
    isSuperAdmin,
  }
}

export function canAccessOrder(input: OrderAccessInput): boolean {
  const access = getOrderAccessFlags(input)
  return access.isOwner || access.isOrganizer || access.isSuperAdmin
}

export function canManageRefund(input: OrderAccessInput): boolean {
  const access = getOrderAccessFlags(input)
  return access.isOrganizer || access.isSuperAdmin
}
