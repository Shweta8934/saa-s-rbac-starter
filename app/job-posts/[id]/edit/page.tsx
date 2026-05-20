"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function EditJobPost() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [duration, setDuration] = useState("");
  const [skills, setSkills] = useState("");
  const [experienceMin, setExperienceMin] = useState("");
  const [experienceMax, setExperienceMax] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/job-posts/${id}`, { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setTitle(data.job?.title || "");
      setDescription(data.job?.description || "");
      setLocation(data.job?.location || "");
      setEmploymentType(data.job?.employmentType || "");
      setDuration(data.job?.duration || "");
      setSkills((data.job?.skills ?? []).join(", "));
      setExperienceMin(data.job?.experienceMin?.toString?.() || "");
      setExperienceMax(data.job?.experienceMax?.toString?.() || "");
      setSalaryMin(data.job?.salaryMin?.toString?.() || "");
      setSalaryMax(data.job?.salaryMax?.toString?.() || "");
    }
    if (id) load();
  }, [id]);

  async function save() {
    await fetch(`/api/job-posts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        description,
        location,
        employmentType,
        duration,
        skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
        experienceMin: experienceMin ? Number(experienceMin) : null,
        experienceMax: experienceMax ? Number(experienceMax) : null,
        salaryMin: salaryMin ? Number(salaryMin) : null,
        salaryMax: salaryMax ? Number(salaryMax) : null,
      }),
    });
    router.push(`/job-posts/${id}`);
  }

  async function remove() {
    await fetch(`/api/job-posts/${id}`, { method: 'DELETE' });
    router.push('/job-posts');
  }

  return (
    <DashboardLayout>
      <Card>
        <CardHeader><CardTitle>Edit Job Post</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
          <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" />
          <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location" />
          <Input value={employmentType} onChange={(e) => setEmploymentType(e.target.value)} placeholder="Employment Type" />
          <Input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="Duration" />
          <Input value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="Skills (comma separated)" />
          <Input type="number" value={experienceMin} onChange={(e) => setExperienceMin(e.target.value)} placeholder="Experience Min" />
          <Input type="number" value={experienceMax} onChange={(e) => setExperienceMax(e.target.value)} placeholder="Experience Max" />
          <Input type="number" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} placeholder="Salary Min" />
          <Input type="number" value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} placeholder="Salary Max" />
          <div className="flex gap-2">
            <Button onClick={save}>Save</Button>
            <Button variant="destructive" onClick={remove}>Delete</Button>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
