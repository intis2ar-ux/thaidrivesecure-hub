import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { notifyApplicationStatusChanged } from "@/lib/services/notificationService";
import { useAuth } from "@/contexts/AuthContext";
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
import { Search, Filter, MapPin, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, Eye, AlertTriangle, CheckCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { ApplicationDetailPanel } from "@/components/applications/ApplicationDetailPanel";
import { useApplications } from "@/hooks/useFirestore";
import { Application, ApplicationStatus } from "@/types";
import { format } from "date-fns";
import { formatPrice } from "@/lib/pricing";

const ITEMS_PER_PAGE = 10;

const Applications = () => {
  const { applications, loading, updateApplicationStatus } = useApplications();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [newStatus, setNewStatus] = useState<ApplicationStatus>("pending");
  const [statusNotes, setStatusNotes] = useState("");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>("desc");

  const handleSelectStatus = () => {
    if (newStatus === "approved" || newStatus === "rejected") {
      setIsEditOpen(false);
      setIsConfirmOpen(true);
    } else {
      handleUpdateStatus();
    }
  };

  const handleUpdateStatus = async () => {
    if (!editingApp) return;
    const performer = user?.name || user?.email || "Unknown";
    try {
      await updateApplicationStatus(editingApp.id, newStatus, {
        previousStatus: editingApp.status,
        notes: statusNotes,
        performedBy: performer,
      });
      await notifyApplicationStatusChanged(editingApp.id, editingApp.name, newStatus, performer);
      toast({
        title: "Status Updated",
        description: `Application #${editingApp.id} set to ${newStatus}.`,
      });
    } catch {
      toast({ title: "Error", description: "Failed to update status.", variant: "destructive" });
    }
    setIsEditOpen(false);
    setIsConfirmOpen(false);
    setEditingApp(null);
    setStatusNotes("");
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
        app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.phone.includes(searchTerm) ||
        (app.userId || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || app.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (!sortOrder) return 0;
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
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
              placeholder="Search by name, phone, or user ID..."
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
                        <TableHead className="text-primary font-medium">Customer Name</TableHead>
                        <TableHead className="text-primary font-medium">Phone</TableHead>
                        <TableHead className="text-primary font-medium">Vehicle Type</TableHead>
                        <TableHead className="text-primary font-medium">Border Route</TableHead>
                        <TableHead className="text-primary font-medium">Travel Day</TableHead>
                        <TableHead className="text-primary font-medium">Packages</TableHead>
                        <TableHead className="text-primary font-medium">Passengers</TableHead>
                        <TableHead className="text-primary font-medium">Total Price</TableHead>
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
                      {paginatedApplications.map((app) => (
                        <TableRow 
                          key={app.id} 
                          className="hover:bg-muted/30 border-b border-border/30"
                        >
                          <TableCell>
                            <p className="font-medium text-accent">{app.name}</p>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm text-foreground">{app.phone || <span className="text-muted-foreground italic">-</span>}</p>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm text-foreground">{app.vehicleType || <span className="text-muted-foreground italic">-</span>}</p>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-sm font-medium">{app.where || "-"}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm text-foreground">{app.when || "-"}</p>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1 flex-wrap">
                              {app.packages && app.packages.length > 0 ? (
                                app.packages.map((pkg) => (
                                  <Badge 
                                    key={pkg} 
                                    variant="outline" 
                                    className="text-xs py-0.5 px-2 border-accent text-accent bg-accent/5"
                                  >
                                    {pkg}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-muted-foreground text-sm">-</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm text-foreground">{app.passengers}</p>
                          </TableCell>
                          <TableCell className="font-semibold text-foreground">
                            {formatPrice(app.totalPrice)}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {app.createdAt ? format(app.createdAt, "dd MMM yyyy, HH:mm") : "-"}
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
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2 text-muted-foreground hover:text-accent"
                                onClick={(e) => openEditDialog(app, e)}
                              >
                                Edit Status
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
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
                #{editingApp?.id} - {editingApp?.name}
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
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSelectStatus}>
                Continue
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Confirmation Dialog for Approve/Reject */}
        <Dialog open={isConfirmOpen} onOpenChange={(open) => { if (!open) { setIsConfirmOpen(false); setStatusNotes(""); } }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {newStatus === "approved" ? (
                  <CheckCircle className="h-5 w-5 text-success" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                )}
                Confirm {newStatus === "approved" ? "Approval" : "Rejection"}
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to {newStatus === "approved" ? "approve" : "reject"} application <strong>#{editingApp?.id}</strong> for <strong>{editingApp?.name}</strong>?
                {newStatus === "approved" && " This means the customer has paid."}
                {newStatus === "rejected" && " This will deny the application."}
              </DialogDescription>
            </DialogHeader>
            <div className="py-2 space-y-2">
              <label className="text-sm font-medium text-foreground">Notes (optional)</label>
              <Textarea
                placeholder={newStatus === "rejected" ? "Reason for rejection..." : "Any notes about this approval..."}
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setIsConfirmOpen(false); setIsEditOpen(true); }}>
                Back
              </Button>
              <Button
                variant={newStatus === "rejected" ? "destructive" : "default"}
                onClick={handleUpdateStatus}
              >
                {newStatus === "approved" ? "Confirm Approval" : "Confirm Rejection"}
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
