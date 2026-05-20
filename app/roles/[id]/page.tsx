"use client";

import { use } from "react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePermission } from "@/hooks/usePermission";
import { DashboardLayout } from "@/components/layout";
import { PageHeader, EmptyState } from "@/components/common";
import { RoleBadge, PermissionGate } from "@/components/rbac";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { roles } from "@/data/roles";
import { users } from "@/data/users";
import { permissions as allPermissions } from "@/data/permissions";
import { 
  ArrowLeft, 
  Shield, 
  Users, 
  Edit,
  Save,
  X,
  Lock
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default function RoleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { can } = usePermission();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const role = roles.find((r) => r.id === id);

  if (!role) {
    notFound();
  }

  // Initialize selected permissions when entering edit mode
  const handleStartEdit = () => {
    setSelectedPermissions(role.permissions);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setSelectedPermissions([]);
    setIsEditing(false);
  };

  const handleSave = () => {
    console.log("Saving permissions:", selectedPermissions);
    setIsEditing(false);
  };

  const togglePermission = (permissionId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((p) => p !== permissionId)
        : [...prev, permissionId]
    );
  };

  // Count members with this role
  const memberCount = users.filter((u) => u.roleId === role.id).length;

  // Group permissions by category
  const permissionsByCategory = allPermissions.reduce((acc, perm) => {
    if (!acc[perm.category]) {
      acc[perm.category] = [];
    }
    acc[perm.category].push(perm);
    return acc;
  }, {} as Record<string, typeof allPermissions>);

  const currentPermissions = isEditing ? selectedPermissions : role.permissions;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/roles">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <PageHeader
            title={role.name}
            description={role.description || "Manage role permissions"}
          >
            <div className="flex items-center gap-2">
              {!role.isSystemRole && can("roles:update") && (
                <>
                  {isEditing ? (
                    <>
                      <Button variant="outline" onClick={handleCancelEdit}>
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                      </Button>
                      <Button onClick={handleSave}>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </Button>
                    </>
                  ) : (
                    <Button onClick={handleStartEdit}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Permissions
                    </Button>
                  )}
                </>
              )}
            </div>
          </PageHeader>
        </div>

        {/* Role Overview */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Role Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <RoleBadge role={role} />
                {role.isSystemRole && (
                  <Badge variant="secondary" className="gap-1">
                    <Lock className="h-3 w-3" />
                    System
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <span className="text-2xl font-bold">{memberCount}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Permissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <span className="text-2xl font-bold">
                  {currentPermissions.length}
                </span>
                <span className="text-muted-foreground">
                  / {allPermissions.length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Role Warning */}
        {role.isSystemRole && (
          <Card className="border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Lock className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-200">
                    System Role
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    This is a system-defined role and cannot be modified. Create a
                    custom role if you need different permissions.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Permissions by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Permissions
            </CardTitle>
            <CardDescription>
              {isEditing
                ? "Check or uncheck permissions to modify this role"
                : "Permissions assigned to this role"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {Object.entries(permissionsByCategory).map(
                ([category, perms], index) => (
                  <div key={category}>
                    {index > 0 && <Separator className="mb-6" />}
                    <div className="space-y-4">
                      <h3 className="font-semibold capitalize text-lg">
                        {category}
                      </h3>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {perms.map((perm) => {
                          const hasPermission = currentPermissions.includes(
                            perm.id
                          );
                          return (
                              <div
                                key={perm.id}
                                className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                                  hasPermission
                                    ? "bg-primary/5 border-primary/20"
                                    : "bg-muted/30 border-transparent"
                                } ${
                                  isEditing && !role.isSystemRole
                                    ? "cursor-pointer hover:bg-muted"
                                    : ""
                                }`}
                            >
                              {isEditing && !role.isSystemRole ? (
                                <Checkbox
                                  checked={hasPermission}
                                  onClick={(e) => e.stopPropagation()}
                                  onCheckedChange={(checked) => {
                                    const shouldSelect = checked === true;
                                    if ((hasPermission && !shouldSelect) || (!hasPermission && shouldSelect)) {
                                      togglePermission(perm.id);
                                    }
                                  }}
                                  className="mt-0.5"
                                />
                              ) : (
                                <div
                                  className={`h-4 w-4 rounded-full mt-0.5 ${
                                    hasPermission
                                      ? "bg-primary"
                                      : "bg-muted-foreground/20"
                                  }`}
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <p
                                  className={`font-medium text-sm ${
                                    hasPermission
                                      ? "text-foreground"
                                      : "text-muted-foreground"
                                  }`}
                                >
                                  {perm.name}
                                </p>
                                {perm.description && (
                                  <p className="text-xs text-muted-foreground line-clamp-2">
                                    {perm.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
