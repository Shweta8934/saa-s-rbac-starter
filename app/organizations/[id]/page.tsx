'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { PageHeader } from '@/components/common'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/rbac'
import { ArrowLeft, Edit, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

type Org = {
  id: string
  name: string
  email: string
  industry: string
  status: 'active' | 'inactive' | 'suspended'
  description?: string
  createdAt: string
}

export default function OrganizationDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = params.id
  const [org, setOrg] = useState<Org | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/organizations/${id}`, { cache: 'no-store' })
      if (!res.ok) {
        router.push('/organizations')
        return
      }
      const data = await res.json()
      setOrg(data.organization)
      setLoading(false)
    }
    if (id) load()
  }, [id, router])

  async function onDelete() {
    const ok = window.confirm('Delete this organization?')
    if (!ok) return
    const res = await fetch(`/api/organizations/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      toast.error('Delete failed')
      return
    }
    toast.success('Organization deleted')
    router.push('/organizations')
  }

  if (loading) return <div className="p-6">Loading...</div>
  if (!org) return null

  return (
    <div className="space-y-6">
      <PageHeader title={org.name} description={org.description || 'Organization details'}>
        <Link href="/organizations"><Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" />Back</Button></Link>
        <Link href={`/organizations/${id}/edit`}><Button><Edit className="mr-2 h-4 w-4" />Edit</Button></Link>
        <Button variant="destructive" onClick={onDelete}><Trash2 className="mr-2 h-4 w-4" />Delete</Button>
      </PageHeader>

      <Card>
        <CardContent className="p-6 space-y-3">
          <div><span className="text-muted-foreground">Email:</span> {org.email}</div>
          <div><span className="text-muted-foreground">Industry:</span> <span className="capitalize">{org.industry}</span></div>
          <div><span className="text-muted-foreground">Status:</span> <StatusBadge status={org.status} /></div>
          <div><span className="text-muted-foreground">Created:</span> {format(new Date(org.createdAt), 'MMM d, yyyy')}</div>
          {org.description && <div><span className="text-muted-foreground">Description:</span> {org.description}</div>}
        </CardContent>
      </Card>
    </div>
  )
}
