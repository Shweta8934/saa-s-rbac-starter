'use client'

import Link from 'next/link'
import { PageHeader } from '@/components/common'
import { DashboardCard } from '@/components/cards'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatusBadge, PlanBadge } from '@/components/rbac'
import { organizations } from '@/data/organizations'
import { users } from '@/data/users'
import { getSuccessfulPayments, getTotalRevenue } from '@/data/payments'
import { getRecentActivities } from '@/data/activity'
import { subscriptionPlans, organizationSubscriptions } from '@/data/subscriptions'
import { 
  Building2, 
  Users, 
  CreditCard, 
  DollarSign,
  TrendingUp,
  Plus,
  ArrowRight,
} from 'lucide-react'
import { format } from 'date-fns'

export default function SuperAdminDashboardPage() {
  const activeOrgs = organizations.filter(o => o.status === 'active')
  const activeSubscriptions = organizationSubscriptions.filter(s => s.status === 'active')
  const totalRevenue = getTotalRevenue()
  const recentActivities = getRecentActivities(5)

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Super Admin Dashboard"
        description="Overview of all organizations and system metrics"
      >
        <Link href="/organizations/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Organization
          </Button>
        </Link>
      </PageHeader>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Total Organizations"
          value={organizations.length}
          description={`${activeOrgs.length} active`}
          icon={Building2}
          trend={{ value: 12, label: 'from last month', positive: true }}
        />
        <DashboardCard
          title="Total Users"
          value={users.length}
          description="Across all organizations"
          icon={Users}
          trend={{ value: 8, label: 'from last month', positive: true }}
        />
        <DashboardCard
          title="Active Subscriptions"
          value={activeSubscriptions.length}
          description={`${organizations.length} total organizations`}
          icon={CreditCard}
        />
        <DashboardCard
          title="Monthly Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          description="From all subscriptions"
          icon={DollarSign}
          trend={{ value: 15, label: 'from last month', positive: true }}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Organizations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Organizations</CardTitle>
              <CardDescription>Latest registered organizations</CardDescription>
            </div>
            <Link href="/organizations">
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {organizations.slice(0, 5).map((org) => {
                const plan = subscriptionPlans.find(p => p.id === org.subscriptionPlanId)
                return (
                  <div key={org.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted font-semibold">
                        {org.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{org.name}</p>
                        <p className="text-sm text-muted-foreground">{org.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <PlanBadge plan={plan?.name || 'Free'} />
                      <StatusBadge status={org.status} />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>System-wide activity log</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.userName} • {format(new Date(activity.createdAt), 'MMM d, h:mm a')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plan Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Distribution</CardTitle>
          <CardDescription>Organizations by subscription plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {subscriptionPlans.map((plan) => {
              const count = organizations.filter(o => o.subscriptionPlanId === plan.id).length
              const percentage = Math.round((count / organizations.length) * 100) || 0
              return (
                <div key={plan.id} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <PlanBadge plan={plan.name} />
                    <span className="text-2xl font-bold">{count}</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {percentage}% of organizations
                  </p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
