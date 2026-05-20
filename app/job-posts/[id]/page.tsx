"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { DashboardLayout } from "@/components/layout";
import { PageHeader } from "@/components/common";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function JobPostDetails() {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);

  async function load() {
    const [jobRes, appRes] = await Promise.all([
      fetch(`/api/job-posts/${id}`, { cache: "no-store" }),
      fetch(`/api/job-posts/${id}/applications`, { cache: "no-store" }),
    ]);
    if (jobRes.ok) {
      const jobData = await jobRes.json();
      setJob(jobData.job ?? null);
    }
    if (appRes.ok) {
      const appData = await appRes.json();
      setApplications(appData.applications ?? []);
    }
  }

  useEffect(() => { if (id) load(); }, [id]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader title={job?.title || "Job Post"} description="Applicants for this job only" />

        <Card>
          <CardHeader><CardTitle>Share Apply Link</CardTitle></CardHeader>
          <CardContent>
            <a className="underline" href={`${typeof window !== 'undefined' ? window.location.origin : ''}/careers/${id}/apply`} target="_blank" rel="noreferrer">
              {`${typeof window !== 'undefined' ? window.location.origin : ''}/careers/${id}/apply`}
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Applicants ({applications.length})</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {applications.map((a) => (
              <div key={a.id} className="rounded border p-3 text-sm">
                <p><strong>{a.fullName}</strong> ({a.email})</p>
                <p>Status: {a.status}</p>
                <p>Phone: {a.phone || '-'}</p>
                <p>Experience: {a.yearsExperience ?? '-'} years</p>
                {a.resumePath && <a href={a.resumePath} target="_blank" rel="noreferrer" className="underline">View Resume</a>}
              </div>
            ))}
            {applications.length === 0 && <p className="text-sm text-muted-foreground">No applicants yet.</p>}
          </CardContent>
        </Card>

        <Button asChild variant="outline"><Link href="/job-posts">Back</Link></Button>
      </div>
    </DashboardLayout>
  );
}
