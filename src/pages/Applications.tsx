import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { Search, Filter, MapPin, Car, Bike, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, Eye } from "lucide-react";
import { ApplicationDetailPanel } from "@/components/applications/ApplicationDetailPanel";
import { useApplications } from "@/hooks/useFirestore";
import { Application, ApplicationStatus } from "@/types";
import { format, differenceInDays } from "date-fns";
import { calculatePricingBreakdown, formatPrice } from "@/lib/pricing";

// Helper to calculate number of days for pricing
const calculateDays = (startDate?: Date, endDate?: Date): number => {
  if (!startDate) return 7;
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000);
  const days = differenceInDays(end, start) + 1;
  return days > 0 ? days : 1;
};

// Helper to get calculated total price
const getCalculatedTotal = (app: Application): number => {
  const days = calculateDays(app.travelDate, app.travelEndDate);
  const breakdown = calculatePricingBreakdown(
    app.packageType,
    app.vehicleType,
    app.passengerCount || 1,
    app.addons || [],
    days
  );
  return breakdown.totalPrice;
};

const vehicleTypeLabels: Record<string, string> = {
  sedan: "Sedan",
  mpv: "MPV",
  pickup_suv: "Pickup/SUV",
  motorcycle: "Motorcycle",
};

const packageTypeLabels: Record<string, string> = {
  compulsory: "Compulsory",
  compulsory_voluntary: "Compulsory & Voluntary",
};

const deliveryLabels: Record<string, string> = {
  takeaway: "Self Collect",
  email_pdf: "Via PDF",
  shipping: "Courier",
};

const ITEMS_PER_PAGE = 10;

const Applications = () => {
  const { applications, loading, updateApplicationStatus } = useApplications();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [newStatus, setNewStatus] = useState<ApplicationStatus>("pending");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>("desc");

  const handleUpdateStatus = async () => {
    if (!editingApp) return;
    await updateApplicationStatus(editingApp.id, newStatus);
    setIsEditOpen(false);
    setEditingApp(null);
  };

  const openEditDialog = (app: Application, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingApp(app);
    setNewStatus(app.status);
    setIsEditOpen(true);
  };

  const openDetailPanel = (app: Application) => {
    setSelectedApp(app);
    setIsDetailOpen(true);
  };

  const filteredApplications = applications
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

  // Pagination logic
  const totalPages = Math.ceil(filteredApplications.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedApplications = filteredApplications.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Reset to first page when filters change
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
          subtitle="Manage and track all customer applications"
        />
        <div className="p-6 space-y-6">
          <Skeleton className="h-16" />
          <Skeleton className="h-96" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Header
        title="Applications"
        subtitle="Manage and track all customer applications"
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
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Applications Table */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-base font-semibold text-accent mb-4">
              All Applications ({filteredApplications.length})
            </h3>
            {filteredApplications.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No applications found
              </p>
            ) : (
              <div className="overflow-x-auto -mx-6">
                <div className="min-w-[1200px] px-6">
                  <Table>
                <TableHeader>
                  <TableRow className="border-b border-border/50">
                    <TableHead className="text-primary font-medium">Customer</TableHead>
                    <TableHead className="text-primary font-medium">Phone</TableHead>
                    <TableHead className="text-primary font-medium">Destination</TableHead>
                    <TableHead className="text-primary font-medium">Trip</TableHead>
                    <TableHead className="text-primary font-medium">Vehicle</TableHead>
                    <TableHead className="text-primary font-medium">Package</TableHead>
                    <TableHead className="text-primary font-medium">Add-ons</TableHead>
                    <TableHead className="text-primary font-medium">Delivery</TableHead>
                    <TableHead className="text-primary font-medium">Total</TableHead>
                    <TableHead 
                      className="text-primary font-medium cursor-pointer hover:bg-muted/50 transition-colors select-none"
                      onClick={toggleSortOrder}
                    >
                      <div className="flex items-center gap-1">
                        Created At
                        {getSortIcon()}
                      </div>
                    </TableHead>
                    <TableHead className="text-primary font-medium">Status</TableHead>
                    <TableHead className="text-primary font-medium w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedApplications.map((app) => {
                    const VehicleIcon = app.vehicleType === "motorcycle" ? Bike : Car;
                    return (
                    <TableRow 
                      key={app.id} 
                      className="hover:bg-muted/30 border-b border-border/30"
                    >
                      <TableCell>
                        <div>
                          <p className="font-medium text-accent">{app.customerName}</p>
                          <p className="text-xs text-accent/80">
                            {app.customerEmail || <span className="italic text-muted-foreground">No email</span>}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-foreground">{app.customerPhone || <span className="text-muted-foreground italic">-</span>}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                          <div>
                            <span className="text-sm font-medium">{app.destination || "-"}</span>
                            {app.destination && <span className="text-sm text-muted-foreground">, Thailand</span>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-foreground">
                          {app.travelDate ? (
                            <>
                              {format(app.travelDate, "dd/MM/yyyy")}
                              <span className="text-muted-foreground">
                                {" "}– {format(
                                  app.travelEndDate || new Date(new Date(app.travelDate).getTime() + 6 * 24 * 60 * 60 * 1000),
                                  "dd/MM/yyyy"
                                )}
                              </span>
                            </>
                          ) : "-"}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <VehicleIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{vehicleTypeLabels[app.vehicleType] || "-"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{packageTypeLabels[app.packageType] || "-"}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {app.addons && app.addons.length > 0 ? (
                            app.addons.map((addon) => (
                              <Badge 
                                key={addon} 
                                variant="outline" 
                                className="text-xs py-0.5 px-2 border-accent text-accent bg-accent/5"
                              >
                                {addon}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs bg-muted/50">
                          {deliveryLabels[app.deliveryOption] || "-"}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold text-foreground">
                        {formatPrice(getCalculatedTotal(app))}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {app.submissionDate ? format(app.submissionDate, "dd MMM yyyy, HH:mm") : "-"}
                      </TableCell>
                      <TableCell>
                        <StatusBadge variant={app.status}>{app.status}</StatusBadge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-muted-foreground hover:text-primary"
                            onClick={() => openDetailPanel(app)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Details
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )})}
                </TableBody>
              </Table>
                </div>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t">
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
                  <SelectItem value="verified">Verified</SelectItem>
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

        {/* Application Detail Panel */}
        <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <SheetContent side="right" className="w-full sm:w-[480px] p-0">
            {selectedApp && (
              <ApplicationDetailPanel 
                application={selectedApp} 
                onClose={() => setIsDetailOpen(false)} 
              />
            )}
          </SheetContent>
        </Sheet>
      </div>
    </DashboardLayout>
  );
};

export default Applications;