"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePermission } from "@/hooks/usePermission";
import { DashboardLayout } from "@/components/layout";
import { PageHeader } from "@/components/common";
import { SubscriptionCard } from "@/components/cards";
import { PlanBadge } from "@/components/rbac";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PLAN_FEATURES, PLAN_NAMES, PLAN_PRICING } from "@/lib/constants";
import { PlanTier } from "@/types";
import { CreditCard, Download, Check, ArrowRight, Calendar, Receipt, AlertTriangle } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

type DbPayment = {
  id: string;
  amount: number;
  status: "pending" | "succeeded" | "failed";
  description: string;
  createdAt: string;
  invoiceUrl?: string | null;
};

export default function SubscriptionPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { organization, user } = useAuth();
  const { can } = usePermission();
  const canUpdateBilling = can("billing:update") || user?.roleSlug === "billing";
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanTier | null>(null);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [planTier, setPlanTier] = useState<PlanTier>("free");
  const [orgPayments, setOrgPayments] = useState<DbPayment[]>([]);
  const [orgOptions, setOrgOptions] = useState<{ id: string; name: string }[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string>("");
  const [dbActorUserId, setDbActorUserId] = useState<string>("");
  const allPlans: PlanTier[] = ["free", "starter", "professional", "enterprise"];

  const currentPlanIndex = allPlans.indexOf(planTier);

  const effectiveOrganizationId = organization?.id || user?.organizationId || selectedOrgId || "";

  async function loadData() {
    if (!effectiveOrganizationId) return;
    const [subRes, payRes] = await Promise.all([
      fetch(`/api/subscriptions/current?organizationId=${effectiveOrganizationId}`, { cache: "no-store" }),
      fetch(`/api/payments?organizationId=${effectiveOrganizationId}`, { cache: "no-store" }),
    ]);
    const subData = await subRes.json();
    const payData = await payRes.json();

    const slug = subData?.subscription?.plan?.slug;
    if (slug === "starter" || slug === "professional" || slug === "enterprise") setPlanTier(slug);
    else setPlanTier("free");

    setOrgPayments((payData.payments ?? []) as DbPayment[]);
  }

  useEffect(() => {
    loadData();
  }, [effectiveOrganizationId]);

  useEffect(() => {
    async function loadOrganizationsForSuperAdmin() {
      if (organization?.id || user?.organizationId) return;
      const res = await fetch("/api/organizations", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      const items = (data.organizations ?? []).map((o: any) => ({ id: o.id, name: o.name }));
      setOrgOptions(items);
      if (!selectedOrgId && items.length > 0) setSelectedOrgId(items[0].id);
    }
    loadOrganizationsForSuperAdmin();
  }, [organization?.id, user?.organizationId, selectedOrgId]);

  useEffect(() => {
    async function resolveDbActor() {
      if (!user?.email) return;
      const res = await fetch("/api/users", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      const matched = (data.users ?? []).find(
        (u: any) => u.email?.toLowerCase() === user.email.toLowerCase()
      );
      if (matched?.id) setDbActorUserId(matched.id);
    }
    resolveDbActor();
  }, [user?.email]);

  useEffect(() => {
    const success = searchParams.get("success");
    const error = searchParams.get("error");
    const plan = searchParams.get("plan");

    if (success === "true" && plan) {
      toast.success(`Successfully upgraded to ${PLAN_NAMES[plan as PlanTier] || plan}!`);
      router.replace("/subscription");
    } else if (error === "payment_failed") {
      toast.error("Payment failed. Please try again.");
      router.replace("/subscription");
    }
  }, [searchParams, router]);

  const handleUpgrade = (newPlan: PlanTier) => {
    setSelectedPlan(newPlan);
    setIsUpgradeDialogOpen(true);
  };

  const confirmUpgrade = async () => {
    console.log("[SUBS][FRONTEND] confirmUpgrade clicked", {
      selectedPlan,
      organizationId: effectiveOrganizationId,
      userId: user?.id,
      dbActorUserId,
    });
    if (!selectedPlan) {
      console.log("[SUBS][FRONTEND] blocked: selectedPlan missing");
      toast.error("No plan selected");
      return;
    }
    if (!effectiveOrganizationId) {
      console.log("[SUBS][FRONTEND] blocked: organizationId missing");
      toast.error("Select an organization first");
      return;
    }
    setIsPurchasing(true);
    try {
      const payload = {
        organizationId: effectiveOrganizationId,
        planSlug: selectedPlan,
        actorUserId: dbActorUserId || undefined,
      };
      console.log("[SUBS][FRONTEND] Requesting Stripe checkout redirect session", payload);

      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch (parseErr) {
        console.error("[SUBS][FRONTEND] response json parse failed", parseErr);
      }
      
      console.log("[SUBS][FRONTEND] checkout response", {
        ok: res.ok,
        status: res.status,
        data,
      });

      if (!res.ok || !data?.success || !data?.url) {
        toast.error(data?.error || "Failed to create checkout session");
        return;
      }

      setIsUpgradeDialogOpen(false);
      setSelectedPlan(null);
      
      // Redirect to Stripe checkout portal (simulated mock portal)
      toast.success("Redirecting to secure payment portal...");
      window.location.href = data.url;
    } catch (err) {
      toast.error("Checkout failed");
      console.error("[SUBS][FRONTEND] checkout exception thrown", err);
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleCancelSubscription = () => {
    setIsCancelDialogOpen(false);
  };

  const summaryFeatures = useMemo(
    () => [
      `${PLAN_FEATURES[planTier].members === -1 ? "Unlimited" : PLAN_FEATURES[planTier].members} team members`,
      `${PLAN_FEATURES[planTier].projects === -1 ? "Unlimited" : PLAN_FEATURES[planTier].projects} projects`,
      `${PLAN_FEATURES[planTier].storage === -1 ? "Unlimited" : `${PLAN_FEATURES[planTier].storage / 1024}GB`} storage`,
      PLAN_FEATURES[planTier].customRoles ? "Custom roles" : "Standard roles",
      PLAN_FEATURES[planTier].advancedAnalytics ? "Advanced analytics" : "Basic analytics",
    ],
    [planTier]
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader title="Subscription" description="Manage your subscription plan and billing" />
        {!organization?.id && !user?.organizationId && (
          <Card>
            <CardHeader>
              <CardTitle>Choose Organization</CardTitle>
              <CardDescription>Select organization to manage subscription</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedOrgId} onValueChange={setSelectedOrgId}>
                <SelectTrigger className="max-w-md">
                  <SelectValue placeholder="Select organization" />
                </SelectTrigger>
                <SelectContent>
                  {orgOptions.map((o) => (
                    <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <SubscriptionCard
            planName={PLAN_NAMES[planTier]}
            price={PLAN_PRICING[planTier].monthly}
            billingCycle="monthly"
            features={summaryFeatures}
            isCurrent
          />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">Current Plan Benefits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {summaryFeatures.map((f, i) => (
                <p key={i} className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" />{f}</p>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Available Plans</CardTitle>
            <CardDescription>Choose the plan that best fits your team&apos;s needs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {allPlans.map((tier, index) => {
                const isCurrentPlan = tier === planTier;
                const isUpgrade = index > currentPlanIndex;
                const pricing = PLAN_PRICING[tier];
                const features = PLAN_FEATURES[tier];

                return (
                  <Card key={tier} className={`relative ${isCurrentPlan ? "border-primary ring-1 ring-primary" : ""}`}>
                    {isCurrentPlan && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Current Plan</Badge>}
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">{PLAN_NAMES[tier]} <PlanBadge plan={tier} /></CardTitle>
                      <CardDescription><span className="text-2xl font-bold text-foreground">${pricing.monthly}</span><span className="text-muted-foreground">/month</span></CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" />{features.members === -1 ? "Unlimited" : features.members} team members</li>
                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" />{features.projects === -1 ? "Unlimited" : features.projects} projects</li>
                      </ul>
                    </CardContent>
                    <CardFooter>
                      {canUpdateBilling ? (
                        isCurrentPlan ? (
                          <Button className="w-full" disabled>Current Plan</Button>
                        ) : (
                          <Button className="w-full" variant={isUpgrade ? "default" : "outline"} onClick={() => handleUpgrade(tier)}>
                            {isUpgrade ? "Upgrade" : "Downgrade"}
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        )
                      ) : null}
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Receipt className="h-5 w-5" />Payment History</CardTitle>
            <CardDescription>Recent transactions and invoices</CardDescription>
          </CardHeader>
          <CardContent>
            {orgPayments.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No payment history yet</p>
            ) : (
              <div className="space-y-4">
                {orgPayments.slice(0, 5).map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-4">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${payment.status === "succeeded" ? "bg-green-100" : payment.status === "pending" ? "bg-yellow-100" : "bg-red-100"}`}>
                        {payment.status === "succeeded" ? <Check className="h-5 w-5 text-green-600" /> : payment.status === "pending" ? <Calendar className="h-5 w-5 text-yellow-600" /> : <AlertTriangle className="h-5 w-5 text-red-600" />}
                      </div>
                      <div>
                        <p className="font-medium">{payment.description}</p>
                        <p className="text-sm text-muted-foreground">{new Date(payment.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium">${(payment.amount / 100).toFixed(2)}</p>
                        <Badge variant={payment.status === "succeeded" ? "default" : payment.status === "pending" ? "secondary" : "destructive"}>{payment.status}</Badge>
                      </div>
                      {payment.invoiceUrl && <Button variant="ghost" size="icon" asChild><a href={payment.invoiceUrl} target="_blank" rel="noopener noreferrer"><Download className="h-4 w-4" /></a></Button>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" asChild className="w-full">
              <Link href="/payments">View All Payments<ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </CardFooter>
        </Card>

        {canUpdateBilling && planTier !== "free" && (
            <Card className="border-destructive/50">
              <CardHeader><CardTitle className="text-destructive">Danger Zone</CardTitle><CardDescription>Cancel your subscription.</CardDescription></CardHeader>
              <CardContent><Button variant="destructive" onClick={() => setIsCancelDialogOpen(true)}>Cancel Subscription</Button></CardContent>
            </Card>
        )}
      </div>

      <Dialog open={isUpgradeDialogOpen} onOpenChange={setIsUpgradeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Purchase</DialogTitle>
            <DialogDescription>
              You are purchasing <strong>{selectedPlan ? PLAN_NAMES[selectedPlan] : ""}</strong> plan for ${selectedPlan ? PLAN_PRICING[selectedPlan].monthly : 0}/month.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpgradeDialogOpen(false)} disabled={isPurchasing}>Cancel</Button>
            <Button onClick={confirmUpgrade} disabled={isPurchasing}>{isPurchasing ? "Processing..." : "Pay & Activate"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isSuccessDialogOpen} onOpenChange={setIsSuccessDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Purchase Successful</DialogTitle>
            <DialogDescription>Your new subscription is now active and saved to database.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setIsSuccessDialogOpen(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Subscription</DialogTitle>
            <DialogDescription>Are you sure you want to cancel?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>Keep Subscription</Button>
            <Button variant="destructive" onClick={handleCancelSubscription}>Cancel Subscription</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
