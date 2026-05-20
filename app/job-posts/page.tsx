"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { DashboardLayout } from "@/components/layout";
import { PageHeader } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function JobPostsPage() {
  const { user } = useAuth();
  const orgId = user?.organizationId;
  const [jobs, setJobs] = useState<any[]>([]);

  async function load() {
    if (!orgId) return;
    const res = await fetch(`/api/job-posts?organizationId=${orgId}`, { cache: "no-store" });
    const data = await res.json().catch(() => ({ jobs: [] }));
    setJobs(data.jobs ?? []);
  }

  useEffect(() => {
    load();
  }, [orgId]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader title="Job Posts" description="All organization job posts">
          <Button asChild>
            <Link href="/job-posts/create">Create Job</Link>
          </Button>
        </PageHeader>

        <div className="grid gap-4 md:grid-cols-2">
          {jobs.map((job) => (
            <Card key={job.id}>
              <CardHeader><CardTitle>{job.title}</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">{job.description}</p>
                <p className="text-xs text-muted-foreground">Location: {job.location || "-"}</p>
                <p className="text-xs text-muted-foreground">Experience: {job.experience || "-"}</p>
                <div className="flex gap-2">
                  <Button asChild variant="outline"><Link href={`/job-posts/${job.id}`}>View</Link></Button>
                  <Button asChild variant="outline"><Link href={`/job-posts/${job.id}/edit`}>Edit</Link></Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {jobs.length === 0 && (
            <Card>
              <CardContent className="pt-6 text-sm text-muted-foreground">No jobs yet.</CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
