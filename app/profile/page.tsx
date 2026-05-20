'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { DashboardLayout } from '@/components/layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Pencil } from 'lucide-react'

export default function ProfilePage() {
  const { user } = useAuth()
  const [dbUser, setDbUser] = useState<any>(null)

  useEffect(() => {
    async function load() {
      if (!user?.email) return
      const allRes = await fetch('/api/users', { cache: 'no-store' })
      if (!allRes.ok) return
      const allData = await allRes.json()
      const matched = (allData.users ?? []).find(
        (u: any) => u.email?.toLowerCase() === user.email.toLowerCase()
      )
      if (matched) setDbUser(matched)
    }
    load()
  }, [user?.email])

  const u = dbUser || user
  if (!u) return <DashboardLayout><div className="p-6">No profile found</div></DashboardLayout>

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <Card>
          <CardHeader><CardTitle>Admin Profile</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Name:</strong> {u.name}</p>
            <p><strong>Email:</strong> {u.email}</p>
            <p><strong>Status:</strong> {u.status}</p>
            <p><strong>Organization:</strong> {u.organizationId || 'N/A'}</p>
            <p><strong>Role:</strong> {u.roleId || 'N/A'}</p>
            <Link href="/profile/edit">
              <Button className="mt-3"><Pencil className="mr-2 h-4 w-4" />Edit Profile</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
