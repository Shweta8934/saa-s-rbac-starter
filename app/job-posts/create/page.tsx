"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { DashboardLayout } from "@/components/layout";
import { PageHeader } from "@/components/common";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function CreateJobPostPage() {
  const router = useRouter();
  const { user } = useAuth();
  const orgId = user?.organizationId;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [experience, setExperience] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function createJob() {
    setError("");
    if (!orgId) {
      setError("Organization not found for current user");
      return;
    }
    if (!title.trim() || !description.trim()) {
      setError("Title and description are required");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/job-posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        organizationId: orgId,
        title,
        description,
        location,
        experience,
        createdBy: user?.id,
      }),
    });

    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Failed to create job");
      return;
    }

    router.push("/job-posts");
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader title="Create Job Post" description="Create a new job opening" />

        <Card>
          <CardHeader><CardTitle>Job Details</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Job title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Input placeholder="Description (min 10 chars)" value={description} onChange={(e) => setDescription(e.target.value)} />
            <Input placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
            <Input placeholder="Experience" value={experience} onChange={(e) => setExperience(e.target.value)} />

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-2">
              <Button onClick={createJob} disabled={loading}>{loading ? "Creating..." : "Create Job"}</Button>
              <Button variant="outline" onClick={() => router.push("/job-posts")}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
