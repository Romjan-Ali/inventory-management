// frontend/src/components/inventory/AccessManager/AccessList.tsx
import type { Inventory } from '@/types'
import { User, Edit, Edit2, Trash2 } from 'lucide-react'
import LoadingSpinner from '@/components/common/LoadingSpinner'

interface AccessListProps {
  accessList: any[]
  inventory: Inventory
  onRevokeAccess: (userId: string) => void
  isRevoking: boolean
}

export default function AccessList({ accessList, inventory, onRevokeAccess, isRevoking }: AccessListProps) {
  if (accessList.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        No additional users have access to this inventory.
      </div>
    )
  }

  return (
    <div className="divide-y">
      {accessList.map((access) => (
        <div key={access.id} className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            {access.user.avatar ? (
              <img
                src={access.user.avatar}
                alt={access.user.name}
                className="h-10 w-10 rounded-full"
              />
            ) : (
              <User className="h-10 w-10 rounded-full bg-gray-200 p-2" />
            )}
            <div>
              <p className="font-medium">{access.user.name}</p>
              <p className="text-sm text-muted-foreground">{access.user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {access.canWrite ? (
                <>
                  <Edit className="h-4 w-4" />
                  Can edit
                </>
              ) : (
                <>
                  <Edit2 className="h-4 w-4" />
                  View only
                </>
              )}
            </div>

            {access.user.id !== inventory.creatorId && (
              <button
                onClick={() => onRevokeAccess(access.user.id)}
                disabled={isRevoking}
                className="text-destructive hover:text-destructive/70 disabled:opacity-50"
              >
                {isRevoking ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}