import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Package, Shield, Car, Truck, Smartphone, Filter, MoreVertical, CheckCircle, Clock, XCircle, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useAddons, useApplications } from "@/hooks/useFirestore";
import { AddonType } from "@/types";
import { useToast } from "@/hooks/use-toast";

const ITEMS_PER_PAGE = 10;

const Addons = () => {
  const { toast } = useToast();
  const { addons, loading, updateAddonStatus } = useAddons();
  const { applications } = useApplications();
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredAddons = addons.filter(
    (addon) => typeFilter === "all" || addon.type === typeFilter
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredAddons.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedAddons = filteredAddons.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleTypeFilterChange = (value: string) => {
    setTypeFilter(value);
    setCurrentPage(1);
  };

  const getApplication = (appId: string) => applications.find((a) => a.id === appId);

  const getAddonIcon = (type: AddonType) => {
    switch (type) {
      case "insurance": return <Shield className="h-4 w-4" />;
      case "tdac": return <Car className="h-4 w-4" />;
      case "towing": return <Truck className="h-4 w-4" />;
      case "sim_card": return <Smartphone className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const addonStats = {
    total: addons.length,
    pending: addons.filter((a) => a.status === "pending").length,
    confirmed: addons.filter((a) => a.status === "confirmed").length,
    completed: addons.filter((a) => a.status === "completed").length,
    totalRevenue: addons.reduce((sum, a) => sum + a.cost, 0),
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await updateAddonStatus(id, newStatus as any);
      toast({ title: "Status Updated", description: `Addon status changed to ${newStatus}` });
    } catch { toast({ title: "Error", description: "Failed to update status", variant: "destructive" }); }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Header title="Add-ons" subtitle="Manage addon services and vendor integrations" />
        <div className="p-6 space-y-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-96" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Header title="Add-ons" subtitle="Manage addon services and vendor integrations" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{addonStats.total}</p><p className="text-sm text-muted-foreground">Total Add-ons</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-warning">{addonStats.pending}</p><p className="text-sm text-muted-foreground">Pending</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-accent">{addonStats.confirmed}</p><p className="text-sm text-muted-foreground">Confirmed</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-success">{addonStats.completed}</p><p className="text-sm text-muted-foreground">Completed</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">RM{addonStats.totalRevenue.toLocaleString()}</p><p className="text-sm text-muted-foreground">Total Revenue</p></CardContent></Card>
        </div>

        <Select value={typeFilter} onValueChange={handleTypeFilterChange}>
          <SelectTrigger className="w-48 bg-background"><Filter className="h-4 w-4 mr-2" /><SelectValue placeholder="All Types" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="insurance">Insurance</SelectItem>
            <SelectItem value="tdac">TDAC</SelectItem>
            <SelectItem value="towing">Towing</SelectItem>
            <SelectItem value="sim_card">SIM Card</SelectItem>
          </SelectContent>
        </Select>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-base font-semibold text-accent mb-4">Add-ons ({filteredAddons.length})</h3>
            {filteredAddons.length === 0 ? <p className="text-center text-muted-foreground py-8">No addons found</p> : (
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border/50">
                    <TableHead className="text-primary font-medium">Addon ID</TableHead>
                    <TableHead className="text-primary font-medium">Application</TableHead>
                    <TableHead className="text-primary font-medium">Type</TableHead>
                    <TableHead className="text-primary font-medium">Cost</TableHead>
                    <TableHead className="text-primary font-medium">Tracking</TableHead>
                    <TableHead className="text-primary font-medium">Status</TableHead>
                    <TableHead className="text-primary font-medium text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedAddons.map((addon) => {
                    const app = getApplication(addon.applicationId);
                    return (
                      <TableRow key={addon.id} className="hover:bg-muted/30 border-b border-border/30">
                        <TableCell className="font-mono text-sm text-accent">{addon.id}</TableCell>
                        <TableCell>
                          <p className="font-medium text-foreground">{addon.applicationId}</p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getAddonIcon(addon.type)}
                            <span className="capitalize">{addon.type.replace("_", " ")}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">RM{addon.cost.toLocaleString()}</TableCell>
                        <TableCell>
                          {addon.trackingNumber ? (
                            <span className="font-mono text-sm">{addon.trackingNumber}</span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell><StatusBadge variant={addon.status}>{addon.status}</StatusBadge></TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="ghost">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-background border shadow-lg z-50">
                              <DropdownMenuItem onClick={() => handleUpdateStatus(addon.id, "pending")}>
                                <Clock className="h-4 w-4 mr-2 text-warning" />
                                Mark as Pending
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdateStatus(addon.id, "confirmed")}>
                                <AlertCircle className="h-4 w-4 mr-2 text-accent" />
                                Mark as Confirmed
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdateStatus(addon.id, "completed")}>
                                <CheckCircle className="h-4 w-4 mr-2 text-success" />
                                Mark as Completed
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdateStatus(addon.id, "cancelled")}>
                                <XCircle className="h-4 w-4 mr-2 text-destructive" />
                                Mark as Cancelled
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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
                  Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredAddons.length)} of {filteredAddons.length} results
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

export default Addons;
