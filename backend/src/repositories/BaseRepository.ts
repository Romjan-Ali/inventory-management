// backend/src/repositories/BaseRepository.ts
import { PrismaClient } from '@prisma/client'

export abstract class BaseRepository<T> {
  constructor(protected prisma: PrismaClient) {}

  abstract findById(id: string): Promise<T | null>
}
