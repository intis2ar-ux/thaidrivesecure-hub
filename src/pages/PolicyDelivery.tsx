import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Header } from "@/components/layout/Header";
import { DeliveryManagementPanel } from "@/components/tracking/DeliveryManagementPanel";
import { useDeliveries } from "@/hooks/useFirestore";
import { DeliveryRecord, DeliveryStatus } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Truck,
  Mail,
  CheckCircle2,
  Clock,
  Send,
  Package,
  Search,
  FileText,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ExternalLink,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

type EmailDeliveryStatus = "pending_pdf" | "ready_to_send" | "email_sent" | "delivered";
type CourierDeliveryStatus = "pending_shipment" | "packed" | "shipped" | "in_transit" | "delivered";

const mapToDisplayStatus = (status: DeliveryStatus, method: "courier" | "email"): string => {
  if (method === "email") {
    const map: Record<DeliveryStatus, string> = {
      pending: "Pending PDF Preparation",
      shipped: "Ready to Send",
      in_transit: "Email Sent",
      delivered: "Delivered",
    };
    return map[status] || status;
  }
  const map: Record<DeliveryStatus, string> = {
    pending: "Pending Shipment",
    shipped: "Shipped",
    in_transit: "In Transit",
    delivered: "Delivered",
  };
  return map[status] || status;
};

const getStatusBadgeStyle = (status: DeliveryStatus, method: "courier" | "email") => {
  if (status === "delivered") return "bg-success/15 text-success border-success/30";
  if (method === "email") {
    if (status === "in_transit") return "bg-accent/15 text-accent border-accent/30";
    if (status === "shipped") return "bg-primary/15 text-primary border-primary/30";
  } else {
    if (status === "in_transit") return "bg-primary/15 text-primary border-primary/30";
    if (status === "shipped") return "bg-accent/15 text-accent border-accent/30";
  }
  return "bg-warning/15 text-warning-foreground border-warning/30";
};

const PolicyDelivery = () => {
  const { toast } = useToast();
  const { deliveries, loading, updateDelivery } = useDeliveries();
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryRecord | null>(null);
  const [managePanelOpen, setManagePanelOpen] = useState(false);
  const [methodFilter, setMethodFilter] = useState<"all" | "courier" | "email">("all");
  const [statusFilter, setStatusFilter] = useState<DeliveryStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const stats = useMemo(() => {
    const total = deliveries.length;
    const emailPending = deliveries.filter(d => d.deliveryMethod === "email" && d.status !== "delivered" && d.status !== "in_transit").length;
    const emailSent = deliveries.filter(d => d.deliveryMethod === "email" && (d.status === "in_transit" || d.status === "delivered")).length;
    const courierShipments = deliveries.filter(d => d.deliveryMethod === "courier").length;
    const delivered = deliveries.filter(d => d.status === "delivered").length;
    return { total, emailPending, emailSent, courierShipments, delivered };
  }, [deliveries]);

  const filteredDeliveries = useMemo(() => {
    let result = deliveries.filter(d => {
      const matchesMethod = methodFilter === "all" || d.deliveryMethod === methodFilter;
      const matchesStatus = statusFilter === "all" || d.status === statusFilter;
      return matchesMethod && matchesStatus;
    });

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(d =>
        d.recipientName.toLowerCase().includes(q) ||
        d.trackingId.toLowerCase().includes(q) ||
        (d.courierTrackingNumber && d.courierTrackingNumber.toLowerCase().includes(q)) ||
        d.policyNumber.toLowerCase().includes(q)
      );
    }

    return [...result].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });
  }, [deliveries, methodFilter, statusFilter, searchQuery, sortOrder]);

  const handleManage = (delivery: DeliveryRecord) => {
    setSelectedDelivery(delivery);
    setManagePanelOpen(true);
  };

  const handleUpdateDelivery = async (id: string, updates: Partial<DeliveryRecord>) => {
    try {
      await updateDelivery(id, updates);
      toast({ title: "Delivery Updated", description: "The delivery record has been updated successfully." });
    } catch {
      toast({ title: "Error", description: "Failed to update delivery.", variant: "destructive" });
    }
  };

  const statCards = [
    { title: "Total Deliveries", value: stats.total, icon: Package, style: "text-primary bg-primary/10" },
    { title: "Email PDF Pending", value: stats.emailPending, icon: Clock, style: "text-warning-foreground bg-warning/10" },
    { title: "Email Sent", value: stats.emailSent, icon: Send, style: "text-accent bg-accent/10" },
    { title: "Courier Shipments", value: stats.courierShipments, icon: Truck, style: "text-primary bg-primary/10" },
    { title: "Delivered", value: stats.delivered, icon: CheckCircle2, style: "text-success bg-success/10" },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <Header title="Policy Delivery" subtitle="Manage insurance policy fulfillment and dispatch" />
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map(i => (
              <Card key={i} className="bg-card border-border">
                <CardContent className="p-4"><div className="h-16 animate-pulse bg-muted rounded" /></CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Header title="Policy Delivery" subtitle="Manage insurance policy fulfillment and dispatch after payment verification" />
      <div className="p-6 space-y-6">

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {statCards.map(stat => (
            <Card key={stat.title} className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                  </div>
                  <div className={cn("p-2.5 rounded-lg", stat.style.split(" ").slice(1).join(" "))}>
                    <stat.icon className={cn("h-5 w-5", stat.style.split(" ")[0])} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters Bar */}
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by customer name, application ID, or tracking number..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9 bg-background"
                />
              </div>
              <Select value={methodFilter} onValueChange={v => setMethodFilter(v as typeof methodFilter)}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Delivery Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="email">Email PDF</SelectItem>
                  <SelectItem value="courier">Courier (J&T)</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={v => setStatusFilter(v as typeof statusFilter)}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="shipped">Shipped / Ready</SelectItem>
                  <SelectItem value="in_transit">In Transit / Sent</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Table */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <FileText className="h-5 w-5 text-accent" />
              Policy Delivery Records
              <Badge variant="outline" className="ml-2 text-xs">
                {filteredDeliveries.length} records
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filteredDeliveries.length === 0 ? (
              <div className="py-12 text-center">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No delivery records found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Records appear here after application approval and payment verification
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border">
                    <TableHead>Application ID</TableHead>
                    <TableHead>Customer Name</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Delivery Status</TableHead>
                    <TableHead>Policy PDF</TableHead>
                    <TableHead>Tracking Number</TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50 transition-colors select-none"
                      onClick={() => setSortOrder(prev => prev === "desc" ? "asc" : "desc")}
                    >
                      <div className="flex items-center gap-1">
                        Created At
                        {sortOrder === "desc" ? <ArrowDown className="h-4 w-4" /> : <ArrowUp className="h-4 w-4" />}
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDeliveries.map(delivery => (
                    <TableRow key={delivery.id} className="hover:bg-muted/50 border-border">
                      <TableCell className="font-mono text-sm font-semibold text-accent">
                        {delivery.trackingId}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{delivery.recipientName}</p>
                          <p className="text-xs text-muted-foreground">{delivery.recipientEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {delivery.deliveryMethod === "courier" ? (
                            <>
                              <Truck className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">Courier</span>
                            </>
                          ) : (
                            <>
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">Email PDF</span>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn("text-xs", getStatusBadgeStyle(delivery.status, delivery.deliveryMethod))}
                        >
                          {mapToDisplayStatus(delivery.status, delivery.deliveryMethod)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {delivery.policyNumber ? (
                          <span className="font-mono text-xs text-muted-foreground">{delivery.policyNumber}</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {delivery.deliveryMethod === "courier" && delivery.courierTrackingNumber ? (
                          <div className="flex items-center gap-1">
                            <span className="font-mono text-xs">{delivery.courierTrackingNumber}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => {
                                const urls: Record<string, string> = {
                                  jnt: `https://www.jtexpress.my/track?billcodes=${delivery.courierTrackingNumber}`,
                                  poslaju: `https://www.pos.com.my/track?trackingId=${delivery.courierTrackingNumber}`,
                                  dhl: `https://www.dhl.com/my-en/home/tracking.html?tracking-id=${delivery.courierTrackingNumber}`,
                                  gdex: `https://www.gdexpress.com/mytracking/${delivery.courierTrackingNumber}`,
                                };
                                const url = delivery.courierProvider ? urls[delivery.courierProvider] : "#";
                                if (url !== "#") window.open(url, "_blank");
                              }}
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(delivery.createdAt, "dd MMM yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleManage(delivery)}
                        >
                          Manage
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
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

export default PolicyDelivery;
