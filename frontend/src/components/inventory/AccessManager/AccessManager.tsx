// frontend/src/components/inventory/AccessManager/AccessManager.tsx
import { useState } from 'react'
import type { Inventory, User } from '@/types'
import { useGetAccessListQuery, useGrantAccessMutation, useRevokeAccessMutation } from '@/features/inventory/inventoryApi'
import UserSearch from './UserSearch'
import AccessList from './AccessList'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { Button } from '@/components/ui/button'

interface AccessManagerProps {
  inventory: Inventory
}

export default function AccessManager({ inventory }: AccessManagerProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [canWrite, setCanWrite] = useState(true)
  
  const { data: accessList, isLoading, refetch } = useGetAccessListQuery(inventory.id)
  const [grantAccess, { isLoading: isGranting }] = useGrantAccessMutation()
  const [revokeAccess, { isLoading: isRevoking }] = useRevokeAccessMutation()

  const handleGrantAccess = async () => {
    if (!selectedUser) return

    try {
      await grantAccess({
        inventoryId: inventory.id,
        userId: selectedUser.id,
        canWrite,
      }).unwrap()
      
      setSelectedUser(null)
      setCanWrite(true)
      refetch()
    } catch (error) {
      console.error('Failed to grant access:', error)
    }
  }

  const handleRevokeAccess = async (userId: string) => {
    try {
      await revokeAccess({
        inventoryId: inventory.id,
        userId,
      }).unwrap()
      refetch()
    } catch (error) {
      console.error('Failed to revoke access:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Access Control</h2>
        <p className="text-muted-foreground">
          Manage who can view and edit this inventory
        </p>
      </div>

      {/* Inventory is Public Notice */}
      {inventory.isPublic && (
        <div className="rounded-lg bg-blue-50 p-4">
          <p className="text-sm text-blue-700">
            This inventory is public. All authenticated users can view and add items.
            You can still grant specific users write access below.
          </p>
        </div>
      )}

      {/* Grant Access Section */}
      <div className="rounded-lg border p-6">
        <h3 className="text-lg font-medium mb-4">Grant Access</h3>
        
        <div className="space-y-4">
          <UserSearch
            selectedUser={selectedUser}
            onUserSelect={setSelectedUser}
          />
          
          {selectedUser && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="canWrite"
                  checked={canWrite}
                  onChange={(e) => setCanWrite(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="canWrite" className="text-sm font-medium">
                  Allow editing and adding items
                </label>
              </div>
              
              <Button
                onClick={handleGrantAccess}
                disabled={isGranting}                
              >
                {isGranting && <LoadingSpinner size="sm" />}
                Grant Access
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Access List */}
      <div className="rounded-lg border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-medium">Current Access</h3>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center p-8">
            <LoadingSpinner />
          </div>
        ) : (
          <AccessList
            accessList={accessList || []}
            inventory={inventory}
            onRevokeAccess={handleRevokeAccess}
            isRevoking={isRevoking}
          />
        )}
      </div>
    </div>
  )
}