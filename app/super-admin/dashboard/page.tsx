'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { PageHeader } from '@/components/common'
import { DashboardCard } from '@/components/cards'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatusBadge, PlanBadge } from '@/components/rbac'
import { Building2, Users, CreditCard, DollarSign, TrendingUp, Plus, ArrowRight } from 'lucide-react'

export default function SuperAdminDashboardPage() {
  const [organizations, setOrganizations] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [subsByOrg, setSubsByOrg] = useState<Record<string, any>>({})

  useEffect(() => {
    async function load() {
      const [orgRes, userRes, payRes] = await Promise.all([
        fetch('/api/organizations', { cache: 'no-store' }),
        fetch('/api/users', { cache: 'no-store' }),
        fetch('/api/payments', { cache: 'no-store' }),
      ])
      const orgData = await orgRes.json()
      const userData = await userRes.json()
      const payData = await payRes.json()
      setOrganizations(orgData.organizations ?? [])
      setUsers(userData.users ?? [])
      setPayments(payData.payments ?? [])

      const subsEntries = await Promise.all(
        (orgData.organizations ?? []).map(async (o: any) => {
          const res = await fetch(`/api/subscriptions/current?organizationId=${o.id}`, { cache: 'no-store' })
          const data = await res.json()
          return [o.id, data.subscription] as const
        })
      )
      setSubsByOrg(Object.fromEntries(subsEntries))
    }
    load()
  }, [])

  const activeOrgs = organizations.filter((o) => o.status === 'active')
  const activeSubscriptions = Object.values(subsByOrg).filter((s: any) => s?.status === 'active')
  const totalRevenue = payments.filter((p) => p.status === 'succeeded').reduce((sum, p) => sum + p.amount, 0)

  const dist = useMemo(() => {
    const map: Record<string, number> = { Free: 0, Starter: 0, Professional: 0, Enterprise: 0 }
    for (const o of organizations) {
      const planName = subsByOrg[o.id]?.plan?.name ?? 'Free'
      map[planName] = (map[planName] ?? 0) + 1
    }
    return map
  }, [organizations, subsByOrg])

  return (
    <div className="space-y-6">
      <PageHeader title="Super Admin Dashboard" description="Overview of all organizations and system metrics">
        <Link href="/organizations/create"><Button><Plus className="mr-2 h-4 w-4" />New Organization</Button></Link>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard title="Total Organizations" value={organizations.length} description={`${activeOrgs.length} active`} icon={Building2} />
        <DashboardCard title="Total Users" value={users.length} description="Across all organizations" icon={Users} />
        <DashboardCard title="Active Subscriptions" value={activeSubscriptions.length} description={`${organizations.length} total organizations`} icon={CreditCard} />
        <DashboardCard title="Monthly Revenue" value={`$${(totalRevenue / 100).toLocaleString()}`} description="From all subscriptions" icon={DollarSign} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div><CardTitle>Recent Organizations</CardTitle><CardDescription>Latest registered organizations</CardDescription></div>
            <Link href="/organizations"><Button variant="ghost" size="sm">View All <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {organizations.slice(0, 5).map((org) => (
                <div key={org.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted font-semibold">{org.name.charAt(0)}</div>
                    <div><p className="font-medium">{org.name}</p><p className="text-sm text-muted-foreground">{org.email}</p></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <PlanBadge plan={subsByOrg[org.id]?.plan?.name || 'Free'} />
                    <StatusBadge status={org.status} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Subscription Distribution</CardTitle><CardDescription>Organizations by subscription plan</CardDescription></CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-2">
              {Object.entries(dist).map(([name, count]) => (
                <div key={name} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between"><PlanBadge plan={name} /><span className="text-2xl font-bold">{count}</span></div>
                  <p className="mt-2 text-sm text-muted-foreground">{Math.round(((count as number) / Math.max(organizations.length, 1)) * 100)}% of organizations</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
