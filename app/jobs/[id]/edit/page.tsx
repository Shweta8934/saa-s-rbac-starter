"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout";
import { PageHeader } from "@/components/common";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save } from "lucide-react";

export default function EditProjectPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/jobs/${id}`, { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setName(data.job?.title ?? "");
      setDescription(data.job?.description ?? "");
      setLoading(false);
    }
    if (id) load();
  }, [id]);

  async function save() {
    await fetch(`/api/jobs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), description: description.trim() }),
    });
    router.push(`/jobs/${id}`);
  }

  if (loading) return <DashboardLayout><div className="p-6">Loading...</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/jobs/${id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <PageHeader title="Edit Job" description="Update job details">
            <Button onClick={save} disabled={!name.trim()}>
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
          </PageHeader>
        </div>
        <Card>
          <CardContent className="pt-6 space-y-3">
            <div className="space-y-1">
              <Label>Job Title</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
