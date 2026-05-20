'use client'

import Link from 'next/link'
import { PageHeader } from '@/components/common'
import { DashboardCard, UsageCard } from '@/components/cards'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { useSubscription } from '@/hooks/useSubscription'
import { PlanBadge, StatusBadge } from '@/components/rbac'
import { getOrganizationById } from '@/data/organizations'
import { getPaymentsByOrganization } from '@/data/payments'
import { 
  CreditCard, 
  Receipt, 
  TrendingUp,
  DollarSign,
  ArrowRight,
  Download,
  Sparkles,
} from 'lucide-react'
import { format } from 'date-fns'

export default function BillingDashboardPage() {
  const { user } = useAuth()
  const { currentPlan, usage } = useSubscription()
  
  if (!user?.organizationId) return null

  const organization = getOrganizationById(user.organizationId)
  const payments = getPaymentsByOrganization(user.organizationId)
  const recentPayments = payments.slice(0, 5)

  if (!organization) return null

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Billing Dashboard"
        description="Manage your subscription and payment details"
      >
        <Link href="/pricing">
          <Button>
            <Sparkles className="mr-2 h-4 w-4" />
            Upgrade Plan
          </Button>
        </Link>
      </PageHeader>

      {/* Current Plan Card */}
      <Card>
        <CardContent className="flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
              <CreditCard className="h-7 w-7 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">{currentPlan?.name || 'Free'} Plan</h3>
                <PlanBadge plan={currentPlan?.name || 'Free'} />
              </div>
              <p className="text-sm text-muted-foreground">
                ${currentPlan?.price || 0}/{currentPlan?.billingCycle === 'yearly' ? 'year' : 'month'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/subscription">
              <Button variant="outline">
                Manage Subscription
              </Button>
            </Link>
            <Link href="/pricing">
              <Button>
                Upgrade <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Current Plan"
          value={currentPlan?.name || 'Free'}
          description="Active subscription"
          icon={CreditCard}
        />
        <DashboardCard
          title="Monthly Cost"
          value={`$${currentPlan?.price || 0}`}
          description="Per billing cycle"
          icon={DollarSign}
        />
        <DashboardCard
          title="Total Payments"
          value={payments.length}
          description="All time"
          icon={Receipt}
        />
        <DashboardCard
          title="Total Spent"
          value={`$${payments.filter(p => p.status === 'success').reduce((sum, p) => sum + p.amount, 0)}`}
          description="All time"
          icon={TrendingUp}
        />
      </div>

      {/* Usage Stats */}
      {usage && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Usage Overview</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <UsageCard
              title="Team Members"
              used={usage.membersUsed}
              limit={usage.membersLimit}
            />
            <UsageCard
              title="Custom Roles"
              used={usage.rolesUsed}
              limit={usage.rolesLimit}
            />
            <UsageCard
              title="Monthly Invites"
              used={usage.invitesUsedThisMonth}
              limit={usage.invitesLimit}
            />
          </div>
        </div>
      )}

      {/* Payment History */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>Recent transactions</CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </CardHeader>
        <CardContent>
          {recentPayments.length > 0 ? (
            <div className="space-y-4">
              {recentPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      payment.status === 'success' ? 'bg-emerald-100' : 'bg-red-100'
                    }`}>
                      <Receipt className={`h-5 w-5 ${
                        payment.status === 'success' ? 'text-emerald-600' : 'text-red-600'
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium">{payment.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(payment.createdAt), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold">${payment.amount}</span>
                    <StatusBadge status={payment.status} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No payment history yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
