// frontend/src/components/common/ProtectedRoute.tsx
import { useAppSelector } from '@/app/hooks'
import { Navigate } from 'react-router-dom'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requireAdmin && !user?.isAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}