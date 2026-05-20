"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { DashboardLayout } from "@/components/layout";
import { PageHeader } from "@/components/common";
import { RoleBadge, SubscriptionGate } from "@/components/rbac";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { roles } from "@/data/roles";
import { ArrowLeft, Send, UserPlus, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function SendInvitePage() {
  const router = useRouter();
  const { organization, user } = useAuth();
  const { usage, canAddMoreMembers } = useSubscription();
  const [emails, setEmails] = useState("");
  const [roleId, setRoleId] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const orgRoles = roles.filter(
    (r) => r.organizationId === organization?.id && !r.isSystemRole
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Parse emails
    const emailList = emails
      .split(/[,\n]/)
      .map((e) => e.trim())
      .filter((e) => e.length > 0);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log("Sending invites:", {
      emails: emailList,
      roleId,
      message,
      organizationId: organization?.id,
      invitedBy: user?.id,
    });

    router.push("/invites");
  };

  const emailList = emails
    .split(/[,\n]/)
    .map((e) => e.trim())
    .filter((e) => e.length > 0);

  const remainingSlots = usage
    ? usage.members.limit === -1
      ? Infinity
      : usage.members.limit - usage.members.used
    : 0;

  const exceedsLimit =
    remainingSlots !== Infinity && emailList.length > remainingSlots;

  return (
    <DashboardLayout>
      <SubscriptionGate
        requiredFeature="members"
        checkLimit
        fallback={
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/invites">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <PageHeader
                title="Send Invitations"
                description="Invite new members to your organization"
              />
            </div>
            <Card className="border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800 dark:text-amber-200">
                      Member Limit Reached
                    </p>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      You&apos;ve reached your plan&apos;s member limit. Upgrade your
                      subscription to invite more team members.
                    </p>
                    <Button asChild className="mt-4">
                      <Link href="/subscription">Upgrade Plan</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild type="button">
              <Link href="/invites">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <PageHeader
              title="Send Invitations"
              description="Invite new members to your organization"
            >
              <Button
                type="submit"
                disabled={
                  emailList.length === 0 ||
                  !roleId ||
                  isSubmitting ||
                  exceedsLimit
                }
              >
                <Send className="mr-2 h-4 w-4" />
                {isSubmitting
                  ? "Sending..."
                  : `Send ${emailList.length > 1 ? `${emailList.length} Invites` : "Invite"}`}
              </Button>
            </PageHeader>
          </div>

          {/* Capacity Warning */}
          {exceedsLimit && (
            <Card className="border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800 dark:text-amber-200">
                      Exceeds Member Limit
                    </p>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      You can only invite {remainingSlots} more member
                      {remainingSlots !== 1 ? "s" : ""} on your current plan.
                      Reduce the number of emails or upgrade your subscription.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Email Input */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Invite Details
                </CardTitle>
                <CardDescription>
                  Enter email addresses and select a role for the new members
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="emails">Email Addresses *</Label>
                  <Textarea
                    id="emails"
                    placeholder="Enter email addresses, separated by commas or new lines..."
                    value={emails}
                    onChange={(e) => setEmails(e.target.value)}
                    rows={5}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    {emailList.length} email{emailList.length !== 1 ? "s" : ""}{" "}
                    entered
                    {remainingSlots !== Infinity && (
                      <> ({remainingSlots} slots available)</>
                    )}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role *</Label>
                  <Select value={roleId} onValueChange={setRoleId} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {orgRoles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          <div className="flex items-center gap-2">
                            <RoleBadge role={role} size="sm" />
                            {role.description && (
                              <span className="text-xs text-muted-foreground">
                                - {role.description}
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Personal Message (Optional)</Label>
                  <Textarea
                    id="message"
                    placeholder="Add a personal message to the invitation email..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>
                  How the invitation email will look
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-4 bg-muted/30">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <span className="text-lg font-bold text-primary">
                          {organization?.name?.charAt(0) || "O"}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold">
                          {organization?.name || "Your Organization"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Team Invitation
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm">
                        <strong>{user?.name || "Someone"}</strong> has invited
                        you to join{" "}
                        <strong>
                          {organization?.name || "their organization"}
                        </strong>
                        {roleId && (
                          <>
                            {" "}
                            as a{" "}
                            <strong>
                              {roles.find((r) => r.id === roleId)?.name ||
                                "team member"}
                            </strong>
                          </>
                        )}
                        .
                      </p>

                      {message && (
                        <div className="bg-background rounded p-3 border">
                          <p className="text-sm italic text-muted-foreground">
                            &quot;{message}&quot;
                          </p>
                        </div>
                      )}
                    </div>

                    <Button className="w-full" disabled>
                      Accept Invitation
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                      This invitation will expire in 7 days
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      </SubscriptionGate>
    </DashboardLayout>
  );
}
