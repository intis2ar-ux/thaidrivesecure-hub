import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Search, Filter, MapPin, Car, Bike } from "lucide-react";
import { useApplications } from "@/hooks/useFirestore";
import { Application, ApplicationStatus } from "@/types";
import { format } from "date-fns";

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
  takeaway: "Pickup",
  email_pdf: "Via PDF",
  shipping: "Courier",
};

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
      app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.customerPhone.includes(searchTerm);
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
                  placeholder="Search by name, ID, or phone..."
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
                    <TableHead className="text-primary font-medium">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.map((app) => {
                    const VehicleIcon = app.vehicleType === "motorcycle" ? Bike : Car;
                    return (
                    <TableRow 
                      key={app.id} 
                      className="hover:bg-muted/30 border-b border-border/30 cursor-pointer"
                      onClick={() => {
                        setSelectedApp(app);
                        openEditDialog(app);
                      }}
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
                          {app.travelDate ? format(app.travelDate, "dd/MM/yyyy") : "-"}
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
                        RM {app.totalPrice ?? 0}
                      </TableCell>
                      <TableCell>
                        <StatusBadge variant={app.status}>{app.status}</StatusBadge>
                      </TableCell>
                    </TableRow>
                  )})}
                </TableBody>
              </Table>
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
      </div>
    </DashboardLayout>
  );
};

export default Applications;