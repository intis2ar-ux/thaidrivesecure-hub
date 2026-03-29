import { useState } from "react";
import { format } from "date-fns";
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
import { Package, Shield, Car, Truck, Smartphone, Filter, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { useAddons, useApplications } from "@/hooks/useFirestore";
import { AddonType } from "@/types";

const ITEMS_PER_PAGE = 10;

const Addons = () => {
  const { addons, loading } = useAddons();
  const { applications } = useApplications();
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>("desc");

  const filteredAddons = addons
    .filter((addon) => typeFilter === "all" || addon.type === typeFilter)
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

  const totalPages = Math.ceil(filteredAddons.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedAddons = filteredAddons.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleTypeFilterChange = (value: string) => {
    setTypeFilter(value);
    setCurrentPage(1);
  };

  const getApplication = (appId: string) => {
    // appId format is "orderId_addon_index", extract orderId
    const orderId = appId.includes("_addon_") ? appId.split("_addon_")[0] : appId;
    return applications.find((a) => a.id === orderId);
  };

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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{addonStats.total}</p><p className="text-sm text-muted-foreground">Total Add-ons</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-warning">{addonStats.pending}</p><p className="text-sm text-muted-foreground">Pending</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-accent">{addonStats.confirmed}</p><p className="text-sm text-muted-foreground">Confirmed</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-success">{addonStats.completed}</p><p className="text-sm text-muted-foreground">Completed</p></CardContent></Card>
        </div>

        <Select value={typeFilter} onValueChange={handleTypeFilterChange}>
          <SelectTrigger className="w-48 bg-background"><Filter className="h-4 w-4 mr-2" /><SelectValue placeholder="All Types" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
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
                    <TableHead className="text-primary font-medium">Applicant</TableHead>
                    <TableHead className="text-primary font-medium">Type</TableHead>
                    <TableHead className="text-primary font-medium">Vehicle</TableHead>
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedAddons.map((addon) => {
                    const app = getApplication(addon.applicationId);
                    return (
                      <TableRow key={addon.id} className="hover:bg-muted/30 border-b border-border/30">
                        <TableCell>
                          <p className="font-medium text-foreground">{app?.name || "-"}</p>
                          <p className="text-xs text-muted-foreground">{app?.phone || ""}</p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getAddonIcon(addon.type)}
                            <span className="capitalize">{addon.type.replace("_", " ")}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{app?.vehicleType ? app.vehicleType.replace("_", " ") : "-"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {addon.createdAt ? format(addon.createdAt, "dd MMM yyyy, HH:mm") : "-"}
                        </TableCell>
                        <TableCell><StatusBadge variant={addon.status}>{addon.status}</StatusBadge></TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}

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
