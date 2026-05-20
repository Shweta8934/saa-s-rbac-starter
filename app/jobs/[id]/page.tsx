"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { DashboardLayout } from "@/components/layout";
import { PageHeader } from "@/components/common";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Users } from "lucide-react";

export default function ProjectDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<any>(null);
  const [orgUsers, setOrgUsers] = useState<any[]>([]);
  const [orgRoles, setOrgRoles] = useState<any[]>([]);
  const [newUserId, setNewUserId] = useState("");

  async function load() {
    const res = await fetch(`/api/projects/${id}`, { cache: "no-store" });
    if (!res.ok) return;
    const data = await res.json();
    const p = data.project ?? null;
    setProject(p);
    if (p?.organizationId) {
      const [usersRes, rolesRes] = await Promise.all([
        fetch(`/api/users?organizationId=${p.organizationId}`, { cache: "no-store" }),
        fetch(`/api/roles?organizationId=${p.organizationId}`, { cache: "no-store" }),
      ]);
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setOrgUsers(usersData.users ?? []);
      }
      if (rolesRes.ok) {
        const rolesData = await rolesRes.json();
        setOrgRoles(rolesData.roles ?? []);
      }
    }
  }

  useEffect(() => {
    if (id) load();
  }, [id]);

  async function removeMember(userId: string) {
    await fetch(`/api/projects/${id}/members?userId=${userId}`, { method: "DELETE" });
    load();
  }

  async function changeMemberRole(userId: string, role: string) {
    await fetch(`/api/projects/${id}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role }),
    });
    load();
  }

  async function addMember() {
    if (!newUserId) return;
    const selectedUser = orgUsers.find((u) => u.id === newUserId);
    await fetch(`/api/projects/${id}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: newUserId, role: selectedUser?.roleId || "member" }),
    });
    setNewUserId("");
    load();
  }

  const existingUserIds = new Set((project?.members ?? []).map((m: any) => m.userId));
  const availableUsers = orgUsers.filter((u) => !existingUserIds.has(u.id));
  const roleIdSet = new Set(orgRoles.map((r) => r.id));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/jobs">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <PageHeader title={project?.name || "Project Details"} description="View project details" />
        </div>
        <Card>
          <CardHeader><CardTitle>Overview</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>Name:</strong> {project?.name}</p>
            <p><strong>Description:</strong> {project?.description || "No description"}</p>
            <p><strong>Status:</strong> {project?.status}</p>
            <p className="flex items-center gap-2"><Users className="h-4 w-4" /> {project?.members?.length || 0} members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Project Members</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Select value={newUserId} onValueChange={setNewUserId}>
                <SelectTrigger className="max-w-sm">
                  <SelectValue placeholder="Add member from organization" />
                </SelectTrigger>
                <SelectContent>
                  {availableUsers.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={addMember} disabled={!newUserId}>Add Member</Button>
            </div>

            <div className="space-y-3">
              {(project?.members ?? []).map((m: any) => (
                (() => {
                  const selectedRoleValue =
                    (m.role && roleIdSet.has(m.role) ? m.role : undefined) ||
                    (m.user?.roleId && roleIdSet.has(m.user.roleId) ? m.user.roleId : undefined) ||
                    orgRoles[0]?.id ||
                    "";
                  return (
                <div key={m.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">{m.user?.name || m.userId}</p>
                    <p className="text-sm text-muted-foreground">{m.user?.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={selectedRoleValue} onValueChange={(v) => changeMemberRole(m.userId, v)}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {orgRoles.map((r) => (
                          <SelectItem key={r.id} value={r.id}>
                            {r.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="destructive" size="sm" onClick={() => removeMember(m.userId)}>
                      Remove
                    </Button>
                  </div>
                </div>
                  );
                })()
              ))}
              {(project?.members ?? []).length === 0 && (
                <p className="text-sm text-muted-foreground">No members assigned to this project.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
