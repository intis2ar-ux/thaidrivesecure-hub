import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Package, Shield, Car, Truck, Smartphone, Filter, Edit } from "lucide-react";
import { useAddons, useApplications } from "@/hooks/useFirestore";
import { AddonType } from "@/types";
import { useToast } from "@/hooks/use-toast";

const Addons = () => {
  const { toast } = useToast();
  const { addons, loading, updateAddonStatus } = useAddons();
  const { applications } = useApplications();
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const filteredAddons = addons.filter(
    (addon) => typeFilter === "all" || addon.type === typeFilter
  );

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

        <Card>
          <CardContent className="p-4">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48"><Filter className="h-4 w-4 mr-2" /><SelectValue placeholder="Filter by type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="insurance">Insurance</SelectItem>
                <SelectItem value="tdac">TDAC</SelectItem>
                <SelectItem value="towing">Towing</SelectItem>
                <SelectItem value="sim_card">SIM Card</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base font-semibold">Add-ons ({filteredAddons.length})</CardTitle></CardHeader>
          <CardContent>
            {filteredAddons.length === 0 ? <p className="text-center text-muted-foreground py-8">No addons found</p> : (
              <Table>
                <TableHeader><TableRow><TableHead>Addon ID</TableHead><TableHead>Application</TableHead><TableHead>Type</TableHead><TableHead>Vendor</TableHead><TableHead>Cost</TableHead><TableHead>Tracking</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {filteredAddons.map((addon) => {
                    const app = getApplication(addon.applicationId);
                    return (
                      <TableRow key={addon.id} className="hover:bg-muted/50">
                        <TableCell className="font-mono text-sm">{addon.id}</TableCell>
                        <TableCell><div><p className="font-medium">{addon.applicationId}</p><p className="text-xs text-muted-foreground">{app?.customerName}</p></div></TableCell>
                        <TableCell><div className="flex items-center gap-2">{getAddonIcon(addon.type)}<span className="capitalize">{addon.type.replace("_", " ")}</span></div></TableCell>
                        <TableCell>{addon.vendorName}</TableCell>
                        <TableCell className="font-medium">RM{addon.cost.toLocaleString()}</TableCell>
                        <TableCell>{addon.trackingNumber ? <span className="font-mono text-sm">{addon.trackingNumber}</span> : <span className="text-muted-foreground">-</span>}</TableCell>
                        <TableCell><StatusBadge variant={addon.status}>{addon.status}</StatusBadge></TableCell>
                        <TableCell className="text-right"><Button size="sm" variant="ghost" onClick={() => handleUpdateStatus(addon.id, "confirmed")}><Edit className="h-4 w-4" /></Button></TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Addons;
