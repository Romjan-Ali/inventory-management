// backend/src/controllers/UserController.ts
import type { Request, Response } from 'express'
import { UserRepository } from '../repositories/UserRepository'
import type { AuthRequest } from '../middleware/auth'
import { prisma } from '../lib/prisma'

export class UserController {
  constructor(private userRepository: UserRepository) {}

  getCurrentUser = async (req: AuthRequest, res: Response) => {
    try {
      const user = await this.userRepository.findById(req.user.id)
      res.json(user)
    } catch (error) {
      console.error('Get current user error:', error)
      res.status(500).json({ error: 'Failed to fetch user' })
    }
  }

  getUserProfile = async (req: Request, res: Response) => {
    try {
      const { id } = req.params

      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          isAdmin: true,
          createdAt: true,
          ownedInventories: {
            include: {
              _count: {
                select: { items: true, accesses: true },
              },
            },
            orderBy: { updatedAt: 'desc' },
          },
          accessibleInventories: {
            include: {
              inventory: {
                include: {
                  _count: {
                    select: { items: true },
                  },
                  creator: {
                    select: {
                      id: true,
                      name: true,
                      avatar: true,
                    },
                  },
                },
              },
            },
          },
        },
      })

      if (!user) {
        return res.status(404).json({ error: 'User not found' })
      }

      res.json(user)
    } catch (error) {
      console.error('Get user profile error:', error)
      res.status(500).json({ error: 'Failed to fetch user profile' })
    }
  }

  getAllUsers = async (req: AuthRequest, res: Response) => {
    try {
      const { page, limit, search } = req.query

      const result = await this.userRepository.findAll({
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 20,
        search: search as string,
      })

      res.json(result)
    } catch (error) {
      console.error('Get all users error:', error)
      res.status(500).json({ error: 'Failed to fetch users' })
    }
  }

  blockUser = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params
      const { isBlocked } = req.body

      if (!id) {
        return res.status(400).json({ error: 'User ID is required' })
      }

      // Prevent blocking yourself
      if (id === req.user.id) {
        return res.status(400).json({ error: 'Cannot block yourself' })
      }

      const user = await this.userRepository.update(id, { isBlocked })
      res.json(user)
    } catch (error) {
      console.error('Block user error:', error)
      res.status(500).json({ error: 'Failed to update user' })
    }
  }

  makeAdmin = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params
      const { isAdmin } = req.body

      if (!id) {
        return res.status(400).json({ error: 'User ID is required' })
      }

      const user = await this.userRepository.update(id, { isAdmin })
      res.json(user)
    } catch (error) {
      console.error('Make admin error:', error)
      res.status(500).json({ error: 'Failed to update user' })
    }
  }
}
