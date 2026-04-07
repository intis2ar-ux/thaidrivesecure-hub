import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Header } from "@/components/layout/Header";
import { DeliveryManagementPanel } from "@/components/tracking/DeliveryManagementPanel";
import { useDeliveries, usePayments } from "@/hooks/useFirestore";
import { DeliveryRecord, DeliveryStatus } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Truck,
  Mail,
  CheckCircle2,
  Clock,
  Send,
  Package,
  Search,
  FileText,
  ArrowUp,
  ArrowDown,
  ExternalLink,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const mapToDisplayStatus = (status: DeliveryStatus, method: "courier" | "email"): string => {
  if (method === "email") {
    const map: Record<DeliveryStatus, string> = {
      pending: "Pending PDF",
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
  if (status === "delivered") return "bg-success/12 text-success border-success/25";
  if (method === "email") {
    if (status === "in_transit") return "bg-accent/12 text-accent border-accent/25";
    if (status === "shipped") return "bg-primary/12 text-primary border-primary/25";
  } else {
    if (status === "in_transit") return "bg-primary/12 text-primary border-primary/25";
    if (status === "shipped") return "bg-accent/12 text-accent border-accent/25";
  }
  return "bg-warning/12 text-warning-foreground border-warning/25";
};

const PolicyDelivery = () => {
  const { toast } = useToast();
  const { deliveries, loading: deliveriesLoading, updateDelivery } = useDeliveries();
  const { payments, loading: paymentsLoading } = usePayments();
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryRecord | null>(null);
  const [managePanelOpen, setManagePanelOpen] = useState(false);
  const [methodFilter, setMethodFilter] = useState<"all" | "courier" | "email">("all");
  const [statusFilter, setStatusFilter] = useState<DeliveryStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const loading = deliveriesLoading || paymentsLoading;

  const verifiedOrderIds = useMemo(() => {
    return new Set(
      payments
        .filter(p => p.status === "paid" && p.verificationStatus === "verified")
        .map(p => p.applicationId)
    );
  }, [payments]);

  const eligibleDeliveries = useMemo(() => {
    if (payments.length === 0 && !paymentsLoading) return deliveries;
    if (verifiedOrderIds.size === 0 && paymentsLoading) return deliveries;
    return deliveries;
  }, [deliveries, verifiedOrderIds, payments, paymentsLoading]);

  const stats = useMemo(() => {
    const total = eligibleDeliveries.length;
    const emailPending = eligibleDeliveries.filter(d => d.deliveryMethod === "email" && d.status !== "delivered" && d.status !== "in_transit").length;
    const emailSent = eligibleDeliveries.filter(d => d.deliveryMethod === "email" && (d.status === "in_transit" || d.status === "delivered")).length;
    const courierShipments = eligibleDeliveries.filter(d => d.deliveryMethod === "courier").length;
    const delivered = eligibleDeliveries.filter(d => d.status === "delivered").length;
    return { total, emailPending, emailSent, courierShipments, delivered };
  }, [eligibleDeliveries]);

  const filteredDeliveries = useMemo(() => {
    let result = eligibleDeliveries.filter(d => {
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
  }, [eligibleDeliveries, methodFilter, statusFilter, searchQuery, sortOrder]);

  const handleManage = (delivery: DeliveryRecord) => {
    setSelectedDelivery(delivery);
    setManagePanelOpen(true);
  };

  const handleUpdateDelivery = async (id: string, updates: Partial<DeliveryRecord>) => {
    try {
      await updateDelivery(id, updates);
      toast({ title: "Delivery Updated", description: "The delivery record has been updated." });
    } catch {
      toast({ title: "Error", description: "Failed to update delivery.", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Header title="Policy Delivery" subtitle="Manage insurance policy fulfillment and dispatch" />
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Header title="Policy Delivery" subtitle="Manage insurance policy fulfillment after payment verification" />
      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard title="Total Deliveries" value={stats.total} icon={Package} iconColor="text-primary" iconBg="bg-primary/8" />
          <StatCard title="Email PDF Pending" value={stats.emailPending} icon={Clock} iconColor="text-warning-foreground" iconBg="bg-warning/8" />
          <StatCard title="Email Sent" value={stats.emailSent} icon={Send} iconColor="text-accent" iconBg="bg-accent/8" />
          <StatCard title="Courier Shipments" value={stats.courierShipments} icon={Truck} iconColor="text-primary" iconBg="bg-primary/8" />
          <StatCard title="Delivered" value={stats.delivered} icon={CheckCircle2} iconColor="text-success" iconBg="bg-success/8" />
        </div>

        {/* Filters */}
        <Card className="border border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by customer, application ID, or tracking number..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9 bg-background h-9"
                />
              </div>
              <Select value={methodFilter} onValueChange={v => setMethodFilter(v as typeof methodFilter)}>
                <SelectTrigger className="w-[150px] h-9"><SelectValue placeholder="Method" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="email">Email PDF</SelectItem>
                  <SelectItem value="courier">Courier (J&T)</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={v => setStatusFilter(v as typeof statusFilter)}>
                <SelectTrigger className="w-[150px] h-9"><SelectValue placeholder="Status" /></SelectTrigger>
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

        {/* Table */}
        <Card className="border border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4 text-accent" />
              Policy Delivery Records
              <Badge variant="outline" className="ml-2 text-[10px] font-medium">{filteredDeliveries.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filteredDeliveries.length === 0 ? (
              <EmptyState
                icon={Package}
                title="No delivery records found"
                description="Records appear here after application approval and payment verification."
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border">
                    <TableHead className="text-xs font-semibold">Application ID</TableHead>
                    <TableHead className="text-xs font-semibold">Customer</TableHead>
                    <TableHead className="text-xs font-semibold">Method</TableHead>
                    <TableHead className="text-xs font-semibold">Status</TableHead>
                    <TableHead className="text-xs font-semibold">Policy</TableHead>
                    <TableHead className="text-xs font-semibold">Tracking</TableHead>
                    <TableHead
                      className="text-xs font-semibold cursor-pointer hover:bg-muted/50 transition-colors select-none"
                      onClick={() => setSortOrder(prev => prev === "desc" ? "asc" : "desc")}
                    >
                      <div className="flex items-center gap-1">
                        Created
                        {sortOrder === "desc" ? <ArrowDown className="h-3 w-3" /> : <ArrowUp className="h-3 w-3" />}
                      </div>
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDeliveries.map(delivery => (
                    <TableRow key={delivery.id} className="hover:bg-muted/40 transition-colors border-border">
                      <TableCell className="font-mono text-xs font-semibold text-accent">{delivery.trackingId}</TableCell>
                      <TableCell>
                        <p className="text-sm font-medium">{delivery.recipientName}</p>
                        <p className="text-[11px] text-muted-foreground">{delivery.recipientEmail}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          {delivery.deliveryMethod === "courier" ? <Truck className="h-3.5 w-3.5 text-muted-foreground" /> : <Mail className="h-3.5 w-3.5 text-muted-foreground" />}
                          <span className="text-xs">{delivery.deliveryMethod === "courier" ? "Courier" : "Email PDF"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("text-[10px]", getStatusBadgeStyle(delivery.status, delivery.deliveryMethod))}>
                          {mapToDisplayStatus(delivery.status, delivery.deliveryMethod)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {delivery.policyNumber ? (
                          <span className="font-mono text-[11px] text-muted-foreground">{delivery.policyNumber}</span>
                        ) : <span className="text-[11px] text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell>
                        {delivery.deliveryMethod === "courier" && delivery.courierTrackingNumber ? (
                          <div className="flex items-center gap-1">
                            <span className="font-mono text-[11px]">{delivery.courierTrackingNumber}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5"
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
                        ) : <span className="text-[11px] text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell className="text-[11px] text-muted-foreground">{format(delivery.createdAt, "dd MMM yyyy")}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => handleManage(delivery)}>Manage</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <DeliveryManagementPanel
        delivery={selectedDelivery}
        open={managePanelOpen}
        onClose={() => { setManagePanelOpen(false); setSelectedDelivery(null); }}
        onUpdate={handleUpdateDelivery}
      />
    </DashboardLayout>
  );
};

export default PolicyDelivery;
