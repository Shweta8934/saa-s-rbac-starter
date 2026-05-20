"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { DashboardLayout } from "@/components/layout";
import { PageHeader } from "@/components/common";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ReportsPage() {
  const { user } = useAuth();
  const orgId = user?.organizationId;
  const role = user?.roleSlug;

  const [payments, setPayments] = useState<any[]>([]);
  const [subscription, setSubscription] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      if (!orgId) return;

      const [payRes, subRes, jobsRes] = await Promise.all([
        fetch(`/api/payments?organizationId=${orgId}`, { cache: "no-store" }),
        fetch(`/api/subscriptions/current?organizationId=${orgId}`, { cache: "no-store" }),
        fetch(`/api/job-posts?organizationId=${orgId}`, { cache: "no-store" }),
      ]);

      const payData = await payRes.json().catch(() => ({ payments: [] }));
      const subData = await subRes.json().catch(() => ({ subscription: null }));
      const jobsData = await jobsRes.json().catch(() => ({ jobs: [] }));

      const allJobs = jobsData.jobs ?? [];
      const appLists = await Promise.all(
        allJobs.map((j: any) =>
          fetch(`/api/job-posts/${j.id}/applications`, { cache: "no-store" })
            .then((r) => r.json().catch(() => ({ applications: [] })))
            .then((d) => d.applications ?? [])
        )
      );

      setPayments(payData.payments ?? []);
      setSubscription(subData.subscription ?? null);
      setJobs(allJobs);
      setApplications(appLists.flat());
    }

    load();
  }, [orgId]);

  const totalPaid = useMemo(
    () => payments.filter((p) => p.status === "succeeded").reduce((s, p) => s + p.amount, 0),
    [payments]
  );

  const recruiterView = (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card><CardHeader><CardTitle>Open Job Posts</CardTitle></CardHeader><CardContent>{jobs.length}</CardContent></Card>
      <Card><CardHeader><CardTitle>Total Applicants</CardTitle></CardHeader><CardContent>{applications.length}</CardContent></Card>
      <Card><CardHeader><CardTitle>Applied</CardTitle></CardHeader><CardContent>{applications.filter((a) => a.status === "applied").length}</CardContent></Card>
      <Card><CardHeader><CardTitle>Interview/Offer</CardTitle></CardHeader><CardContent>{applications.filter((a) => a.status === "interview" || a.status === "offer").length}</CardContent></Card>
    </div>
  );

  const billingView = (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card><CardHeader><CardTitle>Current Plan</CardTitle></CardHeader><CardContent>{subscription?.plan?.name || "Free"}</CardContent></Card>
      <Card><CardHeader><CardTitle>Billing Cycle</CardTitle></CardHeader><CardContent>{subscription?.plan?.billingCycle || "monthly"}</CardContent></Card>
      <Card><CardHeader><CardTitle>Total Transactions</CardTitle></CardHeader><CardContent>{payments.length}</CardContent></Card>
      <Card><CardHeader><CardTitle>Total Paid</CardTitle></CardHeader><CardContent>${(totalPaid / 100).toFixed(2)}</CardContent></Card>
    </div>
  );

  const genericView = (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card><CardHeader><CardTitle>Organization Jobs</CardTitle></CardHeader><CardContent>{jobs.length}</CardContent></Card>
      <Card><CardHeader><CardTitle>Applications</CardTitle></CardHeader><CardContent>{applications.length}</CardContent></Card>
      <Card><CardHeader><CardTitle>Payments</CardTitle></CardHeader><CardContent>{payments.length}</CardContent></Card>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader title="Reports" description="Analytics and usage insights" />
        {role === "recruiter" ? recruiterView : role === "billing" ? billingView : genericView}
      </div>
    </DashboardLayout>
  );
}
