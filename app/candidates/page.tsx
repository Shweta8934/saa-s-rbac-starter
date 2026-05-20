"use client";

import { useAuth } from "@/hooks/useAuth";
import { DashboardLayout } from "@/components/layout";
import { PageHeader, EmptyState } from "@/components/common";
import { Card, CardContent } from "@/components/ui/card";
import { UserCheck } from "lucide-react";

export default function CandidatesPage() {
  const { user } = useAuth();
  const orgId = user?.organizationId;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Candidates"
          description="Track and manage candidate pipeline"
        />
        <Card>
          <CardContent className="pt-6">
            <EmptyState
              icon={UserCheck}
              title="No candidates yet"
              description={
                orgId
                  ? "Candidates module is ready for dynamic API integration."
                  : "Assign organization first to manage candidates."
              }
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

