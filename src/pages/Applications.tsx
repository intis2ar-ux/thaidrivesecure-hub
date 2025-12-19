import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Search, Filter, Eye, Edit, Truck } from "lucide-react";
import { useApplications } from "@/hooks/useFirestore";
import { Application, ApplicationStatus } from "@/types";
import { format } from "date-fns";

const Applications = () => {
  const { applications, loading, updateApplicationStatus } = useApplications();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [newStatus, setNewStatus] = useState<ApplicationStatus>("pending");
  const [isEditOpen, setIsEditOpen] = useState(false);

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

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.trackingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, tracking ID, or application ID..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Status" />
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
            </div>
          </CardContent>
        </Card>

        {/* Applications Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              All Applications ({filteredApplications.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredApplications.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No applications found
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Application ID</TableHead>
                    <TableHead>Tracking ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Document Type</TableHead>
                    <TableHead>Submission Date</TableHead>
                    <TableHead>Delivery</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.map((app) => (
                    <TableRow key={app.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{app.id}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {app.trackingId}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{app.customerName}</p>
                          <p className="text-xs text-muted-foreground">
                            {app.customerEmail}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{app.documentType}</TableCell>
                      <TableCell>
                        {format(app.submissionDate, "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4 text-muted-foreground" />
                          <span className="capitalize text-sm">
                            {app.deliveryOption}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge variant={app.status}>{app.status}</StatusBadge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSelectedApp(app)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Application Details</DialogTitle>
                                <DialogDescription>
                                  {app.trackingId}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid grid-cols-2 gap-4 py-4">
                                <div className="space-y-1">
                                  <p className="text-sm text-muted-foreground">
                                    Application ID
                                  </p>
                                  <p className="font-medium">{app.id}</p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-sm text-muted-foreground">
                                    Status
                                  </p>
                                  <StatusBadge variant={app.status}>
                                    {app.status}
                                  </StatusBadge>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-sm text-muted-foreground">
                                    Customer Name
                                  </p>
                                  <p className="font-medium">{app.customerName}</p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-sm text-muted-foreground">
                                    Email
                                  </p>
                                  <p className="font-medium">{app.customerEmail}</p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-sm text-muted-foreground">
                                    Document Type
                                  </p>
                                  <p className="font-medium">{app.documentType}</p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-sm text-muted-foreground">
                                    Submission Date
                                  </p>
                                  <p className="font-medium">
                                    {format(app.submissionDate, "PPP")}
                                  </p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-sm text-muted-foreground">
                                    Delivery Option
                                  </p>
                                  <p className="font-medium capitalize">
                                    {app.deliveryOption}
                                  </p>
                                </div>
                                {app.deliveryTrackingId && (
                                  <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">
                                      Delivery Tracking
                                    </p>
                                    <p className="font-medium font-mono">
                                      {app.deliveryTrackingId}
                                    </p>
                                  </div>
                                )}
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button variant="outline">View History</Button>
                                <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
                                  Update Status
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(app)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Edit Status Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Application Status</DialogTitle>
              <DialogDescription>
                {editingApp?.trackingId} - {editingApp?.customerName}
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
      </div>
    </DashboardLayout>
  );
};

export default Applications;
