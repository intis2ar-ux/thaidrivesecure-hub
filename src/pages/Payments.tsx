import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatCard } from "@/components/ui/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DollarSign,
  Receipt,
  ShieldCheck,
  Clock,
  AlertTriangle,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { usePayments } from "@/hooks/useFirestore";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useMemo } from "react";
import { Payment, PaymentVerificationStatus } from "@/types";
import { ReceiptModal } from "@/components/payments/ReceiptModal";
import { PaymentDetailDrawer } from "@/components/payments/PaymentDetailDrawer";
import { PaymentVerificationTable } from "@/components/payments/PaymentVerificationTable";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 10;

const Payments = () => {
  const { payments: rawPayments, loading, updatePaymentVerification } = usePayments();
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>("desc");
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  // Only show payments from approved applications (status === "paid" means order was approved)
  const payments = useMemo(
    () => rawPayments.filter((p) => p.status === "paid"),
    [rawPayments]
  );

  // Stats
  const verifiedPayments = payments.filter((p) => p.verificationStatus === "verified");
  const pendingVerification = payments.filter((p) => p.verificationStatus === "pending_verification");
  const rejectedPayments = payments.filter((p) => p.verificationStatus === "rejected" || p.verificationStatus === "updated");
  const totalRevenue = verifiedPayments.reduce((sum, p) => sum + p.amount, 0);

  // Filtered & sorted
  const filteredPayments = useMemo(() => {
    return payments
      .filter((p) => {
        if (statusFilter !== "all" && p.verificationStatus !== statusFilter) return false;
        if (methodFilter !== "all" && p.method !== methodFilter) return false;
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          return (
            p.customerName.toLowerCase().includes(q) ||
            p.id.toLowerCase().includes(q) ||
            p.applicationId.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
        if (!sortOrder) return 0;
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
      });
  }, [payments, statusFilter, methodFilter, searchQuery, sortOrder]);

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "desc" ? "asc" : prev === "asc" ? null : "desc"));
    setCurrentPage(1);
  };

  // Pagination
  const totalPages = Math.ceil(filteredPayments.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedPayments = filteredPayments.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const resetFilters = () => {
    setStatusFilter("all");
    setMethodFilter("all");
    setSearchQuery("");
    setCurrentPage(1);
  };

  // Handlers
  const handleVerify = async (paymentId: string, notes: string) => {
    try {
      await updatePaymentVerification(paymentId, "payment_verified", {
        notes,
        performedBy: user?.name || "Unknown",
      });
      toast.success("Payment verified successfully");
    } catch (err) {
      toast.error("Failed to verify payment");
    }
  };

  const handleReject = async (paymentId: string, reason: string) => {
    try {
      await updatePaymentVerification(paymentId, "payment_rejected", {
        notes: reason,
        performedBy: user?.name || "Unknown",
      });
      toast.error("Payment rejected");
    } catch (err) {
      toast.error("Failed to reject payment");
    }
  };

  const handleRequestUpdate = async (paymentId: string, notes: string) => {
    try {
      await updatePaymentVerification(paymentId, "payment_request_update", {
        notes,
        performedBy: user?.name || "Unknown",
      });
      toast.info("Update request sent to customer");
    } catch (err) {
      toast.error("Failed to send update request");
    }
  };

  const openDetails = (payment: Payment) => {
    setSelectedPayment(payment);
    setDetailOpen(true);
  };

  const openReceipt = (payment: Payment) => {
    setSelectedPayment(payment);
    setReceiptOpen(true);
  };

  const quickVerify = (payment: Payment) => {
    setSelectedPayment(payment);
    setDetailOpen(true);
  };

  const quickReject = (payment: Payment) => {
    setSelectedPayment(payment);
    setDetailOpen(true);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Header title="Payment Verification" subtitle="Verify and manage payments for approved applications" />
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
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
        title="Payment Verification"
        subtitle="Verify and manage payments for approved applications"
      />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard title="Total Payments" value={payments.length} icon={Receipt} />
          <StatCard
            title="Verified"
            value={verifiedPayments.length}
            subtitle="Manually approved"
            icon={ShieldCheck}
          />
          <StatCard
            title="Pending Verification"
            value={pendingVerification.length}
            subtitle="Awaiting staff review"
            icon={Clock}
          />
          <StatCard
            title="Rejected / Update"
            value={rejectedPayments.length}
            subtitle="Requires attention"
            icon={AlertTriangle}
          />
          <StatCard
            title="Verified Revenue"
            value={`RM${totalRevenue.toLocaleString()}`}
            icon={DollarSign}
            trend={totalRevenue > 0 ? { value: 8, isPositive: true } : undefined}
          />
        </div>

        {/* Queue Legend + Search/Filters */}
        <Card>
          <CardContent className="p-4 space-y-4">
            {/* Queue Legend */}
            <div className="flex flex-wrap items-center gap-6">
              <p className="text-sm font-medium text-muted-foreground">Queue Priority:</p>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-success" />
                <span className="text-sm">High Priority (Verified)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-warning" />
                <span className="text-sm">Requires Attention</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-muted-foreground" />
                <span className="text-sm">Normal</span>
              </div>
            </div>

            {/* Search + Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, payment ID, or app ID..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Verification Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending_verification">Pending Verification</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="updated">Updated by Customer</SelectItem>
                </SelectContent>
              </Select>
              <Select value={methodFilter} onValueChange={(v) => { setMethodFilter(v); setCurrentPage(1); }}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="qr">QR Payment</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                </SelectContent>
              </Select>
              {(statusFilter !== "all" || methodFilter !== "all" || searchQuery) && (
                <Button variant="ghost" size="sm" onClick={resetFilters}>Clear Filters</Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payments Table */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-base font-semibold text-accent mb-4">
              Payment Records ({filteredPayments.length})
            </h3>

            <PaymentVerificationTable
              payments={paginatedPayments}
              sortOrder={sortOrder}
              onToggleSort={toggleSortOrder}
              onViewDetails={openDetails}
              onVerify={quickVerify}
              onReject={quickReject}
              onViewReceipt={openReceipt}
              onRequestUpdate={(p) => { setSelectedPayment(p); setDetailOpen(true); }}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t mt-4">
                <p className="text-sm text-muted-foreground">
                  Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredPayments.length)} of {filteredPayments.length}
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1}>
                    <ChevronLeft className="h-4 w-4 mr-1" />Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button key={page} variant={currentPage === page ? "default" : "outline"} size="sm" className="w-8 h-8 p-0" onClick={() => setCurrentPage(page)}>
                        {page}
                      </Button>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>
                    Next<ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <ReceiptModal payment={selectedPayment} open={receiptOpen} onOpenChange={setReceiptOpen} />
      <PaymentDetailDrawer
        payment={selectedPayment}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onVerify={handleVerify}
        onReject={handleReject}
        onRequestUpdate={handleRequestUpdate}
      />
    </DashboardLayout>
  );
};

export default Payments;
