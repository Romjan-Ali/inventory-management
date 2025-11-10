// frontend/src/pages/Admin/UserManagement.tsx
import { useState, useEffect } from 'react'
import { useAppSelector } from '@/app/hooks'
import { useGetAllUsersQuery, useBlockUserMutation, useMakeAdminMutation } from '@/features/users/usersApi'
import { Shield, Ban, UserCheck, Search, Users, UserX, UserCog } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import SmartPagination from '@/components/common/SmartPagination'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

export default function UserManagement() {
  const { t } = useTranslation()
  const { user: currentUser } = useAppSelector((state) => state.auth)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [limit] = useState(2)

  const { data: usersData, isLoading, error, refetch } = useGetAllUsersQuery({
    page: currentPage,
    limit,
    search: searchTerm || undefined,
  })

  const [blockUser] = useBlockUserMutation()
  const [makeAdmin] = useMakeAdminMutation()

  const users = usersData?.users || []
  const totalUsers = usersData?.total || 0
  const totalPages = Math.ceil(totalUsers / limit)

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  const handleBlockUser = async (userId: string, isBlocked: boolean) => {
    if (userId === currentUser?.id) {
      toast.error(t('cannotBlockYourself'))
      return
    }

    try {
      await blockUser({ id: userId, isBlocked }).unwrap()
      toast.success(isBlocked ? t('userBlocked') : t('userUnblocked'))
      // Refetch to get updated data
      refetch()
    } catch (error) {
      console.error('Failed to block user:', error)
      toast.error(t('operationFailed'))
    }
  }

  const handleMakeAdmin = async (userId: string, isAdmin: boolean) => {
    if (userId === currentUser?.id && !isAdmin) {
      if (!confirm(t('confirmRemoveSelfAdmin'))) return
    }

    try {
      await makeAdmin({ id: userId, isAdmin }).unwrap()
      toast.success(isAdmin ? t('adminGranted') : t('adminRemoved'))
      // Refetch to get updated data
      refetch()
    } catch (error) {
      console.error('Failed to update admin status:', error)
      toast.error(t('operationFailed'))
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Debounced search handler
  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-destructive">{t('failedToLoadUsers')}</p>
            <Button onClick={() => refetch()} className="mt-2">
              {t('retry')}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('userManagement')}</h1>
          <p className="text-muted-foreground">
            {t('manageUsersDescription')}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalUsers')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('admins')}</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.isAdmin).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('activeUsers')}</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => !u.isBlocked).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('blockedUsers')}</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.isBlocked).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>{t('users')}</CardTitle>
          <CardDescription>
            {t('userPaginationStatus', { 
              count: users.length, 
              total: totalUsers,
              page: currentPage,
              pages: totalPages 
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('searchUsersPlaceholder')}
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Users Table */}
          {isLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('user')}</TableHead>
                    <TableHead>{t('email')}</TableHead>
                    <TableHead>{t('status')}</TableHead>
                    <TableHead>{t('role')}</TableHead>
                    <TableHead>{t('joined')}</TableHead>
                    <TableHead className="text-right">{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback>
                              {getInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-muted-foreground">
                              ID: {user.id.slice(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        {user.isBlocked ? (
                          <Badge variant="destructive">{t('blocked')}</Badge>
                        ) : (
                          <Badge variant="default">{t('active')}</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.isAdmin ? (
                          <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                            <Shield className="h-3 w-3" />
                            {t('admin')}
                          </Badge>
                        ) : (
                          <Badge variant="outline">{t('user')}</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {/* Block/Unblock Button */}
                          <Button
                            variant={user.isBlocked ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleBlockUser(user.id, !user.isBlocked)}
                            disabled={user.id === currentUser?.id}
                            title={user.id === currentUser?.id ? t('cannotBlockYourself') : ''}
                          >
                            {user.isBlocked ? (
                              <UserCheck className="h-4 w-4 mr-1" />
                            ) : (
                              <Ban className="h-4 w-4 mr-1" />
                            )}
                            {user.isBlocked ? t('unblock') : t('block')}
                          </Button>

                          {/* Make Admin/Remove Admin Button */}
                          <Button
                            variant={user.isAdmin ? "outline" : "secondary"}
                            size="sm"
                            onClick={() => handleMakeAdmin(user.id, !user.isAdmin)}
                            title={user.id === currentUser?.id && !user.isAdmin ? t('selfAdminWarning') : ''}
                          >
                            <UserCog className="h-4 w-4 mr-1" />
                            {user.isAdmin ? t('removeAdmin') : t('makeAdmin')}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6">
                  <SmartPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    maxVisiblePages={5}
                  />
                </div>
              )}
            </>
          )}

          {/* Empty State */}
          {!isLoading && users.length === 0 && (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">
                {searchTerm ? t('noUsersFound') : t('noUsers')}
              </h3>
              <p className="text-muted-foreground mt-2">
                {searchTerm ? t('tryDifferentSearch') : t('usersWillAppearHere')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}