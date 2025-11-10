// frontend/src/pages/User/UserProfile.tsx
import { useParams } from 'react-router-dom'
import { useGetUserQuery } from '@/features/users/usersApi'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FolderOpen, Users, Calendar } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { formatDate } from '@/lib/utils'

export default function UserProfile() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const { data: user, isLoading, error } = useGetUserQuery(id!)

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-destructive">
          {t('userNotFound')}
        </h2>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* User Header */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="h-16 w-16 rounded-full"
              />
            ) : (
              <span className="text-2xl font-bold text-primary">
                {user.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1">
            <CardTitle className="text-2xl">{user.name}</CardTitle>
            <CardDescription>{user.email}</CardDescription>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {t('joined')} {formatDate(user.createdAt)}
              </div>
              {user.isAdmin && (
                <Badge variant="secondary">{t('admin')}</Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('ownedInventories')}
            </CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              {t('inventoriesCreated')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('sharedInventories')}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              {t('inventoriesWithAccess')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Placeholder for future content */}
      <Card>
        <CardHeader>
          <CardTitle>{t('userActivity')}</CardTitle>
          <CardDescription>
            {t('activityDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            {t('activityComingSoon')}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}