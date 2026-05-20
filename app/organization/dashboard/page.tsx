'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useSubscription } from '@/hooks/useSubscription'
import { PageHeader } from '@/components/common'
import { DashboardCard, UsageCard } from '@/components/cards'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PlanBadge, StatusBadge } from '@/components/rbac'
import { getOrganizationById } from '@/data/organizations'
import { getUsersByOrganization } from '@/data/users'
import { getRolesByOrganization } from '@/data/roles'
import { getPendingInvitesByOrganization } from '@/data/invites'
import { getActivitiesByOrganization } from '@/data/activity'
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
  const { currentPlan, usage } = useSubscription()

  if (!user?.organizationId) return null

  const organization = getOrganizationById(user.organizationId)
  const members = getUsersByOrganization(user.organizationId)
  const roles = getRolesByOrganization(user.organizationId)
  const pendingInvites = getPendingInvitesByOrganization(user.organizationId)
  const activities = getActivitiesByOrganization(user.organizationId).slice(0, 5)

  if (!organization) return null

  return (
    <div className="space-y-6">
      <PageHeader 
        title={`${organization.name} Dashboard`}
        description="Manage your organization settings, members, and roles"
      >
        <Link href="/invites/create">
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
            <Link href="/invites/create">
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
                      <p className="text-sm">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.userName} • {format(new Date(activity.createdAt), 'MMM d, h:mm a')}
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
