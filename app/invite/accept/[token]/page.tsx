"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { invites } from "@/data/invites";
import { organizations } from "@/data/organizations";
import { roles } from "@/data/roles";
import { users } from "@/data/users";
import { 
  CheckCircle, 
  XCircle, 
  Clock,
  Building2,
  Users,
  Shield,
  ArrowRight
} from "lucide-react";
import Link from "next/link";

export default function AcceptInvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const router = useRouter();
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDeclined, setIsDeclined] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);

  // Find the invite by token
  const invite = invites.find((i) => i.token === token);
  const organization = invite
    ? organizations.find((o) => o.id === invite.organizationId)
    : null;
  const role = invite ? roles.find((r) => r.id === invite.roleId) : null;
  const inviter = invite ? users.find((u) => u.id === invite.invitedBy) : null;

  // Check if invite is valid
  const isExpired = invite ? new Date(invite.expiresAt) < new Date() : false;
  const isValid =
    invite &&
    invite.status === "pending" &&
    !isExpired;

  const handleAccept = async () => {
    setIsAccepting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log("Accepting invite:", token);
    setIsAccepting(false);
    setIsAccepted(true);
  };

  const handleDecline = async () => {
    console.log("Declining invite:", token);
    setIsDeclined(true);
  };

  // Invalid or not found
  if (!invite) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <XCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle>Invalid Invitation</CardTitle>
            <CardDescription>
              This invitation link is invalid or has been revoked.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/login">Go to Login</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Expired
  if (isExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center">
              <Clock className="h-6 w-6 text-amber-500" />
            </div>
            <CardTitle>Invitation Expired</CardTitle>
            <CardDescription>
              This invitation has expired. Please contact the organization admin
              for a new invitation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center text-sm text-muted-foreground">
              <p>
                Organization: <strong>{organization?.name}</strong>
              </p>
              <p>
                Expired on:{" "}
                <strong>
                  {new Date(invite.expiresAt).toLocaleDateString()}
                </strong>
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/login">Go to Login</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Already accepted
  if (invite.status === "accepted" || isAccepted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
            <CardTitle>
              {isAccepted ? "Welcome Aboard!" : "Invitation Accepted"}
            </CardTitle>
            <CardDescription>
              {isAccepted
                ? `You're now a member of ${organization?.name}!`
                : "This invitation has already been accepted."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg border">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{organization?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {organization?.industry}
                  </p>
                </div>
              </div>

              {role && (
                <div className="flex items-center gap-3 p-3 rounded-lg border">
                  <div
                    className="h-10 w-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${role.color}20` }}
                  >
                    <Shield className="h-5 w-5" style={{ color: role.color }} />
                  </div>
                  <div>
                    <p className="font-medium">Your Role: {role.name}</p>
                    {role.description && (
                      <p className="text-sm text-muted-foreground">
                        {role.description}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/login">
                Continue to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Declined
  if (isDeclined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <XCircle className="h-6 w-6 text-muted-foreground" />
            </div>
            <CardTitle>Invitation Declined</CardTitle>
            <CardDescription>
              You&apos;ve declined the invitation to join {organization?.name}.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href="/">Go to Home</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Valid invitation - show accept/decline
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center">
            <span className="text-2xl font-bold text-primary">
              {organization?.name?.charAt(0) || "O"}
            </span>
          </div>
          <CardTitle className="text-xl">
            You&apos;ve been invited to join
          </CardTitle>
          <CardDescription className="text-lg font-semibold text-foreground">
            {organization?.name}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Organization Info */}
          <div className="flex items-center gap-3 p-3 rounded-lg border">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-medium">Organization</p>
              <p className="text-sm text-muted-foreground">
                {organization?.industry} •{" "}
                {organization?.size?.replace("_", "-")} employees
              </p>
            </div>
          </div>

          {/* Role */}
          {role && (
            <div className="flex items-center gap-3 p-3 rounded-lg border">
              <Shield className="h-5 w-5" style={{ color: role.color }} />
              <div className="flex-1">
                <p className="text-sm font-medium">Your Role</p>
                <div className="flex items-center gap-2">
                  <Badge
                    style={{
                      backgroundColor: `${role.color}20`,
                      color: role.color,
                    }}
                  >
                    {role.name}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {role.permissions.length} permissions
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Invited by */}
          {inviter && (
            <div className="flex items-center gap-3 p-3 rounded-lg border">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">Invited by</p>
                <p className="text-sm text-muted-foreground">{inviter.name}</p>
              </div>
            </div>
          )}

          {/* Expiry */}
          <div className="flex items-center gap-3 p-3 rounded-lg border">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-medium">Expires</p>
              <p className="text-sm text-muted-foreground">
                {new Date(invite.expiresAt).toLocaleDateString()} at{" "}
                {new Date(invite.expiresAt).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleDecline}
            disabled={isAccepting}
          >
            Decline
          </Button>
          <Button
            className="flex-1"
            onClick={handleAccept}
            disabled={isAccepting}
          >
            {isAccepting ? "Accepting..." : "Accept Invitation"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
