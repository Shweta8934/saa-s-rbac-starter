"use client";

import { useAuth } from "@/hooks/useAuth";
import { DashboardLayout } from "@/components/layout";
import { PageHeader, EmptyState } from "@/components/common";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react";

export default function InterviewsPage() {
  const { user } = useAuth();
  const orgId = user?.organizationId;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Interviews"
          description="Schedule and monitor interviews"
        />
        <Card>
          <CardContent className="pt-6">
            <EmptyState
              icon={Calendar}
              title="No interviews yet"
              description={
                orgId
                  ? "Interviews module is ready for dynamic API integration."
                  : "Assign organization first to manage interviews."
              }
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

