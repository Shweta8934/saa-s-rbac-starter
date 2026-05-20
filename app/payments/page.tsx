"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { DashboardLayout } from "@/components/layout";
import { PageHeader, EmptyState } from "@/components/common";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Download, Receipt, Check, Calendar, AlertTriangle, ArrowUpDown } from "lucide-react";

type PaymentStatus = "all" | "succeeded" | "pending" | "failed";

type DbPayment = {
  id: string;
  amount: number;
  status: "succeeded" | "pending" | "failed";
  method: string;
  description: string;
  invoiceUrl?: string | null;
  createdAt: string;
};

export default function PaymentsPage() {
  const { organization, user } = useAuth();
  const [payments, setPayments] = useState<DbPayment[]>([]);
  const [orgOptions, setOrgOptions] = useState<{ id: string; name: string }[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<PaymentStatus>("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const effectiveOrganizationId = organization?.id || user?.organizationId || selectedOrgId || "";

  useEffect(() => {
    async function load() {
      if (!effectiveOrganizationId) return;
      const res = await fetch(`/api/payments?organizationId=${effectiveOrganizationId}`, { cache: "no-store" });
      const data = await res.json();
      setPayments(data.payments ?? []);
    }
    load();
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

  const filteredPayments = useMemo(
    () =>
      payments
        .filter((payment) => {
          const matchesSearch = payment.description.toLowerCase().includes(searchQuery.toLowerCase());
          const matchesStatus = statusFilter === "all" || payment.status === statusFilter;
          return matchesSearch && matchesStatus;
        })
        .sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
        }),
    [payments, searchQuery, statusFilter, sortOrder]
  );

  const totalPaid = payments.filter((p) => p.status === "succeeded").reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = payments.filter((p) => p.status === "pending").reduce((sum, p) => sum + p.amount, 0);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "succeeded":
        return <Check className="h-4 w-4 text-green-600" />;
      case "pending":
        return <Calendar className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "succeeded":
        return "default" as const;
      case "pending":
        return "secondary" as const;
      default:
        return "destructive" as const;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader title="Payment History" description="View and manage all payment transactions" />
        {!organization?.id && !user?.organizationId && (
          <Card>
            <CardHeader>
              <CardTitle>Choose Organization</CardTitle>
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

        <div className="grid gap-4 md:grid-cols-3">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Paid</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-green-600">${(totalPaid / 100).toFixed(2)}</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-yellow-600">${(pendingAmount / 100).toFixed(2)}</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Transactions</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{payments.length}</p></CardContent></Card>
        </div>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Receipt className="h-5 w-5" />All Transactions</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search transactions..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
              </div>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as PaymentStatus)}>
                <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Filter by status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="succeeded">Succeeded</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))}>
                <ArrowUpDown className="mr-2 h-4 w-4" />{sortOrder === "desc" ? "Newest First" : "Oldest First"}
              </Button>
            </div>

            {filteredPayments.length === 0 ? (
              <EmptyState icon={Receipt} title="No transactions found" description={searchQuery || statusFilter !== "all" ? "Try adjusting your search or filters" : "No payment history yet"} />
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead className="w-[70px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className={`h-9 w-9 rounded-full flex items-center justify-center ${payment.status === "succeeded" ? "bg-green-100" : payment.status === "pending" ? "bg-yellow-100" : "bg-red-100"}`}>{getStatusIcon(payment.status)}</div>
                            <div><p className="font-medium">{payment.description}</p><p className="text-xs text-muted-foreground">{payment.id}</p></div>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{new Date(payment.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="font-medium">${(payment.amount / 100).toFixed(2)}</TableCell>
                        <TableCell><Badge variant={getStatusBadgeVariant(payment.status)}>{payment.status}</Badge></TableCell>
                        <TableCell className="text-muted-foreground">{payment.method === "card" ? "Card" : payment.method}</TableCell>
                        <TableCell>
                          {payment.invoiceUrl && (
                            <Button variant="ghost" size="icon" asChild>
                              <a href={payment.invoiceUrl} target="_blank" rel="noopener noreferrer">
                                <Download className="h-4 w-4" />
                                <span className="sr-only">Download Invoice</span>
                              </a>
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
