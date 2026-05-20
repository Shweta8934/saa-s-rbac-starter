"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { usePermission } from "@/hooks/usePermission";
import { DashboardLayout } from "@/components/layout";
import { PageHeader } from "@/components/common";
import { SubscriptionCard } from "@/components/cards";
import { PermissionGate, PlanBadge } from "@/components/rbac";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { payments } from "@/data/payments";
import { PLAN_FEATURES, PLAN_NAMES, PLAN_PRICING } from "@/lib/constants";
import { PlanTier } from "@/types";
import { 
  CreditCard, 
  Download, 
  Zap,
  Check,
  ArrowRight,
  Calendar,
  Receipt,
  AlertTriangle
} from "lucide-react";
import Link from "next/link";

export default function SubscriptionPage() {
  const { organization } = useAuth();
  const { currentPlan, usage } = useSubscription();
  const { can } = usePermission();
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanTier | null>(null);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const planTier: PlanTier =
    currentPlan?.slug === "starter" ||
    currentPlan?.slug === "professional" ||
    currentPlan?.slug === "enterprise"
      ? currentPlan.slug
      : "free";
  const isTrialing = false;
  const daysUntilRenewal = 0;

  // Get recent payments for this organization
  const orgPayments = payments
    .filter((p) => p.organizationId === organization?.id)
    .slice(0, 5);

  const handleUpgrade = (newPlan: PlanTier) => {
    setSelectedPlan(newPlan);
    setIsUpgradeDialogOpen(true);
  };

  const confirmUpgrade = () => {
    console.log("Upgrading to plan:", selectedPlan);
    setIsUpgradeDialogOpen(false);
    setSelectedPlan(null);
  };

  const handleCancelSubscription = () => {
    console.log("Cancelling subscription");
    setIsCancelDialogOpen(false);
  };

  const allPlans: PlanTier[] = ["free", "starter", "professional", "enterprise"];
  const currentPlanIndex = allPlans.indexOf(planTier);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Subscription"
          description="Manage your subscription plan and billing"
        />

        {/* Current Plan Overview */}
        <div className="grid gap-6 md:grid-cols-2">
          <SubscriptionCard
            planName={PLAN_NAMES[planTier]}
            price={PLAN_PRICING[planTier].monthly}
            billingCycle="monthly"
            features={[
              `${PLAN_FEATURES[planTier].members === -1 ? "Unlimited" : PLAN_FEATURES[planTier].members} team members`,
              `${PLAN_FEATURES[planTier].projects === -1 ? "Unlimited" : PLAN_FEATURES[planTier].projects} projects`,
              `${PLAN_FEATURES[planTier].storage === -1 ? "Unlimited" : `${PLAN_FEATURES[planTier].storage / 1024}GB`} storage`,
              PLAN_FEATURES[planTier].customRoles ? "Custom roles" : "Standard roles",
              PLAN_FEATURES[planTier].advancedAnalytics ? "Advanced analytics" : "Basic analytics",
            ]}
            isCurrent
          />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Usage This Period
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {usage && (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Team Members</span>
                      <span className="font-medium">
                        {usage.members.used} / {usage.members.limit === -1 ? "Unlimited" : usage.members.limit}
                      </span>
                    </div>
                    {usage.members.limit !== -1 && (
                      <Progress
                        value={(usage.members.used / usage.members.limit) * 100}
                        className="h-2"
                      />
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Projects</span>
                      <span className="font-medium">
                        {usage.projects.used} / {usage.projects.limit === -1 ? "Unlimited" : usage.projects.limit}
                      </span>
                    </div>
                    {usage.projects.limit !== -1 && (
                      <Progress
                        value={(usage.projects.used / usage.projects.limit) * 100}
                        className="h-2"
                      />
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Storage</span>
                      <span className="font-medium">
                        {(usage.storage.used / 1024).toFixed(1)} GB / {usage.storage.limit === -1 ? "Unlimited" : `${usage.storage.limit / 1024} GB`}
                      </span>
                    </div>
                    {usage.storage.limit !== -1 && (
                      <Progress
                        value={(usage.storage.used / usage.storage.limit) * 100}
                        className="h-2"
                      />
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>API Calls</span>
                      <span className="font-medium">
                        {usage.apiCalls.used.toLocaleString()} / {usage.apiCalls.limit === -1 ? "Unlimited" : usage.apiCalls.limit.toLocaleString()}
                      </span>
                    </div>
                    {usage.apiCalls.limit !== -1 && (
                      <Progress
                        value={(usage.apiCalls.used / usage.apiCalls.limit) * 100}
                        className="h-2"
                      />
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Trial Warning */}
        {isTrialing && (
          <Card className="border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-amber-800 dark:text-amber-200">
                    Trial Period Active
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Your trial ends in {daysUntilRenewal} days. Upgrade now to keep your data and features.
                  </p>
                </div>
                <PermissionGate permissions={["billing:update"]}>
                  <Button onClick={() => handleUpgrade("professional")}>
                    Upgrade Now
                  </Button>
                </PermissionGate>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Available Plans */}
        <Card>
          <CardHeader>
            <CardTitle>Available Plans</CardTitle>
            <CardDescription>
              Choose the plan that best fits your team&apos;s needs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {allPlans.map((tier, index) => {
                const isCurrentPlan = tier === planTier;
                const isUpgrade = index > currentPlanIndex;
                const isDowngrade = index < currentPlanIndex;
                const pricing = PLAN_PRICING[tier];
                const features = PLAN_FEATURES[tier];

                return (
                  <Card
                    key={tier}
                    className={`relative ${
                      isCurrentPlan ? "border-primary ring-1 ring-primary" : ""
                    }`}
                  >
                    {isCurrentPlan && (
                      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                        Current Plan
                      </Badge>
                    )}
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {PLAN_NAMES[tier]}
                        <PlanBadge plan={tier} />
                      </CardTitle>
                      <CardDescription>
                        <span className="text-2xl font-bold text-foreground">
                          ${pricing.monthly}
                        </span>
                        <span className="text-muted-foreground">/month</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-500" />
                          {features.members === -1
                            ? "Unlimited"
                            : features.members}{" "}
                          team members
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-500" />
                          {features.projects === -1
                            ? "Unlimited"
                            : features.projects}{" "}
                          projects
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-500" />
                          {features.storage === -1
                            ? "Unlimited"
                            : `${features.storage / 1024}GB`}{" "}
                          storage
                        </li>
                        {features.customRoles && (
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            Custom roles
                          </li>
                        )}
                        {features.advancedAnalytics && (
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            Advanced analytics
                          </li>
                        )}
                        {features.prioritySupport && (
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            Priority support
                          </li>
                        )}
                        {features.sso && (
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            SSO
                          </li>
                        )}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <PermissionGate
                        permissions={["billing:update"]}
                        fallback={
                          <Button className="w-full" disabled>
                            {isCurrentPlan ? "Current Plan" : "Contact Admin"}
                          </Button>
                        }
                      >
                        {isCurrentPlan ? (
                          <Button className="w-full" disabled>
                            Current Plan
                          </Button>
                        ) : isUpgrade ? (
                          <Button
                            className="w-full"
                            onClick={() => handleUpgrade(tier)}
                          >
                            Upgrade
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => handleUpgrade(tier)}
                          >
                            Downgrade
                          </Button>
                        )}
                      </PermissionGate>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Payment History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Payment History
            </CardTitle>
            <CardDescription>
              Recent transactions and invoices
            </CardDescription>
          </CardHeader>
          <CardContent>
            {orgPayments.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No payment history yet
              </p>
            ) : (
              <div className="space-y-4">
                {orgPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          payment.status === "succeeded"
                            ? "bg-green-100 dark:bg-green-900/30"
                            : payment.status === "pending"
                            ? "bg-yellow-100 dark:bg-yellow-900/30"
                            : "bg-red-100 dark:bg-red-900/30"
                        }`}
                      >
                        {payment.status === "succeeded" ? (
                          <Check className="h-5 w-5 text-green-600" />
                        ) : payment.status === "pending" ? (
                          <Calendar className="h-5 w-5 text-yellow-600" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{payment.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium">
                          ${(payment.amount / 100).toFixed(2)}
                        </p>
                        <Badge
                          variant={
                            payment.status === "succeeded"
                              ? "default"
                              : payment.status === "pending"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {payment.status}
                        </Badge>
                      </div>
                      {payment.invoiceUrl && (
                        <Button variant="ghost" size="icon" asChild>
                          <a
                            href={payment.invoiceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" asChild className="w-full">
              <Link href="/payments">
                View All Payments
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Payment Method */}
        <PermissionGate permissions={["billing:update"]}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Method
              </CardTitle>
              <CardDescription>
                Manage your payment methods
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Visa ending in 4242</p>
                    <p className="text-sm text-muted-foreground">
                      Expires 12/2025
                    </p>
                  </div>
                </div>
                <Button variant="outline">Update</Button>
              </div>
            </CardContent>
          </Card>
        </PermissionGate>

        {/* Cancel Subscription */}
        <PermissionGate permissions={["billing:update"]}>
          {planTier !== "free" && (
            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>
                  Cancel your subscription. This action can be undone within 30
                  days.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="destructive"
                  onClick={() => setIsCancelDialogOpen(true)}
                >
                  Cancel Subscription
                </Button>
              </CardContent>
            </Card>
          )}
        </PermissionGate>
      </div>

      {/* Upgrade Dialog */}
      <Dialog open={isUpgradeDialogOpen} onOpenChange={setIsUpgradeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedPlan && allPlans.indexOf(selectedPlan) > currentPlanIndex
                ? "Upgrade"
                : "Downgrade"}{" "}
              to {selectedPlan && PLAN_NAMES[selectedPlan]}
            </DialogTitle>
            <DialogDescription>
              {selectedPlan &&
              allPlans.indexOf(selectedPlan) > currentPlanIndex ? (
                <>
                  You&apos;ll be charged ${PLAN_PRICING[selectedPlan].monthly}
                  /month. The change will take effect immediately.
                </>
              ) : (
                <>
                  Your plan will be downgraded at the end of your current
                  billing period.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsUpgradeDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={confirmUpgrade}>
              Confirm{" "}
              {selectedPlan && allPlans.indexOf(selectedPlan) > currentPlanIndex
                ? "Upgrade"
                : "Downgrade"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Subscription</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your subscription? You&apos;ll
              lose access to premium features at the end of your billing period.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCancelDialogOpen(false)}
            >
              Keep Subscription
            </Button>
            <Button variant="destructive" onClick={handleCancelSubscription}>
              Cancel Subscription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
