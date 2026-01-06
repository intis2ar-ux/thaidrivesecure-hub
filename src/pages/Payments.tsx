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
import { DollarSign, Receipt, AlertCircle, Filter, QrCode, Banknote, ChevronLeft, ChevronRight } from "lucide-react";
import { usePayments, useApplications } from "@/hooks/useFirestore";
import { format } from "date-fns";
import { useState } from "react";
import { cn } from "@/lib/utils";

const ITEMS_PER_PAGE = 10;

const Payments = () => {
  const { payments, loading } = usePayments();
  const { applications } = useApplications();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const totalRevenue = payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingPayments = payments.filter((p) => p.status === "pending");
  const failedPayments = payments.filter((p) => p.status === "failed");

  const filteredPayments = payments.filter(
    (p) => statusFilter === "all" || p.status === statusFilter
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredPayments.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedPayments = filteredPayments.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

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
                <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
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
                  <TableRow className="border-b border-border/50">
                    <TableHead className="text-primary font-medium">Payment ID</TableHead>
                    <TableHead className="text-primary font-medium">Application</TableHead>
                    <TableHead className="text-primary font-medium">Method</TableHead>
                    <TableHead className="text-primary font-medium">Amount</TableHead>
                    <TableHead className="text-primary font-medium">Status</TableHead>
                    <TableHead className="text-primary font-medium">Queue</TableHead>
                    <TableHead className="text-primary font-medium">Date</TableHead>
                    <TableHead className="text-primary font-medium text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedPayments.map((payment) => {
                    const app = getApplication(payment.applicationId);
                    const priority = getQueuePriority(payment.status, payment.method);
                    return (
                      <TableRow key={payment.id} className="hover:bg-muted/30 border-b border-border/30">
                        <TableCell className="font-mono text-sm text-accent">
                          {payment.id}
                        </TableCell>
                        <TableCell>
                          <p className="font-medium text-foreground">{payment.applicationId}</p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getPaymentIcon(payment.method)}
                            <span className="capitalize text-sm">{payment.method === "qr" ? "Qr" : "Cash"}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-foreground">
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
                        <TableCell className="text-sm text-foreground">
                          {format(payment.createdAt, "MMM dd, HH:mm")}
                        </TableCell>
                        <TableCell className="text-right">
                          {payment.status === "paid" && (
                            <Button size="sm" variant="outline" className="gap-1.5">
                              <Receipt className="h-4 w-4" />
                              Receipt
                            </Button>
                          )}
                          {payment.status === "failed" && (
                            <Button
                              size="sm"
                              className="bg-accent hover:bg-accent/90 text-accent-foreground"
                            >
                              Retry
                            </Button>
                          )}
                          {payment.status === "pending" && (
                            <Button size="sm" variant="outline" disabled className="opacity-60">
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredPayments.length)} of {filteredPayments.length} results
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        className="w-8 h-8 p-0"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Payments;
