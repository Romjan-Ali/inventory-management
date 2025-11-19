// backend/src/services/ApiTokenService.ts
import { prisma } from '../lib/prisma'
import { randomBytes } from 'crypto'

export class ApiTokenService {
  async generateToken(inventoryId: string, expiresInDays?: number): Promise<{
    id: string
    token: string
    inventoryId: string
    createdAt: Date
    expiresAt: Date | null
    isActive: boolean
  }> {
    const token = randomBytes(32).toString('hex')
    const expiresAt = expiresInDays 
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : null

    const apiToken = await prisma.apiToken.create({
      data: {
        token,
        inventoryId,
        expiresAt,
      },
    })

    return apiToken
  }

  async validateToken(token: string): Promise<{ inventoryId: string; isValid: boolean }> {
    const apiToken = await prisma.apiToken.findUnique({
      where: { token },
      include: { inventory: true },
    })

    if (!apiToken || !apiToken.isActive) {
      return { inventoryId: '', isValid: false }
    }

    if (apiToken.expiresAt && apiToken.expiresAt < new Date()) {
      return { inventoryId: '', isValid: false }
    }

    return { inventoryId: apiToken.inventoryId, isValid: true }
  }

  async getInventoryTokens(inventoryId: string) {
    return prisma.apiToken.findMany({
      where: { inventoryId, isActive: true },
      orderBy: { createdAt: 'desc' },
    })
  }

  async revokeToken(tokenId: string): Promise<void> {
    await prisma.apiToken.update({
      where: { id: tokenId },
      data: { isActive: false },
    })
  }
}