// backend/src/repositories/InventoryRepository.ts
import { Prisma, type Inventory, type User } from '@prisma/client'
import { BaseRepository } from './BaseRepository'
import { access } from 'node:fs'

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
      where: { id_version: { id, version } }, // Optimistic locking
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

  async find(
    params: {
      page: number
      limit: number
      search?: string
      category?: string
      tags?: string[]
      sort?: string
      inventoryType?: 'owned' | 'shared' | 'public' | 'public_and_accessible'
      isPublic?: boolean
    },
    user?: User
  ): Promise<{
    inventories: Inventory[]
    total: number
  }> {
    const { page, limit, search, category, tags, sort, inventoryType, isPublic } = params
    const skip = (page - 1) * limit

    const where: any = {}
    const andConditions: any[] = []

    // Handle public access first - if public, only show public inventories
    if (inventoryType === 'public') {
      andConditions.push({ isPublic: true })
    }
    // Handle authenticated user access
    else if (user?.id) {
      if (user.isAdmin) {
        // Admin sees everything - no additional conditions needed for access
        // But we still need to apply inventoryType filters if specified
        if (inventoryType === 'owned') {
          andConditions.push({ creatorId: user.id })
        } else if (inventoryType === 'shared') {
          andConditions.push({
            AND: [{ creatorId: { not: user.id } }],
          })
        }
        // For 'public_and_accessible' or undefined, no creator/access restrictions for admin
      } else {
        // Regular user with specific inventory type
        if (inventoryType === 'owned') {
          andConditions.push({ creatorId: user.id })
        } else if (inventoryType === 'shared') {
          andConditions.push({
            AND: [
              { accesses: { some: { userId: user.id } } },
              { creatorId: { not: user.id } },
            ],
          })
        } else {
          andConditions.push({
            // Show public and accessible inventories, for 'public_and_accessible' value of 'type' param and authenticated user with undefined 'type' param
            OR: [
              { isPublic: true },
              { accesses: { some: { userId: user.id } } },
              { creatorId: user.id },
            ],
          })
        }
      }
    } else {
      // No user and not public - return empty
      return { inventories: [], total: 0 }
    }

    // Build search conditions
    if (search) {
      andConditions.push({
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      })
    }

    // Add other conditions

    if (category) {
      andConditions.push({ category })
    }

    if (tags && tags.length > 0) {
      andConditions.push({ tags: { hasSome: tags } })
    }

    if(isPublic !== undefined) {
      andConditions.push({ isPublic})
    }

    // Apply all AND conditions
    if (andConditions.length > 0) {
      where.AND = andConditions
    }

    // Build orderBy
    let orderBy: any = { createdAt: 'desc' }

    switch (sort) {
      case 'oldest':
        orderBy = { createdAt: 'asc' }
        break
      case 'popular':
      case 'items':
        orderBy = { items: { _count: 'desc' } }
        break
      case 'title':
        orderBy = { title: 'asc' }
        break
      // 'newest' is default
    }

    // Include configuration
    const includeConfig = {
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
    }

    try {
      const [inventories, total] = await Promise.all([
        this.prisma.inventory.findMany({
          where,
          include: includeConfig,
          skip,
          take: limit,
          orderBy,
        }),
        this.prisma.inventory.count({ where }),
      ])

      return { inventories, total }
    } catch (error) {
      console.error('Error fetching inventories:', error)
      throw new Error('Failed to fetch inventories')
    }
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

  async getPublicInventoryTags() {
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
