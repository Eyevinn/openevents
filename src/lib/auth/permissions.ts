import { prisma } from '@/lib/db'

export async function requireEventOrganizer(eventId: string, userId: string) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: {
      id: true,
      title: true,
      slug: true,
      startDate: true,
      endDate: true,
      cancellationDeadlineHours: true,
      organizer: {
        select: {
          id: true,
          userId: true,
          orgName: true,
        },
      },
    },
  })

  if (!event) {
    throw new Error('Event not found')
  }

  if (event.organizer.userId !== userId) {
    const superAdminRole = await prisma.userRole.findUnique({
      where: {
        userId_role: {
          userId,
          role: 'SUPER_ADMIN',
        },
      },
      select: {
        id: true,
      },
    })

    if (!superAdminRole) {
      throw new Error('Forbidden')
    }
  }

  return event
}
