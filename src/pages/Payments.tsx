import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Header } from "@/components/layout/Header";
import { StatCard } from "@/components/ui/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { SubmissionCard } from "@/components/payments/SubmissionCard";
import { ReviewFilters } from "@/components/payments/ReviewFilters";
import { useReviewSubmissions } from "@/hooks/useReviewSubmissions";
import { ReviewSubmission } from "@/types/review";
import { ApplicationStatus } from "@/types";
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  DollarSign,
  Flame,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const ITEMS_PER_PAGE = 8;

const priorityOrder = { urgent: 0, priority: 1, normal: 2 };

const Payments = () => {
  const { submissions, stats, loading, updateApplicationStatus } = useReviewSubmissions();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => {
    let result = submissions;

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((s) => s.reviewStatus === statusFilter);
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.customerName.toLowerCase().includes(q) ||
          s.id.toLowerCase().includes(q) ||
          s.phone.includes(q)
      );
    }

    // Sort
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return a.createdAt.getTime() - b.createdAt.getTime();
        case "urgency":
          return priorityOrder[a.queuePriority] - priorityOrder[b.queuePriority];
        case "amount_high":
          return b.totalPrice - a.totalPrice;
        case "amount_low":
          return a.totalPrice - b.totalPrice;
        default: // newest
          return b.createdAt.getTime() - a.createdAt.getTime();
      }
    });

    return result;
  }, [submissions, statusFilter, searchQuery, sortBy]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleApprove = async (id: string, notes: string, performedBy: string) => {
    await updateApplicationStatus(id, "approved" as ApplicationStatus, {
      previousStatus: "pending",
      notes,
      performedBy,
    });
  };

  const handleReject = async (id: string, reason: string, performedBy: string) => {
    await updateApplicationStatus(id, "rejected" as ApplicationStatus, {
      previousStatus: "pending",
      notes: reason,
      performedBy,
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Header title="Review & Payments" subtitle="Review submissions and manage payments" />
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
          <Skeleton className="h-12" />
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Header title="Review & Payments" subtitle="Review customer submissions, verify payments, and approve or reject" />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard title="Awaiting Review" value={stats.awaiting} icon={ClipboardCheck} trend={stats.urgent > 0 ? { value: stats.urgent, isPositive: false } : undefined} subtitle={stats.urgent > 0 ? `${stats.urgent} urgent` : undefined} />
          <StatCard title="Approved" value={stats.approved} icon={CheckCircle2} />
          <StatCard title="Rejected" value={stats.rejected} icon={XCircle} />
          <StatCard title="Total Revenue" value={`RM${stats.totalRevenue.toLocaleString()}`} icon={DollarSign} />
          <StatCard title="Total Submissions" value={stats.total} icon={ClipboardCheck} />
        </div>

        {/* Filters */}
        <ReviewFilters
          searchQuery={searchQuery}
          onSearchChange={(v) => { setSearchQuery(v); setCurrentPage(1); }}
          statusFilter={statusFilter}
          onStatusChange={handleFilterChange}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        {/* Results count */}
        <p className="text-sm text-muted-foreground">
          Showing {filtered.length} submission{filtered.length !== 1 ? "s" : ""}
        </p>

        {/* Submission Cards */}
        <div className="space-y-3">
          {paginated.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <ClipboardCheck className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="font-medium">No submissions found</p>
              <p className="text-sm mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            paginated.map((sub) => (
              <SubmissionCard key={sub.id} submission={sub} onApprove={handleApprove} onReject={handleReject} />
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <p className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Payments;
