"use client";

import { ProtectedRoute } from "@/components/rbac";

export default function SubscriptionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requiredPermissions={[{ module: "billing", action: "view" }]}>
      {children}
    </ProtectedRoute>
  );
}
