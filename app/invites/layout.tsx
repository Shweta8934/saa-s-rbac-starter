"use client";

import { ProtectedRoute } from "@/components/rbac";

export default function InvitesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute
      requiredPermissions={["invites:read"]}
      requireAll={false}
    >
      {children}
    </ProtectedRoute>
  );
}
