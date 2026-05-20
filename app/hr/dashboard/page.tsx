'use client'

import { PageHeader } from '@/components/common'
import { DashboardCard } from '@/components/cards'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { getOrganizationById } from '@/data/organizations'
import { 
  Users, 
  Briefcase, 
  Calendar,
  UserCheck,
  ClipboardList,
  TrendingUp,
} from 'lucide-react'

export default function HRDashboardPage() {
  const { user } = useAuth()
  const organization = user?.organizationId ? getOrganizationById(user.organizationId) : null

  return (
    <div className="space-y-6">
      <PageHeader 
        title="HR Dashboard"
        description={`Human Resources overview for ${organization?.name || 'your organization'}`}
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Open Positions"
          value={12}
          description="Active job postings"
          icon={Briefcase}
        />
        <DashboardCard
          title="Total Candidates"
          value={156}
          description="In pipeline"
          icon={Users}
        />
        <DashboardCard
          title="Interviews Today"
          value={4}
          description="Scheduled"
          icon={Calendar}
        />
        <DashboardCard
          title="New Hires (Month)"
          value={3}
          description="This month"
          icon={UserCheck}
          trend={{ value: 50, label: 'from last month', positive: true }}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Upcoming Interviews */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Interviews</CardTitle>
            <CardDescription>{"Today's and tomorrow's schedule"}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { candidate: 'Alice Johnson', position: 'Senior Developer', time: '10:00 AM', type: 'Technical' },
                { candidate: 'Bob Smith', position: 'Product Manager', time: '2:00 PM', type: 'Cultural' },
                { candidate: 'Carol Davis', position: 'UX Designer', time: '4:30 PM', type: 'Portfolio' },
              ].map((interview, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">{interview.candidate}</p>
                    <p className="text-sm text-muted-foreground">{interview.position}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{interview.time}</p>
                    <p className="text-xs text-muted-foreground">{interview.type}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Applications */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Applications</CardTitle>
            <CardDescription>Latest candidate submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'David Wilson', position: 'Frontend Developer', status: 'New', time: '2h ago' },
                { name: 'Eva Martinez', position: 'Data Analyst', status: 'Screening', time: '5h ago' },
                { name: 'Frank Brown', position: 'DevOps Engineer', status: 'New', time: '1d ago' },
              ].map((app, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted font-medium text-sm">
                      {app.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-medium">{app.name}</p>
                      <p className="text-sm text-muted-foreground">{app.position}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      app.status === 'New' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {app.status}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">{app.time}</p>
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
          <CardDescription>Common HR tasks</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button variant="outline">
            <Briefcase className="mr-2 h-4 w-4" />
            Post New Job
          </Button>
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Schedule Interview
          </Button>
          <Button variant="outline">
            <ClipboardList className="mr-2 h-4 w-4" />
            Review Applications
          </Button>
          <Button variant="outline">
            <TrendingUp className="mr-2 h-4 w-4" />
            View Reports
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
