"use client";

import { ProtectedRoute } from "@/components/rbac";

export default function PaymentsLayout({
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
