// frontend/src/pages/User/UserProfile.tsx
import { useTranslation } from 'react-i18next'
import {
  Mail,
  Calendar,
  Shield,
  Ban,
  ArrowLeft,
  User as UserIcon,
} from 'lucide-react'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { useAppSelector } from '@/app/hooks'
import { useEffect, useState } from 'react'

export default function UserProfile() {
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAppSelector((state) => state.auth)

  useEffect(() => {
    // Small delay to ensure auth state is loaded
    if (user) {
      setIsLoading(false)
      return
    }
    setIsLoading(true)
  }, [user])

  // Safe data with fallbacks
  const safeUser = user || {
    name: t('anonymousUser'),
    email: t('emailNotAvailable'),
    avatar: undefined,
    isAdmin: false,
    isBlocked: false,
    createdAt: new Date().toISOString(),
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-sm text-muted-foreground">{t('loading')}</p>
        </div>
      </div>
    )
  }

  const getInitials = (name: string = '') => {
    const cleanName = name.trim()
    if (!cleanName) return 'U'

    return cleanName
      .split(' ')
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    } catch {
      return t('unknownDate')
    }
  }

  return (
    <div className="container mx-auto py-8 max-w-md">
      <Card>
        <CardHeader className="text-center space-y-6 pb-6">
          <div className="flex justify-start">
            <Button variant="ghost" size="sm" asChild>
              <a href="/dashboard" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                {t('backToDashboard')}
              </a>
            </Button>
          </div>

          <div className="space-y-4">
            <Avatar className="h-20 w-20 mx-auto border-2 border-border">
              <AvatarImage src={safeUser.avatar} alt={safeUser.name} />
              <AvatarFallback className="text-lg font-semibold bg-primary/10">
                {getInitials(safeUser.name)}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-2">
              <CardTitle className="text-2xl">{safeUser.name}</CardTitle>

              <div className="flex justify-center gap-2">
                {safeUser.isAdmin && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    <Shield className="h-3 w-3" />
                    {t('admin')}
                  </Badge>
                )}
                {safeUser.isBlocked && (
                  <Badge
                    variant="destructive"
                    className="flex items-center gap-1"
                  >
                    <Ban className="h-3 w-3" />
                    {t('blocked')}
                  </Badge>
                )}
                {!safeUser.isAdmin && !safeUser.isBlocked && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <UserIcon className="h-3 w-3" />
                    {t('user')}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="space-y-6">
          {/* Email */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10">
                <Mail className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground">
                  {t('email')}
                </p>
                <p className="text-sm truncate">{safeUser.email}</p>
              </div>
            </div>
          </div>

          {/* Join Date */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">
                  {t('memberSince')}
                </p>
                <p className="text-sm">{formatDate(safeUser.createdAt)}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Account Status */}
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <span className="text-sm font-medium">{t('accountStatus')}</span>
            <Badge
              variant={safeUser.isBlocked ? 'destructive' : 'default'}
              className={
                !safeUser.isBlocked
                  ? 'bg-green-100 text-green-800 hover:bg-green-100'
                  : ''
              }
            >
              {safeUser.isBlocked ? t('blocked') : t('active')}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
