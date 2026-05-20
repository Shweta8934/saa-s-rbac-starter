'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

export default function EditOrganizationPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = params.id
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', industry: '', description: '' })

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/organizations/${id}`)
      if (!res.ok) {
        toast.error('Organization not found')
        router.push('/organizations')
        return
      }
      const data = await res.json()
      setForm({
        name: data.organization.name ?? '',
        email: data.organization.email ?? '',
        industry: data.organization.industry ?? '',
        description: data.organization.description ?? '',
      })
      setLoading(false)
    }
    if (id) load()
  }, [id, router])

  async function onSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const res = await fetch(`/api/organizations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (!res.ok) {
      toast.error('Failed to update organization')
      setSaving(false)
      return
    }
    toast.success('Organization updated')
    router.push(`/organizations/${id}`)
  }

  if (loading) return <div className="p-6">Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/organizations/${id}`}><Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" />Back</Button></Link>
        <h1 className="text-2xl font-semibold">Edit Organization</h1>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Organization Details</CardTitle>
        </CardHeader>
        <form onSubmit={onSave}>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} required /></div>
            <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})} required /></div>
            <div className="space-y-2"><Label>Industry</Label><Input value={form.industry} onChange={(e)=>setForm({...form,industry:e.target.value})} required /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})} rows={4} /></div>
            <div className="flex justify-end"><Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button></div>
          </CardContent>
        </form>
      </Card>
    </div>
  )
}
