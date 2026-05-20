'use client'

import { useEffect, useMemo, useState } from 'react'
import { PageHeader } from '@/components/common'
import { DashboardCard } from '@/components/cards'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/hooks/useAuth'
import { getOrganizationById } from '@/data/organizations'
import { Users, Target, Send, CheckCircle } from 'lucide-react'

export default function RecruiterDashboardPage() {
  const { user } = useAuth()
  const organization = user?.organizationId ? getOrganizationById(user.organizationId) : null
  const orgId = user?.organizationId
  const [jobsCount, setJobsCount] = useState(0)
  const [applications, setApplications] = useState<any[]>([])

  useEffect(() => {
    async function load() {
      if (!orgId) return
      const jobsRes = await fetch(`/api/job-posts?organizationId=${orgId}`, { cache: 'no-store' })
      const jobsData = await jobsRes.json().catch(() => ({ jobs: [] }))
      const jobs = jobsData.jobs ?? []
      setJobsCount(jobs.length)

      const appLists = await Promise.all(
        jobs.map((j: any) => fetch(`/api/job-posts/${j.id}/applications`, { cache: 'no-store' }).then((r) => r.json().catch(() => ({ applications: [] }))))
      )
      const all = appLists.flatMap((x: any) => x.applications ?? [])
      setApplications(all)
    }
    load()
  }, [orgId])

  const pipeline = useMemo(() => {
    const by = (s: string) => applications.filter((a) => a.status === s).length
    return [
      { stage: 'Applied', count: by('applied'), color: 'bg-blue-500' },
      { stage: 'Screening', count: by('screening'), color: 'bg-amber-500' },
      { stage: 'Interview', count: by('interview'), color: 'bg-purple-500' },
      { stage: 'Offer', count: by('offer'), color: 'bg-emerald-500' },
      { stage: 'Hired', count: by('hired'), color: 'bg-green-500' },
    ]
  }, [applications])
  const total = Math.max(1, applications.length)

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
          value={applications.length}
          description="In pipeline"
          icon={Users}
        />
        <DashboardCard
          title="Open Positions"
          value={jobsCount}
          description="Currently hiring"
          icon={Target}
        />
        <DashboardCard
          title="New Applications"
          value={applications.filter((a) => a.status === 'applied').length}
          description="Need review"
          icon={Send}
        />
        <DashboardCard
          title="Offers Made"
          value={applications.filter((a) => a.status === 'offer').length}
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
                <Progress value={(stage.count / total) * 100} className={`h-2 [&>div]:${stage.color}`} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
