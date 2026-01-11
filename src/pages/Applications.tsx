import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Car,
  Bike,
  Users,
  Calendar,
  Phone,
  MapPin,
  Package,
  Truck,
} from "lucide-react";
import { useApplications } from "@/hooks/useFirestore";
import { Application, ApplicationStatus, BorderRoute } from "@/types";
import { format, differenceInDays } from "date-fns";

const vehicleTypeLabels: Record<string, string> = {
  sedan: "Sedan",
  mpv: "MPV",
  pickup_suv: "Pickup/SUV",
  motorcycle: "Motorcycle",
};

const packageTypeLabels: Record<string, string> = {
  compulsory: "Compulsory",
  compulsory_voluntary: "Compulsory + Voluntary",
};

const deliveryLabels: Record<string, string> = {
  takeaway: "Self Collect",
  email_pdf: "PDF",
  shipping: "Courier",
};

const borderRouteLabels: Record<BorderRoute, { from: string; to: string }> = {
  padang_besar: { from: "Padang Besar", to: "Hat Yai" },
  wang_kelian: { from: "Wang Kelian", to: "Satun" },
  durian_burung: { from: "Durian Burung", to: "Betong" },
  bukit_kayu_hitam: { from: "Bukit Kayu Hitam", to: "Hat Yai" },
};

const ITEMS_PER_PAGE = 10;

const Applications = () => {
  const { applications, loading, updateApplicationStatus } = useApplications();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [newStatus, setNewStatus] = useState<ApplicationStatus>("pending");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>("desc");

  const handleUpdateStatus = async () => {
    if (!editingApp) return;
    await updateApplicationStatus(editingApp.id, newStatus);
    setIsEditOpen(false);
    setEditingApp(null);
  };

  const openEditDialog = (app: Application) => {
    setEditingApp(app);
    setNewStatus(app.status);
    setIsEditOpen(true);
  };

  const filteredApplications = useMemo(() => {
    return applications
      .filter((app) => {
        const matchesSearch =
          app.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.customerPhone.includes(searchTerm);
        const matchesStatus = statusFilter === "all" || app.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (!sortOrder) return 0;
        const dateA = a.submissionDate ? new Date(a.submissionDate).getTime() : 0;
        const dateB = b.submissionDate ? new Date(b.submissionDate).getTime() : 0;
        return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
      });
  }, [applications, searchTerm, statusFilter, sortOrder]);

  const toggleSortOrder = () => {
    setSortOrder((prev) => {
      if (prev === "desc") return "asc";
      if (prev === "asc") return null;
      return "desc";
    });
    setCurrentPage(1);
  };

  const getSortIcon = () => {
    if (sortOrder === "desc") return <ArrowDown className="h-4 w-4" />;
    if (sortOrder === "asc") return <ArrowUp className="h-4 w-4" />;
    return <ArrowUpDown className="h-4 w-4" />;
  };

  const calculateDays = (start: Date, end: Date): number => {
    const days = differenceInDays(new Date(end), new Date(start)) + 1;
    return days > 0 ? days : 1;
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredApplications.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedApplications = filteredApplications.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Header
          title="Applications"
          subtitle="High-level overview of all customer applications"
        />
        <div className="p-6 space-y-6">
          <Skeleton className="h-16" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Header
        title="Applications"
        subtitle="High-level overview of all customer applications"
      />

      <div className="p-6 space-y-6">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, ID, or phone..."
              className="pl-10 bg-background border"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
            <SelectTrigger className="w-40 bg-background">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={toggleSortOrder}
            className="flex items-center gap-2"
          >
            {getSortIcon()}
            <span>Sort by Date</span>
          </Button>
        </div>

        {/* Stats Summary */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>Total: <strong className="text-foreground">{filteredApplications.length}</strong> applications</span>
          <span>•</span>
          <span>Pending: <strong className="text-amber-600">{applications.filter(a => a.status === "pending").length}</strong></span>
          <span>•</span>
          <span>Approved: <strong className="text-emerald-600">{applications.filter(a => a.status === "approved" || a.status === "completed").length}</strong></span>
        </div>

        {/* Application Cards */}
        {filteredApplications.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">No applications found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {paginatedApplications.map((app) => {
              const VehicleIcon = app.vehicleType === "motorcycle" ? Bike : Car;
              const route = borderRouteLabels[app.borderRoute] || { from: "Unknown", to: "Unknown" };
              const numDays = calculateDays(app.travelStartDate, app.travelEndDate);

              return (
                <Card
                  key={app.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer border-l-4"
                  style={{
                    borderLeftColor:
                      app.status === "approved" || app.status === "completed"
                        ? "hsl(var(--chart-2))"
                        : app.status === "rejected"
                        ? "hsl(var(--destructive))"
                        : "hsl(var(--chart-4))",
                  }}
                  onClick={() => openEditDialog(app)}
                >
                  <CardContent className="p-4 space-y-4">
                    {/* Header: Customer & Status */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-foreground truncate">{app.customerName}</p>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
                          <Phone className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{app.customerPhone || "No phone"}</span>
                        </div>
                      </div>
                      <StatusBadge variant={app.status} className="shrink-0">
                        {app.status}
                      </StatusBadge>
                    </div>

                    {/* Border Route */}
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-primary shrink-0" />
                      <span className="font-medium">{route.from}</span>
                      <span className="text-muted-foreground">→</span>
                      <span className="font-medium">{route.to}</span>
                    </div>

                    {/* Travel Dates */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 shrink-0" />
                      <span>
                        {format(new Date(app.travelStartDate), "dd MMM")} – {format(new Date(app.travelEndDate), "dd MMM yyyy")}
                      </span>
                      <Badge variant="secondary" className="ml-auto text-xs">
                        {numDays} {numDays === 1 ? "day" : "days"}
                      </Badge>
                    </div>

                    {/* Vehicle & Passengers */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1.5">
                        <VehicleIcon className="h-4 w-4 text-muted-foreground" />
                        <span>{vehicleTypeLabels[app.vehicleType]}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{app.passengerCount} pax</span>
                      </div>
                    </div>

                    {/* Insurance & Add-ons */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Package className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="text-muted-foreground">Package:</span>
                        <span className="font-medium">{packageTypeLabels[app.packageType]}</span>
                      </div>
                      {app.addons && app.addons.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm text-muted-foreground">Add-ons:</span>
                          {app.addons.map((addon) => (
                            <Badge
                              key={addon}
                              variant="outline"
                              className="text-xs border-primary/30 text-primary"
                            >
                              {addon}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Footer: Price, Payment & Delivery */}
                    <div className="pt-3 border-t flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-foreground">RM {app.totalPrice}</p>
                        <Badge
                          variant={app.paymentStatus === "paid" ? "default" : "destructive"}
                          className="mt-1 text-xs"
                        >
                          {app.paymentStatus === "paid" ? "Paid" : "Unpaid"}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Truck className="h-4 w-4" />
                          <span>{deliveryLabels[app.deliveryOption]}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          #{app.id}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredApplications.length)} of {filteredApplications.length} results
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
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let page: number;
                  if (totalPages <= 5) {
                    page = i + 1;
                  } else if (currentPage <= 3) {
                    page = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    page = totalPages - 4 + i;
                  } else {
                    page = currentPage - 2 + i;
                  }
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      className="w-8 h-8 p-0"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  );
                })}
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

        {/* Edit Status Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Application Status</DialogTitle>
              <DialogDescription>
                #{editingApp?.id} - {editingApp?.customerName}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Select value={newStatus} onValueChange={(v) => setNewStatus(v as ApplicationStatus)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateStatus}>
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Applications;
