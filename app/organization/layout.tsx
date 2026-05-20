'use client'

import { DashboardLayout } from '@/components/layout'
import { ProtectedRoute } from '@/components/rbac'

export default function OrganizationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute requireOrgAdmin>
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  )
}
