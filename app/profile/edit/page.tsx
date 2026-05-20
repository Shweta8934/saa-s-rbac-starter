'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { DashboardLayout } from '@/components/layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Pencil } from 'lucide-react'

export default function EditProfilePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [dbUserId, setDbUserId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      if (!user?.email) return
      const allRes = await fetch('/api/users', { cache: 'no-store' })
      if (!allRes.ok) return
      const allData = await allRes.json()
      const matched = (allData.users ?? []).find(
        (u: any) => u.email?.toLowerCase() === user.email.toLowerCase()
      )
      if (matched) {
        setDbUserId(matched.id)
        setName(matched.name ?? user.name)
        setEmail(matched.email ?? user.email)
      } else {
        setName(user.name)
        setEmail(user.email)
      }
    }
    load()
  }, [user])

  async function onSave(e: React.FormEvent) {
    e.preventDefault()
    if (!dbUserId) {
      toast.error('User record not found in database')
      return
    }
    setSaving(true)
    const res = await fetch(`/api/users/${dbUserId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, actorUserId: dbUserId }),
    })
    setSaving(false)
    if (!res.ok) {
      toast.error('Failed to update profile')
      return
    }
    toast.success('Profile updated')
    router.push('/profile')
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <Card className="max-w-xl">
          <CardHeader><CardTitle className="flex items-center gap-2"><Pencil className="h-4 w-4" />Edit Admin Profile</CardTitle></CardHeader>
          <form onSubmit={onSave}>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} required /></div>
              <div className="space-y-2"><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
              <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
            </CardContent>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  )
}
