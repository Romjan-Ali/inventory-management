// backend/src/lib/container.ts
import { PrismaClient } from '@prisma/client'
import { UserRepository } from '../repositories/UserRepository'
import { InventoryRepository } from '../repositories/InventoryRepository'
import { ItemRepository } from '../repositories/ItemRepository'
import { AccessService } from '../services/AccessService'
import { InventoryService } from '../services/InventoryService'
import { ItemService } from '../services/ItemService'

export class Container {
  private static instance: Container
  private services: Map<string, any> = new Map()

  static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container()
    }
    return Container.instance
  }

  register<T>(name: string, service: T): void {
    this.services.set(name, service)
  }

  resolve<T>(name: string): T {
    const service = this.services.get(name)
    if (!service) {
      throw new Error(`Service ${name} not found`)
    }
    return service
  }
}

// Initialize container with dependencies
export const initializeContainer = () => {
  const container = Container.getInstance()
  const prisma = new PrismaClient()

  // Register repositories
  container.register('PrismaClient', prisma)
  container.register('UserRepository', new UserRepository(prisma))
  container.register('InventoryRepository', new InventoryRepository(prisma))
  container.register('ItemRepository', new ItemRepository(prisma))

  // Register services
  container.register('AccessService', new AccessService())
  container.register(
    'InventoryService',
    new InventoryService(
      container.resolve('InventoryRepository'),
      container.resolve('AccessService')
    )
  )
  container.register(
    'ItemService',
    new ItemService(
      container.resolve('ItemRepository'),
      container.resolve('AccessService')
    )
  )

  return container
}
