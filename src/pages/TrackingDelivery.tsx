import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Header } from "@/components/layout/Header";
import { TrackingSearch } from "@/components/tracking/TrackingSearch";
import { DeliveryTable } from "@/components/tracking/DeliveryTable";
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
  AlertCircle,
  ExternalLink,
  Send
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const getCourierTrackingUrl = (provider: string | undefined, courierTrackingNumber: string) => {
  const urls: Record<string, string> = {
    poslaju: `https://www.pos.com.my/track?trackingId=${courierTrackingNumber}`,
    dhl: `https://www.dhl.com/my-en/home/tracking.html?tracking-id=${courierTrackingNumber}`,
    jnt: `https://www.jtexpress.my/track?billcodes=${courierTrackingNumber}`,
    gdex: `https://www.gdexpress.com/mytracking/${courierTrackingNumber}`,
  };
  return provider ? urls[provider] || "#" : "#";
};

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
    const courierDeliveries = deliveries.filter((d) => d.deliveryMethod === "courier").length;
    const emailPending = deliveries.filter((d) => d.deliveryMethod === "email" && d.status !== "delivered").length;
    const emailSent = deliveries.filter((d) => d.deliveryMethod === "email" && d.status === "delivered").length;
    const priority = deliveries.filter((d) => d.isPriority && d.status !== "delivered").length;
    return { courierDeliveries, emailPending, emailSent, priority, total: deliveries.length };
  }, [deliveries]);

  // Filter deliveries
  const filteredDeliveries = useMemo(() => {
    return deliveries.filter((d) => {
      const matchesStatus = statusFilter === "all" || d.status === statusFilter;
      const matchesMethod = methodFilter === "all" || d.deliveryMethod === methodFilter;
      return matchesStatus && matchesMethod;
    });
  }, [deliveries, statusFilter, methodFilter]);

  const handleSearch = (searchTerm: string) => {
    const found = deliveries.find(
      (d) => d.trackingId.toUpperCase() === searchTerm.toUpperCase()
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
      description: "The delivery record has been updated successfully.",
    });
  };

  const statCards = [
    {
      title: "Courier Deliveries",
      value: stats.courierDeliveries,
      icon: Truck,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Email PDF Pending",
      value: stats.emailPending,
      icon: Send,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
    {
      title: "Email PDF Sent",
      value: stats.emailSent,
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
      <Header title="Tracking Delivery" subtitle="Manage courier tracking numbers and send email PDF deliveries" />
      <div className="p-6 space-y-6">

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
                Search Result: {searchResult.trackingId}
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
                  <p className="text-sm text-muted-foreground">{searchResult.recipientEmail}</p>
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

              {/* Courier - Show tracking link */}
              {searchResult.deliveryMethod === "courier" && (
                <div className="bg-muted/50 rounded-lg p-4 border border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Courier Tracking Number</p>
                      <p className="font-mono text-lg font-semibold">
                        {searchResult.courierTrackingNumber || "Not assigned"}
                      </p>
                    </div>
                    {searchResult.courierTrackingNumber && (
                      <Button
                        variant="outline"
                        onClick={() => window.open(getCourierTrackingUrl(searchResult.courierProvider, searchResult.courierTrackingNumber!), "_blank")}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Track on Courier Site
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Tracking is managed by the courier. Click the button to view delivery status on their website.
                  </p>
                </div>
              )}

              {/* Email PDF - Show status */}
              {searchResult.deliveryMethod === "email" && (
                <div className={cn(
                  "rounded-lg p-4 border",
                  searchResult.status === "delivered" 
                    ? "bg-green-500/10 border-green-500/20" 
                    : "bg-yellow-500/10 border-yellow-500/20"
                )}>
                  <div className="flex items-center gap-3">
                    {searchResult.status === "delivered" ? (
                      <CheckCircle2 className="h-6 w-6 text-green-500" />
                    ) : (
                      <Send className="h-6 w-6 text-yellow-500" />
                    )}
                    <div>
                      <p className="font-medium">
                        {searchResult.status === "delivered" ? "Email PDF Sent" : "Email PDF Pending"}
                      </p>
                      {searchResult.emailSentAt && (
                        <p className="text-sm text-muted-foreground">
                          Sent to {searchResult.recipientEmail}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
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
              <TabsTrigger value="email-pending">Email Pending</TabsTrigger>
              <TabsTrigger value="email-sent">Email Sent</TabsTrigger>
              <TabsTrigger value="courier">Courier</TabsTrigger>
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

          <TabsContent value="email-pending">
            <DeliveryTable
              deliveries={filteredDeliveries.filter((d) => d.deliveryMethod === "email" && d.status !== "delivered")}
              onManage={handleManage}
              showManageButton
            />
          </TabsContent>

          <TabsContent value="email-sent">
            <DeliveryTable
              deliveries={filteredDeliveries.filter((d) => d.deliveryMethod === "email" && d.status === "delivered")}
              onManage={handleManage}
              showManageButton
            />
          </TabsContent>

          <TabsContent value="courier">
            <DeliveryTable
              deliveries={filteredDeliveries.filter((d) => d.deliveryMethod === "courier")}
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
