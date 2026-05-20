"use client";

import { ProtectedRoute } from "@/components/rbac";

export default function MembersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute
      requiredPermissions={["members:read"]}
      requireAll={false}
    >
      {children}
    </ProtectedRoute>
  );
}
