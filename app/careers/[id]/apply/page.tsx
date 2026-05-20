"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function CareerApplyPage() {
  const { id } = useParams<{ id: string }>();
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const res = await fetch(`/api/job-posts/${id}/applications`, { method: 'POST', body: form });
    setLoading(false);
    if (!res.ok) {
      alert('Failed to apply');
      return;
    }
    setOk(true);
  }

  if (ok) return <div className="max-w-2xl mx-auto p-6">Application submitted successfully.</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Card>
        <CardHeader><CardTitle>Apply for Job</CardTitle></CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={submit}>
            <div><Label>Full Name *</Label><Input name="fullName" required /></div>
            <div><Label>Email *</Label><Input type="email" name="email" required /></div>
            <div><Label>Phone</Label><Input name="phone" /></div>
            <div><Label>Location</Label><Input name="location" /></div>
            <div><Label>Years of Experience</Label><Input type="number" name="yearsExperience" /></div>
            <div><Label>Current Company</Label><Input name="currentCompany" /></div>
            <div><Label>Expected CTC</Label><Input name="expectedCtc" /></div>
            <div><Label>Notice Period</Label><Input name="noticePeriod" /></div>
            <div><Label>LinkedIn URL</Label><Input name="linkedinUrl" /></div>
            <div><Label>Portfolio URL</Label><Input name="portfolioUrl" /></div>
            <div><Label>Cover Letter</Label><Textarea name="coverLetter" rows={4} /></div>
            <div><Label>Resume</Label><Input type="file" name="resume" accept=".pdf,.doc,.docx" /></div>
            <Button type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Submit Application'}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
