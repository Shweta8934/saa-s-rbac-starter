'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { PageHeader } from '@/components/common'
import { DashboardCard, UsageCard } from '@/components/cards'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PlanBadge, StatusBadge } from '@/components/rbac'
import { 
  Users, 
  Shield, 
  Mail,
  TrendingUp,
  Plus,
  UserPlus,
  Settings,
  CreditCard,
} from 'lucide-react'
import { format } from 'date-fns'

export default function OrganizationDashboardPage() {
  const { user } = useAuth()
  const [organization, setOrganization] = useState<any>(null)
  const [members, setMembers] = useState<any[]>([])
  const [roles, setRoles] = useState<any[]>([])
  const [invites, setInvites] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [currentPlan, setCurrentPlan] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const orgId = user?.organizationId

  useEffect(() => {
    async function loadDashboard() {
      if (!orgId) {
        setError('No organization assigned to this user.')
        setIsLoading(false)
        return
      }
      try {
        setIsLoading(true)
        setError(null)
        const [orgRes, membersRes, rolesRes, invitesRes, activitiesRes, subRes] =
          await Promise.all([
            fetch('/api/organizations'),
            fetch(`/api/users?organizationId=${orgId}`),
            fetch(`/api/roles?organizationId=${orgId}`),
            fetch(`/api/invites?organizationId=${orgId}`),
            fetch(`/api/activities?organizationId=${orgId}&limit=5`),
            fetch(`/api/subscriptions/current?organizationId=${orgId}`),
          ])

        const orgData = await orgRes.json()
        const membersData = await membersRes.json()
        const rolesData = await rolesRes.json()
        const invitesData = await invitesRes.json()
        const activitiesData = await activitiesRes.json()
        const subData = await subRes.json()

        const allOrganizations = orgData.organizations ?? []
        const resolvedOrganization =
          allOrganizations.find((o: any) => o.id === orgId) ?? allOrganizations[0] ?? null

        if (!resolvedOrganization) {
          setError('No organizations found in database.')
          setOrganization(null)
        } else {
          setOrganization(resolvedOrganization)
        }
        setMembers(membersData.users ?? [])
        setRoles((rolesData.roles ?? []).filter((r: any) => r.organizationId === orgId))
        setInvites(invitesData.invites ?? [])
        setActivities(activitiesData.activities ?? [])
        setCurrentPlan(subData.plan ?? null)
      } catch (e) {
        console.error('[ORG_DASHBOARD][LOAD_FAIL]', e)
        setError('Failed to load dashboard data.')
      } finally {
        setIsLoading(false)
      }
    }
    loadDashboard()
  }, [orgId])

  const pendingInvites = useMemo(
    () => invites.filter((i) => i.status === 'pending'),
    [invites]
  )
  const usage = useMemo(
    () => ({
      membersUsed: members.length,
      membersLimit: currentPlan?.limits?.members ?? -1,
      rolesUsed: roles.length,
      rolesLimit: currentPlan?.limits?.roles ?? -1,
      invitesUsedThisMonth: pendingInvites.length,
      invitesLimit: currentPlan?.limits?.invitesPerMonth ?? -1,
    }),
    [currentPlan, members.length, roles.length, pendingInvites.length]
  )

  if (isLoading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading dashboard...</div>
  }

  if (error) {
    return <div className="p-6 text-sm text-destructive">{error}</div>
  }

  if (!organization) {
    return <div className="p-6 text-sm text-muted-foreground">No organization data available.</div>
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title={`${organization.name} Dashboard`}
        description="Manage your organization settings, members, and roles"
      >
        <Link href="/invites/send">
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Invite Member
          </Button>
        </Link>
      </PageHeader>

      {/* Organization Info Card */}
      <Card>
        <CardContent className="flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground text-xl font-bold">
              {organization.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-lg font-semibold">{organization.name}</h3>
              <p className="text-sm text-muted-foreground">{organization.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <PlanBadge plan={currentPlan?.name || 'Free'} />
            <StatusBadge status={organization.status} />
            <Link href="/settings">
              <Button variant="outline" size="sm">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Total Members"
          value={members.length}
          description="Active team members"
          icon={Users}
        />
        <DashboardCard
          title="Custom Roles"
          value={roles.length}
          description="Defined roles"
          icon={Shield}
        />
        <DashboardCard
          title="Pending Invites"
          value={pendingInvites.length}
          description="Awaiting response"
          icon={Mail}
        />
        <DashboardCard
          title="Current Plan"
          value={currentPlan?.name || 'Free'}
          description={`$${currentPlan?.price || 0}/${currentPlan?.billingCycle === 'yearly' ? 'yr' : 'mo'}`}
          icon={CreditCard}
        />
      </div>

      {/* Usage Stats */}
      {usage && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <UsageCard
            title="Members"
            used={usage.membersUsed}
            limit={usage.membersLimit}
          />
          <UsageCard
            title="Roles"
            used={usage.rolesUsed}
            limit={usage.rolesLimit}
          />
          <UsageCard
            title="Monthly Invites"
            used={usage.invitesUsedThisMonth}
            limit={usage.invitesLimit}
          />
        </div>
      )}

      {/* Quick Actions & Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common management tasks</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Link href="/invites/send">
              <Button variant="outline" className="w-full justify-start">
                <UserPlus className="mr-2 h-4 w-4" />
                Invite New Member
              </Button>
            </Link>
            <Link href="/roles">
              <Button variant="outline" className="w-full justify-start">
                <Shield className="mr-2 h-4 w-4" />
                Manage Roles
              </Button>
            </Link>
            <Link href="/members">
              <Button variant="outline" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                View All Members
              </Button>
            </Link>
            <Link href="/subscription">
              <Button variant="outline" className="w-full justify-start">
                <CreditCard className="mr-2 h-4 w-4" />
                Manage Subscription
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest organization events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.length > 0 ? (
                activities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{activity.details}</p>
                      <p className="text-xs text-muted-foreground">
                        {(activity.userId || 'system')} • {format(new Date(activity.createdAt), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No recent activity
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
