import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Search, Filter, Eye, CheckCircle, XCircle, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { useInsuranceApplications } from "@/hooks/useInsuranceApplications";
import { InsuranceApplication } from "@/types/insurance";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";

const ITEMS_PER_PAGE = 10;

const statusColors: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
  Approved: "bg-green-100 text-green-800 border-green-300",
  Rejected: "bg-red-100 text-red-800 border-red-300",
};

const InsuranceApplicationsPage = () => {
  const [searchParams] = useSearchParams();
  const initialFilter = searchParams.get("status") || "all";

  const { applications, loading, approveApplication, rejectApplication } = useInsuranceApplications();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(initialFilter);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>("desc");
  const [selectedApp, setSelectedApp] = useState<InsuranceApplication | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ app: InsuranceApplication; action: "approve" | "reject" } | null>(null);

  const handleApprove = async () => {
    if (!confirmAction) return;
    try {
      await approveApplication(confirmAction.app.id);
      toast({ title: "Application Approved", description: `${confirmAction.app.fullName}'s application has been approved.` });
    } catch {
      toast({ title: "Error", description: "Failed to approve application.", variant: "destructive" });
    }
    setConfirmAction(null);
  };

  const handleReject = async () => {
    if (!confirmAction) return;
    try {
      await rejectApplication(confirmAction.app.id);
      toast({ title: "Application Rejected", description: `${confirmAction.app.fullName}'s application has been rejected.` });
    } catch {
      toast({ title: "Error", description: "Failed to reject application.", variant: "destructive" });
    }
    setConfirmAction(null);
  };

  const filteredApplications = applications
    .filter((app) => {
      const matchesSearch =
        app.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.icNumber.includes(searchTerm) ||
        app.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || app.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (!sortOrder) return 0;
      return sortOrder === "desc"
        ? b.createdAt.getTime() - a.createdAt.getTime()
        : a.createdAt.getTime() - b.createdAt.getTime();
    });

  const totalPages = Math.ceil(filteredApplications.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedApplications = filteredApplications.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "desc" ? "asc" : prev === "asc" ? null : "desc"));
    setCurrentPage(1);
  };

  const getSortIcon = () => {
    if (sortOrder === "desc") return <ArrowDown className="h-4 w-4" />;
    if (sortOrder === "asc") return <ArrowUp className="h-4 w-4" />;
    return <ArrowUpDown className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Header title="Insurance Applications" subtitle="Manage insurance applications from mobile users" />
        <div className="p-6 space-y-6">
          <Skeleton className="h-16" />
          <Skeleton className="h-96" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Header title="Insurance Applications" subtitle="Real-time insurance applications from mobile users" />

      <div className="p-6 space-y-6">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, IC number, or plate..."
              className="pl-10 bg-background border"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
            <SelectTrigger className="w-40 bg-background">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Approved">Approved</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-base font-semibold text-accent mb-4">
              All Insurance Applications ({filteredApplications.length})
            </h3>
            {filteredApplications.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-lg">No applications yet</p>
                <p className="text-muted-foreground text-sm mt-1">Applications submitted from the mobile app will appear here in real-time.</p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-6">
                <div className="min-w-[1000px] px-6">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-border/50">
                        <TableHead className="text-primary font-medium">Full Name</TableHead>
                        <TableHead className="text-primary font-medium">IC Number</TableHead>
                        <TableHead className="text-primary font-medium">Vehicle Plate</TableHead>
                        <TableHead className="text-primary font-medium">Chassis Number</TableHead>
                        <TableHead className="text-primary font-medium">Insurance Type</TableHead>
                        <TableHead className="text-primary font-medium">Status</TableHead>
                        <TableHead
                          className="text-primary font-medium cursor-pointer hover:bg-muted/50 transition-colors select-none"
                          onClick={toggleSortOrder}
                        >
                          <div className="flex items-center gap-1">
                            Created At
                            {getSortIcon()}
                          </div>
                        </TableHead>
                        <TableHead className="text-primary font-medium w-48">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedApplications.map((app) => (
                        <TableRow key={app.id} className="hover:bg-muted/30 border-b border-border/30">
                          <TableCell className="font-medium">{app.fullName}</TableCell>
                          <TableCell className="font-mono text-sm">{app.icNumber}</TableCell>
                          <TableCell className="font-mono uppercase">{app.vehiclePlate}</TableCell>
                          <TableCell className="font-mono text-sm">{app.chassisNumber}</TableCell>
                          <TableCell>{app.insuranceType}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[app.status]}`}>
                              {app.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {format(app.createdAt, "dd MMM yyyy, HH:mm")}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2 text-muted-foreground hover:text-primary"
                                onClick={() => setSelectedApp(app)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              {app.status === "Pending" && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-2 text-success hover:text-success hover:bg-success/10"
                                    onClick={() => setConfirmAction({ app, action: "approve" })}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => setConfirmAction({ app, action: "reject" })}
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Reject
                                  </Button>
                                </>
                              )}
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
                  Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredApplications.length)} of {filteredApplications.length}
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1}>
                    <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button key={page} variant={currentPage === page ? "default" : "outline"} size="sm" className="w-8 h-8 p-0" onClick={() => setCurrentPage(page)}>
                      {page}
                    </Button>
                  ))}
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>
                    Next <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* View Details Modal */}
      <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>Insurance application #{selectedApp?.id?.slice(0, 8)}</DialogDescription>
          </DialogHeader>
          {selectedApp && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Full Name</p>
                  <p className="font-medium">{selectedApp.fullName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">IC Number</p>
                  <p className="font-mono">{selectedApp.icNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Vehicle Plate</p>
                  <p className="font-mono uppercase">{selectedApp.vehiclePlate}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Chassis Number</p>
                  <p className="font-mono">{selectedApp.chassisNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Insurance Type</p>
                  <p>{selectedApp.insuranceType}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[selectedApp.status]}`}>
                    {selectedApp.status}
                  </span>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">Created At</p>
                  <p>{format(selectedApp.createdAt, "dd MMM yyyy, HH:mm:ss")}</p>
                </div>
              </div>
              {selectedApp.status === "Pending" && (
                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    className="flex-1 bg-success hover:bg-success/90 text-success-foreground"
                    onClick={() => { setSelectedApp(null); setConfirmAction({ app: selectedApp, action: "approve" }); }}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" /> Approve
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => { setSelectedApp(null); setConfirmAction({ app: selectedApp, action: "reject" }); }}
                  >
                    <XCircle className="h-4 w-4 mr-2" /> Reject
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm Action Dialog */}
      <AlertDialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction?.action === "approve" ? "Approve Application?" : "Reject Application?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {confirmAction?.action} the application for{" "}
              <strong>{confirmAction?.app.fullName}</strong>? This action will update the status immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAction?.action === "approve" ? handleApprove : handleReject}
              className={confirmAction?.action === "approve" ? "bg-success hover:bg-success/90" : "bg-destructive hover:bg-destructive/90"}
            >
              {confirmAction?.action === "approve" ? "Yes, Approve" : "Yes, Reject"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default InsuranceApplicationsPage;
