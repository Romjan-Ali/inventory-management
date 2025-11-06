// frontend/src/components/inventory/AccessManager/AccessList.tsx
import type { Inventory } from '@/types'
import { User, Edit, Edit2, Trash2 } from 'lucide-react'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'

interface Access {
  id: string
  user: {
    id: string
    name: string
    email: string
    avatar?: string
  }
  canWrite: boolean
}

interface AccessListProps {
  accessList: Access[]
  inventory: Inventory
  onRevokeAccess: (userId: string) => void
  isRevoking: boolean
}

export default function AccessList({ accessList, inventory, onRevokeAccess, isRevoking }: AccessListProps) {
  const { t } = useTranslation()
  if (accessList.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        {t('noAdditionalUsers')}
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
              <User className="h-10 w-10 rounded-full bg-muted p-2 text-muted-foreground" />
            )}
            <div>
              <p className="font-medium text-foreground">{access.user.name}</p>
              <p className="text-sm text-muted-foreground">{access.user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {access.canWrite ? (
                <>
                  <Edit className="h-4 w-4" />
                {t('canEdit')}
                </>
              ) : (
                <>
                  <Edit2 className="h-4 w-4" />
                {t('viewOnly')}
                </>
              )}
            </div>

            {access.user.id !== inventory.creatorId && (
            <Button
                variant="ghost"
                size="sm"
                onClick={() => onRevokeAccess(access.user.id)}
                disabled={isRevoking}
                className="h-8 w-8 p-0 text-destructive hover:bg-destructive hover:text-destructive-foreground"
              aria-label={t('revokeAccess')}
              >
                {isRevoking ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}