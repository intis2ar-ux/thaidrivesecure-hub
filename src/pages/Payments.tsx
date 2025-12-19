import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { StatCard } from "@/components/ui/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DollarSign, Receipt, AlertCircle, Filter, QrCode, Banknote } from "lucide-react";
import { usePayments, useApplications } from "@/hooks/useFirestore";
import { format } from "date-fns";
import { useState } from "react";
import { cn } from "@/lib/utils";

const Payments = () => {
  const { payments, loading } = usePayments();
  const { applications } = useApplications();
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const totalRevenue = payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingPayments = payments.filter((p) => p.status === "pending");
  const failedPayments = payments.filter((p) => p.status === "failed");

  const filteredPayments = payments.filter(
    (p) => statusFilter === "all" || p.status === statusFilter
  );

  const getApplication = (appId: string) =>
    applications.find((a) => a.id === appId);

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case "qr":
        return <QrCode className="h-4 w-4" />;
      case "cash":
        return <Banknote className="h-4 w-4" />;
      default:
        return <QrCode className="h-4 w-4" />;
    }
  };

  const getQueuePriority = (status: string, method: string) => {
    if (status === "paid") return { label: "Priority", color: "bg-success" };
    if (method === "cash") return { label: "Delayed", color: "bg-warning" };
    return { label: "Normal", color: "bg-muted" };
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Header
          title="Payments"
          subtitle="Track and manage payment transactions"
        />
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Header
        title="Payments"
        subtitle="Track and manage payment transactions"
      />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Revenue"
            value={`RM${totalRevenue.toLocaleString()}`}
            icon={DollarSign}
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="Total Payments"
            value={payments.length}
            icon={Receipt}
          />
          <StatCard
            title="Pending"
            value={pendingPayments.length}
            subtitle="Awaiting payment"
            icon={Receipt}
          />
          <StatCard
            title="Failed"
            value={failedPayments.length}
            subtitle="Requires attention"
            icon={AlertCircle}
          />
        </div>

        {/* Queue Priority Legend */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-6">
              <p className="text-sm font-medium text-muted-foreground">
                Queue Priority:
              </p>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-success" />
                <span className="text-sm">Priority (Paid)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-warning" />
                <span className="text-sm">Delayed (Cash at Counter)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-muted-foreground" />
                <span className="text-sm">Normal</span>
              </div>
              <div className="ml-auto">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-36">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payments Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              All Payments ({filteredPayments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredPayments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No payments found
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payment ID</TableHead>
                    <TableHead>Application</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Queue</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => {
                    const app = getApplication(payment.applicationId);
                    const priority = getQueuePriority(payment.status, payment.method);
                    return (
                      <TableRow key={payment.id} className="hover:bg-muted/50">
                        <TableCell className="font-mono text-sm">
                          {payment.id}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{payment.applicationId}</p>
                            <p className="text-xs text-muted-foreground">
                              {app?.customerName}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getPaymentIcon(payment.method)}
                            <span className="capitalize">{payment.method}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          RM{payment.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <StatusBadge variant={payment.status}>
                            {payment.status}
                          </StatusBadge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span
                              className={cn("w-2 h-2 rounded-full", priority.color)}
                            />
                            <span className="text-sm">{priority.label}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {format(payment.createdAt, "MMM dd, HH:mm")}
                        </TableCell>
                        <TableCell className="text-right">
                          {payment.receiptUrl ? (
                            <Button size="sm" variant="outline">
                              <Receipt className="h-4 w-4 mr-1" />
                              Receipt
                            </Button>
                          ) : payment.status === "failed" ? (
                            <Button
                              size="sm"
                              className="bg-accent hover:bg-accent/90 text-accent-foreground"
                            >
                              Retry
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline" disabled>
                              Pending
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Payments;
