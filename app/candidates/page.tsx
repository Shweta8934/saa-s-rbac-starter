"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { DashboardLayout } from "@/components/layout";
import { PageHeader, EmptyState } from "@/components/common";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserCheck } from "lucide-react";

export default function CandidatesPage() {
  const { user } = useAuth();
  const orgId = user?.organizationId;
  const [rows, setRows] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [sendingId, setSendingId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!orgId) return;
      const jobsRes = await fetch(`/api/job-posts?organizationId=${orgId}`, { cache: "no-store" });
      const jobsData = await jobsRes.json().catch(() => ({ jobs: [] }));
      const jobs = jobsData.jobs ?? [];
      const appLists = await Promise.all(
        jobs.map((j: any) =>
          fetch(`/api/job-posts/${j.id}/applications`, { cache: "no-store" })
            .then((r) => r.json().catch(() => ({ applications: [] })))
            .then((d) => (d.applications ?? []).map((a: any) => ({ ...a, jobTitle: j.title, jobId: j.id })))
        )
      );
      setRows(appLists.flat());
    }
    load();
  }, [orgId]);

  const filtered = useMemo(
    () =>
      rows.filter((r) =>
        `${r.fullName} ${r.email} ${r.jobTitle}`.toLowerCase().includes(query.toLowerCase())
      ),
    [rows, query]
  );

  async function sendCandidateMail(candidate: any, type: "interview" | "test") {
    setSendingId(`${candidate.id}:${type}`);
    const res = await fetch("/api/candidates/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: candidate.email,
        candidateName: candidate.fullName,
        jobTitle: candidate.jobTitle,
        type,
        actorName: user?.name,
        organizationName: user?.organizationId || "Organization",
      }),
    });
    setSendingId(null);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err.error || "Failed to send mail");
      return;
    }
    alert(`${type === "interview" ? "Interview" : "Test"} mail sent`);
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Candidates"
          description="Track and manage candidate applications"
        />
        <Card>
          <CardContent className="pt-6">
            {!orgId ? (
              <EmptyState
                icon={UserCheck}
                title="No candidates yet"
                description="Assign organization first to manage candidates."
              />
            ) : rows.length === 0 ? (
              <EmptyState
                icon={UserCheck}
                title="No candidates yet"
                description="No applications found for your organization's job posts."
              />
            ) : (
              <div className="space-y-4">
                <Input
                  placeholder="Search by name, email, job..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Applicant</TableHead>
                        <TableHead>Job</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Experience</TableHead>
                        <TableHead>Resume</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((a) => (
                        <TableRow key={a.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{a.fullName}</p>
                              <p className="text-xs text-muted-foreground">{a.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>{a.jobTitle}</TableCell>
                          <TableCell>{a.status}</TableCell>
                          <TableCell>{a.yearsExperience ?? "-"}y</TableCell>
                          <TableCell>
                            {a.resumePath ? (
                              <a className="underline" href={a.resumePath} target="_blank" rel="noreferrer">View</a>
                            ) : "-"}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={sendingId === `${a.id}:interview`}
                                onClick={() => sendCandidateMail(a, "interview")}
                              >
                                {sendingId === `${a.id}:interview` ? "Sending..." : "Interview"}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={sendingId === `${a.id}:test`}
                                onClick={() => sendCandidateMail(a, "test")}
                              >
                                {sendingId === `${a.id}:test` ? "Sending..." : "Test"}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
