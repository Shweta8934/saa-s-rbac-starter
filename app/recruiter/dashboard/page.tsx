'use client'

import { PageHeader } from '@/components/common'
import { DashboardCard } from '@/components/cards'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/hooks/useAuth'
import { getOrganizationById } from '@/data/organizations'
import { 
  Users, 
  Target, 
  Send,
  CheckCircle,
  Clock,
  UserPlus,
} from 'lucide-react'

export default function RecruiterDashboardPage() {
  const { user } = useAuth()
  const organization = user?.organizationId ? getOrganizationById(user.organizationId) : null

  const pipeline = [
    { stage: 'Applied', count: 45, color: 'bg-blue-500' },
    { stage: 'Screening', count: 28, color: 'bg-amber-500' },
    { stage: 'Interview', count: 12, color: 'bg-purple-500' },
    { stage: 'Offer', count: 4, color: 'bg-emerald-500' },
    { stage: 'Hired', count: 2, color: 'bg-green-500' },
  ]

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Recruiter Dashboard"
        description={`Recruitment pipeline for ${organization?.name || 'your organization'}`}
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Active Candidates"
          value={89}
          description="In pipeline"
          icon={Users}
        />
        <DashboardCard
          title="Open Positions"
          value={8}
          description="Currently hiring"
          icon={Target}
        />
        <DashboardCard
          title="Outreach Sent"
          value={156}
          description="This month"
          icon={Send}
        />
        <DashboardCard
          title="Offers Made"
          value={4}
          description="Pending response"
          icon={CheckCircle}
        />
      </div>

      {/* Pipeline Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Recruitment Pipeline</CardTitle>
          <CardDescription>Candidate progression through stages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pipeline.map((stage) => (
              <div key={stage.stage} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{stage.stage}</span>
                  <span className="text-sm text-muted-foreground">{stage.count} candidates</span>
                </div>
                <Progress value={(stage.count / 45) * 100} className={`h-2 [&>div]:${stage.color}`} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Candidates to Contact */}
        <Card>
          <CardHeader>
            <CardTitle>Candidates to Contact</CardTitle>
            <CardDescription>Awaiting outreach</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'Sarah Chen', position: 'Full Stack Developer', source: 'LinkedIn', days: 2 },
                { name: 'Mike Johnson', position: 'Product Designer', source: 'Referral', days: 1 },
                { name: 'Lisa Wang', position: 'Data Scientist', source: 'Job Board', days: 3 },
              ].map((candidate, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted font-medium">
                      {candidate.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-medium">{candidate.name}</p>
                      <p className="text-sm text-muted-foreground">{candidate.position}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{candidate.source}</p>
                    <div className="flex items-center gap-1 text-xs text-amber-600">
                      <Clock className="h-3 w-3" />
                      {candidate.days}d waiting
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Tasks</CardTitle>
            <CardDescription>{"Today's priorities"}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { task: 'Review 5 new applications', time: '9:00 AM', completed: false },
                { task: 'Phone screen with David Lee', time: '11:00 AM', completed: false },
                { task: 'Send offer letter to Alice Kim', time: '2:00 PM', completed: false },
                { task: 'Update job descriptions', time: '4:00 PM', completed: false },
              ].map((task, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
                  <input type="checkbox" className="h-4 w-4 rounded border-gray-300" />
                  <div className="flex-1">
                    <p className="text-sm">{task.task}</p>
                    <p className="text-xs text-muted-foreground">{task.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button variant="outline">
            <UserPlus className="mr-2 h-4 w-4" />
            Add Candidate
          </Button>
          <Button variant="outline">
            <Send className="mr-2 h-4 w-4" />
            Bulk Outreach
          </Button>
          <Button variant="outline">
            <Target className="mr-2 h-4 w-4" />
            Post New Job
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
