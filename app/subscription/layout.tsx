"use client";

import { ProtectedRoute } from "@/components/rbac";

export default function SubscriptionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute
      requiredPermissions={["billing:read"]}
      requireAll={false}
    >
      {children}
    </ProtectedRoute>
  );
}
