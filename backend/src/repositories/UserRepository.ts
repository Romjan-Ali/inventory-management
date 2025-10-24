// backend/src/repositories/UserRepository.ts
import { Prisma, type User } from '@prisma/client'
import { BaseRepository } from './BaseRepository'

export class UserRepository extends BaseRepository<User> {
  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    })
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    })
  }

  async create(data: {
    email: string
    name: string
    avatar?: string
  }): Promise<User> {
    return this.prisma.user.create({
      data,
    })
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    })
  }

  async findAll(params: {
    page?: number
    limit?: number
    search?: string
  }): Promise<{ users: User[]; total: number }> {
    const { page = 1, limit = 20, search } = params
    const skip = (page - 1) * limit

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { email: { contains: search, mode: Prisma.QueryMode.insensitive } },
          ],
        }
      : {}

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ])

    return { users, total }
  }
}
