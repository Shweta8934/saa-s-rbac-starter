"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Spinner } from "@/components/ui/spinner";

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    // Redirect based on role
    if (user?.roleId) {
      // Super Admin goes to super admin dashboard
      if (user.roleId === "role_super_admin") {
        router.replace("/super-admin/dashboard");
        return;
      }

      // Organization Admin
      if (user.roleId === "role_org_admin") {
        router.replace("/organization/dashboard");
        return;
      }

      // HR Manager
      if (user.roleId === "role_hr_manager") {
        router.replace("/hr/dashboard");
        return;
      }

      // Recruiter
      if (user.roleId === "role_recruiter") {
        router.replace("/recruiter/dashboard");
        return;
      }

      // Developer
      if (user.roleId === "role_developer") {
        router.replace("/developer/dashboard");
        return;
      }

      // Billing Admin
      if (user.roleId === "role_billing_admin") {
        router.replace("/billing/dashboard");
        return;
      }

      // Default: Member dashboard
      router.replace("/member/dashboard");
    }
  }, [user, isLoading, isAuthenticated, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Spinner className="h-8 w-8 mx-auto" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
