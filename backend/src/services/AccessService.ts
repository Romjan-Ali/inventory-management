// backend/src/services/AccessService.ts
import { prisma } from '../lib/prisma'
import { NotFoundError } from '../errors'

export class AccessService {
  async canReadInventory(
    inventoryId: string,
    userId?: string
  ): Promise<boolean> {
    // All inventories are readable by everyone (based on requirements)
    return true
  }

  async canWriteInventory(
    inventoryId: string,
    userId: string
  ): Promise<boolean> {
    if (!userId) return false

    const inventory = await prisma.inventory.findUnique({
      where: { id: inventoryId },
      include: {
        accesses: {
          where: { userId },
        },
      },
    })

    if (!inventory) {
      throw new NotFoundError('Inventory')
    }

    // Creator always has write access
    if (inventory.creatorId === userId) return true

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isAdmin: true },
    })

    if (user?.isAdmin) return true

    // Check if inventory is public
    if (inventory.isPublic) return true

    // Check explicit access
    const hasAccess = inventory.accesses.some((access) => access.canWrite)
    return hasAccess
  }

  async grantAccess(
    inventoryId: string,
    userId: string,
    canWrite: boolean = true
  ): Promise<void> {
    await prisma.inventoryAccess.upsert({
      where: {
        inventoryId_userId: {
          inventoryId,
          userId,
        },
      },
      update: { canWrite },
      create: {
        inventoryId,
        userId,
        canWrite,
      },
    })
  }

  async revokeAccess(inventoryId: string, userId: string): Promise<void> {
    await prisma.inventoryAccess.delete({
      where: {
        inventoryId_userId: {
          inventoryId,
          userId,
        },
      },
    })
  }

  async getAccessList(inventoryId: string) {
    return prisma.inventoryAccess.findMany({
      where: { inventoryId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    })
  }
}
