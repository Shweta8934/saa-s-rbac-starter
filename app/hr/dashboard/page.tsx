'use client'

import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/common'
import { DashboardCard } from '@/components/cards'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import { 
  Users, 
  Briefcase, 
  Calendar,
  UserCheck,
} from 'lucide-react'

export default function HRDashboardPage() {
  const { user } = useAuth()
  const [organizationName, setOrganizationName] = useState('your organization')
  const [memberCount, setMemberCount] = useState(0)
  const [projectCount, setProjectCount] = useState(0)
  const [pendingInvites, setPendingInvites] = useState(0)
  const [acceptedInvites, setAcceptedInvites] = useState(0)
  const [recentApplications, setRecentApplications] = useState<any[]>([])
  const [upcomingInterviews, setUpcomingInterviews] = useState<any[]>([])

  useEffect(() => {
    async function loadData() {
      if (!user?.organizationId) return
      const orgId = user.organizationId
      const [orgRes, usersRes, projectsRes, invitesRes] = await Promise.all([
        fetch('/api/organizations', { cache: 'no-store' }),
        fetch(`/api/users?organizationId=${orgId}&requesterUserId=${user?.id ?? ''}`, { cache: 'no-store' }),
        fetch(`/api/projects?organizationId=${orgId}&requesterUserId=${user?.id ?? ''}`, { cache: 'no-store' }),
        fetch(`/api/invites?organizationId=${orgId}&requesterUserId=${user?.id ?? ''}`, { cache: 'no-store' }),
      ])
      const orgData = await orgRes.json()
      const usersData = await usersRes.json()
      const projectsData = await projectsRes.json().catch(() => ({ projects: [] }))
      const invitesData = await invitesRes.json()

      const org = (orgData.organizations ?? []).find((o: any) => o.id === orgId)
      if (org?.name) setOrganizationName(org.name)
      setMemberCount((usersData.users ?? []).length)
      setProjectCount((projectsData.projects ?? []).length)
      const inv = invitesData.invites ?? []
      setPendingInvites(inv.filter((i: any) => i.status === 'pending').length)
      setAcceptedInvites(inv.filter((i: any) => i.status === 'accepted').length)
      setRecentApplications(
        inv
          .slice()
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 3)
      )

      // Until dedicated interviews module is wired, surface upcoming onboarding/interview-like events from invites.
      setUpcomingInterviews(
        inv
          .filter((i: any) => i.status === 'pending')
          .slice(0, 3)
          .map((i: any) => ({
            candidate: i.email,
            position: 'Invited Candidate',
            time: new Date(i.expiresAt).toLocaleDateString(),
            type: 'Screening',
          }))
      )
    }
    loadData()
    const onFocus = () => loadData()
    window.addEventListener('focus', onFocus)
    const interval = window.setInterval(loadData, 15000)
    return () => {
      window.removeEventListener('focus', onFocus)
      window.clearInterval(interval)
    }
  }, [user?.organizationId, user?.id])

  return (
    <div className="space-y-6">
      <PageHeader 
        title="HR Dashboard"
        description={`Human Resources overview for ${organizationName}`}
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Projects"
          value={projectCount}
          description="Active organization projects"
          icon={Briefcase}
        />
        <DashboardCard
          title="Total Members"
          value={memberCount}
          description="Organization members"
          icon={Users}
        />
        <DashboardCard
          title="Pending Invites"
          value={pendingInvites}
          description="Awaiting response"
          icon={Calendar}
        />
        <DashboardCard
          title="Accepted Invites"
          value={acceptedInvites}
          description="Successfully onboarded"
          icon={UserCheck}
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
                ...upcomingInterviews,
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
              {upcomingInterviews.length === 0 && (
                <p className="text-sm text-muted-foreground">No upcoming interviews yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Applications */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Candidate Invites</CardTitle>
            <CardDescription>Latest invited candidate activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                ...recentApplications.map((a: any) => ({
                  name: a.email,
                  position: 'Application / Invite',
                  status: a.status === 'accepted' ? 'Accepted' : a.status === 'pending' ? 'Pending' : a.status,
                  time: new Date(a.createdAt).toLocaleDateString(),
                })),
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
                      app.status === 'Accepted' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {app.status}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">{app.time}</p>
                  </div>
                </div>
              ))}
              {recentApplications.length === 0 && (
                <p className="text-sm text-muted-foreground">No recent applications yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}
