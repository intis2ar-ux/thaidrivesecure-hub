import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { TrackingSearch } from "@/components/tracking/TrackingSearch";
import { DeliveryTable } from "@/components/tracking/DeliveryTable";
import { DeliveryTimeline } from "@/components/tracking/DeliveryTimeline";
import { DeliveryManagementPanel } from "@/components/tracking/DeliveryManagementPanel";
import { mockDeliveries } from "@/data/mockDeliveries";
import { DeliveryRecord, DeliveryStatus } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Truck, 
  Package, 
  CheckCircle2, 
  Clock, 
  Mail,
  Star,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const TrackingDelivery = () => {
  const { toast } = useToast();
  const [deliveries, setDeliveries] = useState<DeliveryRecord[]>(mockDeliveries);
  const [searchResult, setSearchResult] = useState<DeliveryRecord | null>(null);
  const [searchNotFound, setSearchNotFound] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryRecord | null>(null);
  const [managePanelOpen, setManagePanelOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<DeliveryStatus | "all">("all");
  const [methodFilter, setMethodFilter] = useState<"all" | "courier" | "email">("all");

  // Calculate stats
  const stats = useMemo(() => {
    const pending = deliveries.filter((d) => d.status === "pending").length;
    const inTransit = deliveries.filter((d) => d.status === "in_transit" || d.status === "shipped").length;
    const delivered = deliveries.filter((d) => d.status === "delivered").length;
    const priority = deliveries.filter((d) => d.isPriority && d.status !== "delivered").length;
    return { pending, inTransit, delivered, priority, total: deliveries.length };
  }, [deliveries]);

  // Filter deliveries
  const filteredDeliveries = useMemo(() => {
    return deliveries.filter((d) => {
      const matchesStatus = statusFilter === "all" || d.status === statusFilter;
      const matchesMethod = methodFilter === "all" || d.deliveryMethod === methodFilter;
      return matchesStatus && matchesMethod;
    });
  }, [deliveries, statusFilter, methodFilter]);

  const handleSearch = (trackingNumber: string) => {
    const found = deliveries.find(
      (d) => d.trackingNumber.toUpperCase() === trackingNumber.toUpperCase()
    );
    if (found) {
      setSearchResult(found);
      setSearchNotFound(false);
    } else {
      setSearchResult(null);
      setSearchNotFound(true);
    }
  };

  const handleManage = (delivery: DeliveryRecord) => {
    setSelectedDelivery(delivery);
    setManagePanelOpen(true);
  };

  const handleUpdateDelivery = (id: string, updates: Partial<DeliveryRecord>) => {
    setDeliveries((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updates } : d))
    );
    toast({
      title: "Delivery Updated",
      description: "The delivery status has been updated successfully.",
    });
  };

  const statCards = [
    {
      title: "Pending",
      value: stats.pending,
      icon: Clock,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
    {
      title: "In Transit",
      value: stats.inTransit,
      icon: Truck,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Delivered",
      value: stats.delivered,
      icon: CheckCircle2,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Priority Queue",
      value: stats.priority,
      icon: Star,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tracking Delivery</h1>
          <p className="text-muted-foreground">
            Track and manage insurance policy deliveries
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <Card key={stat.title} className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  </div>
                  <div className={cn("p-3 rounded-lg", stat.bgColor)}>
                    <stat.icon className={cn("h-6 w-6", stat.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tracking Search */}
        <TrackingSearch onSearch={handleSearch} />

        {/* Search Result */}
        {searchResult && (
          <Card className="bg-card border-border border-accent/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Package className="h-5 w-5 text-accent" />
                Tracking Result: {searchResult.trackingNumber}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <p className="text-sm text-muted-foreground">Policy Number</p>
                  <p className="font-semibold">{searchResult.policyNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Recipient</p>
                  <p className="font-semibold">{searchResult.recipientName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Delivery Method</p>
                  <div className="flex items-center gap-2">
                    {searchResult.deliveryMethod === "courier" ? (
                      <>
                        <Truck className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold capitalize">
                          {searchResult.courierProvider === "poslaju" 
                            ? "Pos Laju" 
                            : searchResult.courierProvider?.toUpperCase()}
                        </span>
                      </>
                    ) : (
                      <>
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">Email PDF</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <DeliveryTimeline
                currentStatus={searchResult.status}
                shippedAt={searchResult.shippedAt}
                inTransitAt={searchResult.inTransitAt}
                deliveredAt={searchResult.deliveredAt}
                courierProvider={searchResult.courierProvider}
              />
            </CardContent>
          </Card>
        )}

        {searchNotFound && (
          <Card className="bg-card border-border border-destructive/50">
            <CardContent className="py-8 text-center">
              <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
              <p className="text-foreground font-medium">Tracking number not found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Please check the tracking number and try again
              </p>
            </CardContent>
          </Card>
        )}

        {/* Delivery Management Tabs */}
        <Tabs defaultValue="all" className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <TabsList className="bg-muted">
              <TabsTrigger value="all">All Deliveries</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>

            <div className="flex gap-2">
              <Select
                value={methodFilter}
                onValueChange={(value) => setMethodFilter(value as typeof methodFilter)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="courier">Courier</SelectItem>
                  <SelectItem value="email">Email PDF</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <TabsContent value="all">
            <DeliveryTable
              deliveries={filteredDeliveries}
              onManage={handleManage}
              showManageButton
            />
          </TabsContent>

          <TabsContent value="pending">
            <DeliveryTable
              deliveries={filteredDeliveries.filter((d) => d.status === "pending")}
              onManage={handleManage}
              showManageButton
            />
          </TabsContent>

          <TabsContent value="active">
            <DeliveryTable
              deliveries={filteredDeliveries.filter(
                (d) => d.status === "shipped" || d.status === "in_transit"
              )}
              onManage={handleManage}
              showManageButton
            />
          </TabsContent>

          <TabsContent value="completed">
            <DeliveryTable
              deliveries={filteredDeliveries.filter((d) => d.status === "delivered")}
              onManage={handleManage}
              showManageButton
            />
          </TabsContent>
        </Tabs>

        {/* Priority Queue Notice */}
        {stats.priority > 0 && (
          <Card className="bg-accent/10 border-accent/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Star className="h-5 w-5 text-accent" />
                <div>
                  <p className="font-medium text-foreground">
                    {stats.priority} priority deliveries pending
                  </p>
                  <p className="text-sm text-muted-foreground">
                    These are paid orders and should be processed first
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Management Panel */}
      <DeliveryManagementPanel
        delivery={selectedDelivery}
        open={managePanelOpen}
        onClose={() => {
          setManagePanelOpen(false);
          setSelectedDelivery(null);
        }}
        onUpdate={handleUpdateDelivery}
      />
    </DashboardLayout>
  );
};

export default TrackingDelivery;
