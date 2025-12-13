import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
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
  Package,
  Shield,
  Car,
  Truck,
  Smartphone,
  Filter,
  Edit,
} from "lucide-react";
import { mockAddons, mockApplications } from "@/data/mockData";
import { AddonType } from "@/types";
import { useToast } from "@/hooks/use-toast";

const Addons = () => {
  const { toast } = useToast();
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const filteredAddons = mockAddons.filter(
    (addon) => typeFilter === "all" || addon.type === typeFilter
  );

  const getApplication = (appId: string) =>
    mockApplications.find((a) => a.id === appId);

  const getAddonIcon = (type: AddonType) => {
    switch (type) {
      case "insurance":
        return <Shield className="h-4 w-4" />;
      case "tdac":
        return <Car className="h-4 w-4" />;
      case "towing":
        return <Truck className="h-4 w-4" />;
      case "sim_card":
        return <Smartphone className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const addonStats = {
    total: mockAddons.length,
    pending: mockAddons.filter((a) => a.status === "pending").length,
    confirmed: mockAddons.filter((a) => a.status === "confirmed").length,
    completed: mockAddons.filter((a) => a.status === "completed").length,
    totalRevenue: mockAddons.reduce((sum, a) => sum + a.cost, 0),
  };

  const handleUpdateStatus = (id: string, newStatus: string) => {
    toast({
      title: "Status Updated",
      description: `Addon ${id} status changed to ${newStatus}`,
    });
  };

  return (
    <DashboardLayout>
      <Header
        title="Add-ons"
        subtitle="Manage addon services and vendor integrations"
      />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{addonStats.total}</p>
              <p className="text-sm text-muted-foreground">Total Add-ons</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-warning">{addonStats.pending}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-accent">{addonStats.confirmed}</p>
              <p className="text-sm text-muted-foreground">Confirmed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-success">{addonStats.completed}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">฿{addonStats.totalRevenue.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
            </CardContent>
          </Card>
        </div>

        {/* Type Distribution */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(["insurance", "tdac", "towing", "sim_card"] as AddonType[]).map(
            (type) => {
              const count = mockAddons.filter((a) => a.type === type).length;
              return (
                <Card
                  key={type}
                  className="cursor-pointer hover:border-accent transition-colors"
                  onClick={() => setTypeFilter(type)}
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="p-3 rounded-full bg-secondary">
                      {getAddonIcon(type)}
                    </div>
                    <div>
                      <p className="text-xl font-bold">{count}</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {type.replace("_", " ")}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            }
          )}
        </div>

        {/* Filter */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="insurance">Insurance</SelectItem>
                  <SelectItem value="tdac">TDAC</SelectItem>
                  <SelectItem value="towing">Towing</SelectItem>
                  <SelectItem value="sim_card">SIM Card</SelectItem>
                </SelectContent>
              </Select>
              {typeFilter !== "all" && (
                <Button variant="ghost" size="sm" onClick={() => setTypeFilter("all")}>
                  Clear filter
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Addons Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Add-ons ({filteredAddons.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Addon ID</TableHead>
                  <TableHead>Application</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Tracking</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAddons.map((addon) => {
                  const app = getApplication(addon.applicationId);
                  return (
                    <TableRow key={addon.id} className="hover:bg-muted/50">
                      <TableCell className="font-mono text-sm">
                        {addon.id}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{addon.applicationId}</p>
                          <p className="text-xs text-muted-foreground">
                            {app?.customerName}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getAddonIcon(addon.type)}
                          <span className="capitalize">
                            {addon.type.replace("_", " ")}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{addon.vendorName}</TableCell>
                      <TableCell className="font-medium">
                        ฿{addon.cost.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {addon.trackingNumber ? (
                          <span className="font-mono text-sm">
                            {addon.trackingNumber}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusBadge variant={addon.status}>
                          {addon.status}
                        </StatusBadge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleUpdateStatus(addon.id, "confirmed")}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Addons;
