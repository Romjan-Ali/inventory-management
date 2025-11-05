// frontend/src/components/inventory/View/InventoryCard.tsx
import type { Inventory } from '@/types'
import { Link } from 'react-router-dom'

export default function InventoryCards({
  inventories,
}: {
  inventories: Inventory[]
}) {
  return (
    <>
      {inventories &&
        inventories.length > 0 &&
        inventories.map((inventory) => (
          <Link
            key={inventory.id}
            to={`/inventory/${inventory.id}`}
            className="block rounded-lg border bg-card p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-semibold text-lg leading-6">
                {inventory.title}
              </h3>
              {inventory.isPublic && (
                <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                  Public
                </span>
              )}
            </div>

            <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
              {inventory.description}
            </p>

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{inventory.category}</span>
              <span>{inventory._count?.items || 0} items</span>
            </div>

            {inventory.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1">
                {inventory.tags.slice(0, 3).map((tag: string) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600"
                  >
                    {tag}
                  </span>
                ))}
                {inventory.tags.length > 3 && (
                  <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                    +{inventory.tags.length - 3}
                  </span>
                )}
              </div>
            )}
          </Link>
        ))}
    </>
  )
}
