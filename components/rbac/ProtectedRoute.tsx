'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { usePermission } from '@/hooks/usePermission'
import type { Module, Action } from '@/types/rbac'
import { Spinner } from '@/components/ui/spinner'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredPermissions?: { module: Module; action: Action }[]
  requireSuperAdmin?: boolean
  requireOrgAdmin?: boolean
  redirectTo?: string
}

export function ProtectedRoute({
  children,
  requiredPermissions,
  requireSuperAdmin = false,
  requireOrgAdmin = false,
  redirectTo = '/access-denied',
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const { hasAllPermissions, isSuperAdmin, isOrgAdmin } = usePermission()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    // Check super admin requirement
    if (requireSuperAdmin && !isSuperAdmin) {
      router.push(redirectTo)
      return
    }

    // Check org admin requirement
    if (requireOrgAdmin && !isOrgAdmin && !isSuperAdmin) {
      router.push(redirectTo)
      return
    }

    // Check specific permissions
    if (requiredPermissions && !isSuperAdmin) {
      if (!hasAllPermissions(requiredPermissions)) {
        router.push(redirectTo)
        return
      }
    }
  }, [
    isLoading,
    isAuthenticated,
    isSuperAdmin,
    isOrgAdmin,
    hasAllPermissions,
    requiredPermissions,
    requireSuperAdmin,
    requireOrgAdmin,
    redirectTo,
    router,
  ])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}
