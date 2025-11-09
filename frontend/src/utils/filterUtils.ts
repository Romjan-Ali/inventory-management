// frontend/src/utils/filterUtils.ts
import { type Inventory } from '@/types/index'
import { type FilterState } from '@/types/filter'

export function filterInventories(
  inventories: Inventory[],
  filters: FilterState
): Inventory[] {
  return inventories.filter(inventory => {
    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      const matchesSearch = 
        inventory.title.toLowerCase().includes(searchTerm) ||
        inventory.description?.toLowerCase().includes(searchTerm) ||
        inventory.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
      if (!matchesSearch) return false
    }

    // Category filter - skip if 'all'
    if (filters.category !== 'all' && inventory.category !== filters.category) {
      return false
    }

    // Visibility filter - skip if 'all'
    if (filters.visibility !== 'all') {
      if (filters.visibility === 'public' && !inventory.isPublic) return false
      if (filters.visibility === 'private' && inventory.isPublic) return false
    }

    // Tags filter
    if (filters.tags.length > 0) {
      const hasMatchingTag = filters.tags.some(filterTag =>
        inventory.tags?.includes(filterTag)
      )
      if (!hasMatchingTag) return false
    }

    return true
  })
}

export function sortInventories(
  inventories: Inventory[],
  sortKey: string,
  sortOrder: 'asc' | 'desc'
): Inventory[] {
  return [...inventories].sort((a, b) => {
    let aValue: string | Date | number
    let bValue: string | Date | number

    switch (sortKey) {
      case 'title':
        aValue = a.title.toLowerCase()
        bValue = b.title.toLowerCase()
        break
      case 'createdAt':
        aValue = new Date(a.createdAt)
        bValue = new Date(b.createdAt)
        break
      case 'updatedAt':
        aValue = new Date(a.updatedAt)
        bValue = new Date(b.updatedAt)
        break
      case 'itemCount':
        aValue = a._count?.items || 0
        bValue = b._count?.items || 0
        break
      default:
        aValue = a.title.toLowerCase()
        bValue = b.title.toLowerCase()
    }

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
    return 0
  })
}

export function extractAllTags(inventories: Inventory[]): string[] {
  const allTags = inventories.flatMap(inventory => inventory.tags || [])
  const uniqueTags = [...new Set(allTags)]
  return uniqueTags.sort()
}