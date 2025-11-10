// backend/src/controllers/PostController.ts
import type { Request, Response } from 'express'
import type { AuthRequest } from '../middleware/auth'
import { prisma } from '../lib/prisma'
import { getIO } from '../lib/socket'

export class PostController {
  async createPost(req: AuthRequest, res: Response) {
    try {
      const { inventoryId } = req.params
      const { content } = req.body
      const userId = req.user.id

      if (!inventoryId) {
        return res.status(400).json({ error: 'Inventory ID is required' })
      }

      if (!content?.trim()) {
        return res.status(400).json({ error: 'Content is required' })
      }

      const post = await prisma.post.create({
        data: {
          content: content.trim(),
          inventoryId,
          userId,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      })

      // Emit real-time event
      const io = getIO()
      io.to(`inventory:${inventoryId}`).emit('post:created', post)

      res.status(201).json(post)
    } catch (error) {
      console.error('Create post error:', error)
      res.status(500).json({ error: 'Failed to create post' })
    }
  }

  async getPosts(req: Request, res: Response) {
    try {
      const { inventoryId } = req.params
      const { page = 1, limit = 50 } = req.query

      const skip = (Number(page) - 1) * Number(limit)

      const [posts, total] = await Promise.all([
        prisma.post.findMany({
          where: { inventoryId },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'asc' },
        }),
        prisma.post.count({
          where: { inventoryId },
        }),
      ])

      res.json({
        posts,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      })
    } catch (error) {
      console.error('Get posts error:', error)
      res.status(500).json({ error: 'Failed to fetch posts' })
    }
  }

  async deletePost(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params
      const userId = req.user.id

      const post = await prisma.post.findUnique({
        where: { id },
        include: {
          inventory: true,
        },
      })

      if (!post) {
        return res.status(404).json({ error: 'Post not found' })
      }

      // Only post author, inventory creator, or admin can delete
      const isAuthor = post.userId === userId
      const isInventoryCreator = post.inventory.creatorId === userId

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { isAdmin: true },
      })

      const isAdmin = user?.isAdmin

      if (!isAuthor && !isInventoryCreator && !isAdmin) {
        return res
          .status(403)
          .json({ error: 'Not authorized to delete this post' })
      }

      await prisma.post.delete({
        where: { id },
      })

      // Emit real-time event
      const io = getIO()
      io.to(`inventory:${post.inventoryId}`).emit('post:deleted', {
        id: post.id,
        type: 'post:deleted',
      })

      res.json({ message: 'Post deleted successfully' })
    } catch (error) {
      console.error('Delete post error:', error)
      res.status(500).json({ error: 'Failed to delete post' })
    }
  }
}
