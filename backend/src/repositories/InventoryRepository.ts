// backend/src/repositories/InventoryRepository.ts
import { Prisma, type Inventory } from '@prisma/client'
import { BaseRepository } from './BaseRepository'

export class InventoryRepository extends BaseRepository<Inventory> {
  async findById(id: string): Promise<Inventory | null> {
    return this.prisma.inventory.findUnique({
      where: { id },
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
            items: true,
            accesses: true,
          },
        },
      },
    })
  }

  async create(data: {
    title: string
    description: string
    imageUrl?: string
    category: string
    tags: string[]
    isPublic: boolean
    creatorId: string
  }): Promise<Inventory> {
    return this.prisma.inventory.create({
      data: {
        ...data,
        // Initialize all custom fields as hidden
        string1Visible: false,
        string2Visible: false,
        string3Visible: false,
        text1Visible: false,
        text2Visible: false,
        text3Visible: false,
        number1Visible: false,
        number2Visible: false,
        number3Visible: false,
        boolean1Visible: false,
        boolean2Visible: false,
        boolean3Visible: false,
        link1Visible: false,
        link2Visible: false,
        link3Visible: false,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    })
  }

  async update(
    id: string,
    data: Prisma.InventoryUpdateInput
  ): Promise<Inventory> {
    return this.prisma.inventory.update({
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
      },
    })
  }

  async updateWithLock(
    id: string,
    version: number,
    data: Prisma.InventoryUpdateInput
  ): Promise<Inventory> {
    return this.prisma.inventory.update({
      where: {
        id,
        version, // Optimistic locking
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
      },
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.inventory.delete({
      where: { id },
    })
  }

  async findByUser(
    userId: string
  ): Promise<{ owned: Inventory[]; accessible: Inventory[] }> {
    const [owned, accessible] = await Promise.all([
      // Inventories owned by user
      this.prisma.inventory.findMany({
        where: { creatorId: userId },
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
              items: true,
              accesses: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
      }),
      // Inventories user has access to (but doesn't own)
      this.prisma.inventory.findMany({
        where: {
          accesses: {
            some: { userId },
          },
          creatorId: { not: userId },
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
              items: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
      }),
    ])

    return { owned, accessible }
  }

  async findAll(params: {
    page?: number
    limit?: number
    search?: string
    category?: string
    tags?: string[]
  }): Promise<{ inventories: Inventory[]; total: number }> {
    const { page = 1, limit = 20, search, category, tags } = params
    const skip = (page - 1) * limit

    const where: any = {}

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (category) {
      where.category = category
    }

    if (tags && tags.length > 0) {
      where.tags = { hasSome: tags }
    }

    const [inventories, total] = await Promise.all([
      this.prisma.inventory.findMany({
        where,
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
              items: true,
              accesses: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.inventory.count({ where }),
    ])

    return { inventories, total }
  }

  async find(
    params: {
      page?: number
      limit?: number
      search?: string
      category?: string
      tags?: string[]
      sort?: 'newest' | 'oldest'
    },
    isPublic?: boolean
  ): Promise<{ inventories: Inventory[]; total: number }> {
    const { page = 1, limit = 20, search, category, tags, sort } = params
    const skip = (page - 1) * limit

    const where: any = {}

    const orderBy: any = {
      createdAt: 'desc',
    }

    if (isPublic) {
      where.isPublic = true
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (category) {
      where.category = category
    }

    if (tags && tags.length > 0) {
      where.tags = { hasSome: tags }
    }

    if(sort && (sort === 'newest' || sort === 'oldest')) {
      params.sort === 'newest' ? 
      orderBy.createdAt = 'desc' : orderBy.createdAt = 'asc'
    }

    const [inventories, total] = await Promise.all([
      this.prisma.inventory.findMany({
        where,
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
              items: true,
              accesses: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.inventory.count({ where }),
    ])

    return { inventories, total }
  }

  async getPopular(limit: number = 5): Promise<Inventory[]> {
    return this.prisma.inventory.findMany({
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
            items: true,
          },
        },
      },
      orderBy: {
        items: {
          _count: 'desc',
        },
      },
      take: limit,
    })
  }

  async findItemsByInventoryId(inventoryId: string) {
    return this.prisma.item.findMany({
      where: { inventoryId },
      orderBy: { createdAt: 'desc' },
    })
  }

  async updateCustomIdFormat(id: string, format: any[]): Promise<Inventory> {
    return this.prisma.inventory.update({
      where: { id },
      data: {
        customIdFormat: format,
        version: { increment: 1 },
      },
      include: {
        creator: {
          select: { id: true, name: true, avatar: true },
        },
      },
    })
  }

  async getAllInventoryTags() {
    return this.prisma.inventory.findMany({
      select: {
        tags: true,
      },
    })
  }

  async getAllPublicInventoryTags() {
    return this.prisma.inventory.findMany({
      where: {
        isPublic: true,
      },
      select: {
        tags: true,
      },
    })
  }
}
