// frontend/src/components/inventory/AccessManager/UserSearch.tsx
import { useState, useRef } from 'react'
import { useGetAllUsersQuery } from '@/features/users/usersApi'
import type { User } from '@/types'
import { Search, X, User as UserIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface UserSearchProps {
  selectedUser: User | null
  onUserSelect: (user: User | null) => void
}

export default function UserSearch({
  selectedUser,
  onUserSelect,
}: UserSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const { data: usersData, isLoading } = useGetAllUsersQuery(
    { search: searchQuery, limit: 10 },
    { skip: searchQuery.length < 2 }
  )

  const users = usersData?.users || []

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setIsOpen(true)
  }

  const handleUserSelect = (user: User) => {
    onUserSelect(user)
    setSearchQuery('')
    setIsOpen(false)
  }

  const clearSelection = () => {
    onUserSelect(null)
    setSearchQuery('')
    inputRef.current?.focus()
  }

  return (
    <div className="relative">
      {selectedUser ? (
        <div className="flex items-center justify-between rounded-lg border bg-muted p-3">
          <div className="flex items-center gap-3">
            {selectedUser.avatar ? (
              <img
                src={selectedUser.avatar}
                alt={selectedUser.name}
                className="h-8 w-8 rounded-full"
              />
            ) : (
              <UserIcon className="h-8 w-8 rounded-full bg-background p-1.5 text-muted-foreground" />
            )}
            <div>
              <p className="font-medium text-foreground">
                {selectedUser.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {selectedUser.email}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSelection}
            className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            placeholder="Search users by name or email..."
            className="pl-10"
          />
        </div>
      )}

      {/* Dropdown Results */}
      {isOpen && searchQuery.length >= 2 && (
        <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-background py-1 shadow-lg">
          {isLoading ? (
            <div className="px-4 py-2 text-sm text-muted-foreground">
              Searching...
            </div>
          ) : users.length === 0 ? (
            <div className="px-4 py-2 text-sm text-muted-foreground">
              No users found
            </div>
          ) : (
            users.map((user) => (
              <button
                key={user.id}
                onClick={() => handleUserSelect(user)}
                className="flex w-full items-center gap-3 px-4 py-2 text-left hover:bg-muted"
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-8 w-8 rounded-full"
                  />
                ) : (
                  <UserIcon className="h-8 w-8 rounded-full bg-background p-1.5 text-muted-foreground" />
                )}
                <div>
                  <p className="font-medium text-foreground">
                    {user.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}