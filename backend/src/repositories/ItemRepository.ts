// backend/src/repositories/ItemRepository.ts
import { type Item } from '@prisma/client'
import { BaseRepository } from './BaseRepository'

export class ItemRepository extends BaseRepository<Item> {
  async findById(id: string): Promise<Item | null> {
    return this.prisma.item.findUnique({
      where: { id },
      include: {
        inventory: true,
        creator: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        likes: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
    })
  }

  async create(data: {
    customId: string
    inventoryId: string
    creatorId: string
    string1Value?: string
    string2Value?: string
    string3Value?: string
    text1Value?: string
    text2Value?: string
    text3Value?: string
    number1Value?: number
    number2Value?: number
    number3Value?: number
    boolean1Value?: boolean
    boolean2Value?: boolean
    boolean3Value?: boolean
    link1Value?: string
    link2Value?: string
    link3Value?: string
  }): Promise<Item> {
    return this.prisma.item.create({
      data,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
    })
  }

  async update(id: string, data: Partial<Item>): Promise<Item> {
    return this.prisma.item.update({
      where: { id },
      data,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
    })
  }

  async updateWithLock(
    id: string,
    version: number,
    data: Partial<Item>
  ): Promise<Item> {
    return this.prisma.item.update({
      where: {
        id,
        version,
      },
      data: {
        ...data,
        version: { increment: 1 },
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.item.delete({
      where: { id },
    })
  }

  async findByInventory(
    inventoryId: string,
    params: { page?: number; limit?: number } = {}
  ): Promise<{ items: Item[]; total: number }> {
    const { page = 1, limit = 50 } = params
    const skip = (page - 1) * limit

    const [items, total] = await Promise.all([
      this.prisma.item.findMany({
        where: { inventoryId },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          likes: {
            select: { userId: true },
          },
          _count: {
            select: {
              likes: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.item.count({
        where: { inventoryId },
      }),
    ])

    return { items, total }
  }

  async checkCustomIdExists(
    inventoryId: string,
    customId: string
  ): Promise<boolean> {
    const existing = await this.prisma.item.findUnique({
      where: {
        inventoryId_customId: {
          inventoryId,
          customId,
        },
      },
    })
    return !!existing
  }
}
