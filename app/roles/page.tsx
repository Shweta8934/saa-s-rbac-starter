"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePermission } from "@/hooks/usePermission";
import { DashboardLayout } from "@/components/layout";
import { PageHeader, EmptyState } from "@/components/common";
import { RoleBadge, PermissionGate } from "@/components/rbac";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { permissions as allPermissions } from "@/data/permissions";
import { Role } from "@/types";
import { 
  Search, 
  MoreHorizontal, 
  Plus, 
  Shield, 
  Users, 
  Edit, 
  Trash2,
  Lock,
  Unlock
} from "lucide-react";
import Link from "next/link";
import { User } from "@/types";

export default function RolesPage() {
  const { user } = useAuth();
  const { can } = usePermission();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState("");
  const effectiveOrganizationId = user?.organizationId || selectedOrgId;

  useEffect(() => {
    async function load() {
      if (!effectiveOrganizationId) return;
      const rolesUrl = `/api/roles?organizationId=${effectiveOrganizationId}`;
      const usersUrl = `/api/users?organizationId=${effectiveOrganizationId}`;
      const [rolesRes, usersRes] = await Promise.all([
        fetch(rolesUrl, { cache: "no-store" }),
        fetch(usersUrl, { cache: "no-store" }),
      ]);
      const rolesData = await rolesRes.json();
      const usersData = await usersRes.json();
      setAllRoles(rolesData.roles ?? []);
      setAllUsers(usersData.users ?? []);
    }
    load();
  }, [effectiveOrganizationId]);

  // Filter roles by organization
  const orgRoles = allRoles.filter(
    (r) => r.organizationId === effectiveOrganizationId || r.isSystem || r.organizationId == null
  );

  // Apply search filter
  const filteredRoles = orgRoles.filter((role) =>
    role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Count members per role
  const getMemberCount = (roleId: string) => {
    return allUsers.filter((u) => u.roleId === roleId).length;
  };

  const handleDeleteRole = async (roleId: string) => {
    await fetch(`/api/roles/${roleId}?actorUserId=${user?.id ?? ""}`, {
      method: "DELETE",
    });
    setAllRoles((prev) => prev.filter((r) => r.id !== roleId));
    setIsDeleteDialogOpen(false);
    setSelectedRole(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Roles & Permissions"
          description="Manage roles and their associated permissions"
        >
          <PermissionGate permissions={["roles:create"]}>
            <Button asChild>
              <Link href="/roles/create">
                <Plus className="mr-2 h-4 w-4" />
                Create Role
              </Link>
            </Button>
          </PermissionGate>
        </PageHeader>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              All Roles ({filteredRoles.length})
            </CardTitle>
            <CardDescription>
              System roles cannot be modified. Custom roles can be tailored to your needs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="mb-6">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search roles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Roles Table */}
            {filteredRoles.length === 0 ? (
              <EmptyState
                icon={Shield}
                title="No roles found"
                description={
                  searchQuery
                    ? "Try adjusting your search"
                    : "Create custom roles to manage permissions"
                }
                action={
                  can("roles:create") ? (
                    <Button asChild>
                      <Link href="/roles/create">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Role
                      </Link>
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Role</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Members</TableHead>
                      <TableHead>Permissions</TableHead>
                      <TableHead className="w-[70px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRoles.map((role) => {
                      const memberCount = getMemberCount(role.id);
                      const permissionCount = role.permissions.length;

                      return (
                        <TableRow key={role.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div
                                className="h-9 w-9 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: `${role.color}20` }}
                              >
                                {role.isSystem ? (
                                  <Lock className="h-4 w-4" style={{ color: role.color }} />
                                ) : (
                                  <Unlock className="h-4 w-4" style={{ color: role.color }} />
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-medium">{role.name}</p>
                                  <RoleBadge role={role} size="sm" />
                                </div>
                                {role.description && (
                                  <p className="text-sm text-muted-foreground line-clamp-1">
                                    {role.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={role.isSystem ? "secondary" : "outline"}>
                              {role.isSystem ? "System" : "Custom"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span>{memberCount}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {permissionCount} permission{permissionCount !== 1 ? "s" : ""}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Actions</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link href={`/roles/${role.id}`}>
                                    <Shield className="mr-2 h-4 w-4" />
                                    View Permissions
                                  </Link>
                                </DropdownMenuItem>
                                {!role.isSystem && can("roles:update") && (
                                  <DropdownMenuItem asChild>
                                    <Link href={`/roles/${role.id}/edit`}>
                                      <Edit className="mr-2 h-4 w-4" />
                                      Edit Role
                                    </Link>
                                  </DropdownMenuItem>
                                )}
                                {!role.isSystem && can("roles:delete") && (
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => {
                                      setSelectedRole(role);
                                      setIsDeleteDialogOpen(true);
                                    }}
                                    disabled={memberCount > 0}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Role
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Permissions Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Permissions Overview</CardTitle>
            <CardDescription>
              All available permissions organized by category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Object.entries(
                allPermissions.reduce((acc, perm) => {
                  if (!acc[perm.category]) {
                    acc[perm.category] = [];
                  }
                  acc[perm.category].push(perm);
                  return acc;
                }, {} as Record<string, typeof allPermissions>)
              ).map(([category, perms]) => (
                <Card key={category}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium capitalize">
                      {category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-1.5">
                      {perms.map((perm) => (
                        <Badge
                          key={perm.id}
                          variant="secondary"
                          className="text-xs"
                        >
                          {perm.name}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Role Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Role</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the &quot;{selectedRole?.name}&quot; role?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedRole && handleDeleteRole(selectedRole.id)}
            >
              Delete Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
