import type { Request, Response } from 'express'
import { prisma } from '../lib/prisma'

export class SearchController {
  async search(req: Request, res: Response) {
    try {
      const {
        q: query,
        type = 'all',
        category,
        tags,
        page = 1,
        limit = 20,
      } = req.query

      if (!query) {
        return res.status(400).json({ error: 'Search query is required' })
      }

      const results: any = {}
      const skip = (Number(page) - 1) * Number(limit)

      // Search inventories
      if (type === 'all' || type === 'inventories') {
        const where: any = {
          OR: [
            { title: { contains: query as string, mode: 'insensitive' } },
            { description: { contains: query as string, mode: 'insensitive' } },
            { tags: { hasSome: [query as string] } },
          ],
        }

        if (category) {
          where.category = category
        }

        if (tags) {
          const tagArray = Array.isArray(tags) ? tags : [tags]
          where.tags = { hasSome: tagArray }
        }

        const inventories = await prisma.inventory.findMany({
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
              },
            },
          },
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
        })

        results.inventories = inventories
      }

      // Search items
      if (type === 'all' || type === 'items') {
        const where: any = {
          OR: [
            { customId: { contains: query as string, mode: 'insensitive' } },
            {
              string1Value: { contains: query as string, mode: 'insensitive' },
            },
            {
              string2Value: { contains: query as string, mode: 'insensitive' },
            },
            {
              string3Value: { contains: query as string, mode: 'insensitive' },
            },
            { text1Value: { contains: query as string, mode: 'insensitive' } },
            { text2Value: { contains: query as string, mode: 'insensitive' } },
            { text3Value: { contains: query as string, mode: 'insensitive' } },
          ],
        }

        const items = await prisma.item.findMany({
          where,
          include: {
            inventory: {
              include: {
                creator: {
                  select: {
                    id: true,
                    name: true,
                    avatar: true,
                  },
                },
              },
            },
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
          skip,
          take: Number(limit),
        })

        results.items = items
      }

      res.json(results)
    } catch (error) {
      console.error('Search error:', error)
      res.status(500).json({ error: 'Search failed' })
    }
  }

  async getTags(req: Request, res: Response) {
    try {
      // This is a simplified approach - in production you might want a tags table
      const inventories = await prisma.inventory.findMany({
        select: { tags: true },
      })

      const tagCounts: Record<string, number> = {}
      inventories.forEach((inventory) => {
        inventory.tags.forEach((tag) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1
        })
      })

      const tags = Object.entries(tagCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)

      res.json(tags)
    } catch (error) {
      console.error('Get tags error:', error)
      res.status(500).json({ error: 'Failed to fetch tags' })
    }
  }
}
