import { useState } from "react";
import { ChevronDown, ChevronUp, Mail, Truck, Clock, Star, ExternalLink, CheckCircle2, Send } from "lucide-react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeliveryRecord, DeliveryStatus } from "@/types";
import { cn } from "@/lib/utils";

interface DeliveryTableProps {
  deliveries: DeliveryRecord[];
  onManage?: (delivery: DeliveryRecord) => void;
  showManageButton?: boolean;
}

const getStatusBadge = (status: DeliveryStatus, method: "courier" | "email") => {
  if (method === "courier") {
    // Courier - simplified status (just show if tracking number assigned)
    return <Badge variant="outline" className="bg-muted text-muted-foreground border-border">External Tracking</Badge>;
  }
  
  // Email PDF - full status tracking
  const config = {
    pending: { label: "Pending", className: "bg-yellow-500/20 text-yellow-600 border-yellow-500/30" },
    shipped: { label: "Ready to Send", className: "bg-blue-500/20 text-blue-600 border-blue-500/30" },
    in_transit: { label: "Sending", className: "bg-blue-500/20 text-blue-600 border-blue-500/30" },
    delivered: { label: "Sent", className: "bg-green-500/20 text-green-600 border-green-500/30" },
  };

  const { label, className } = config[status];
  return <Badge variant="outline" className={className}>{label}</Badge>;
};

const getCourierTrackingUrl = (provider: string | undefined, courierTrackingNumber: string) => {
  const urls: Record<string, string> = {
    poslaju: `https://www.pos.com.my/track?trackingId=${courierTrackingNumber}`,
    dhl: `https://www.dhl.com/my-en/home/tracking.html?tracking-id=${courierTrackingNumber}`,
    jnt: `https://www.jtexpress.my/track?billcodes=${courierTrackingNumber}`,
    gdex: `https://www.gdexpress.com/mytracking/${courierTrackingNumber}`,
  };
  return provider ? urls[provider] || "#" : "#";
};

export const DeliveryTable = ({ deliveries, onManage, showManageButton }: DeliveryTableProps) => {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const toggleRow = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  if (deliveries.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="py-12 text-center">
          <Truck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No delivery records found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Truck className="h-5 w-5 text-accent" />
          Delivery Records
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border">
              <TableHead className="w-10"></TableHead>
              <TableHead>Tracking ID</TableHead>
              <TableHead>Policy Number</TableHead>
              <TableHead>Recipient</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Created At</TableHead>
              {showManageButton && <TableHead className="text-right">Action</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {deliveries.map((delivery) => (
              <>
                <TableRow
                  key={delivery.id}
                  className="cursor-pointer hover:bg-muted/50 border-border"
                  onClick={() => toggleRow(delivery.id)}
                >
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      {expandedRow === delivery.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
                  <TableCell className="font-mono text-sm font-semibold text-accent">
                    {delivery.trackingId}
                  </TableCell>
                  <TableCell className="font-medium text-foreground">
                    {delivery.policyNumber}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-foreground">{delivery.recipientName}</p>
                      <p className="text-xs text-muted-foreground">{delivery.recipientEmail}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {delivery.deliveryMethod === "courier" ? (
                        <>
                          <Truck className="h-4 w-4 text-muted-foreground" />
                          <span className="capitalize">
                            {delivery.courierProvider === "poslaju" ? "Pos Laju" : delivery.courierProvider?.toUpperCase()}
                          </span>
                        </>
                      ) : (
                        <>
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>Email PDF</span>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(delivery.status, delivery.deliveryMethod)}</TableCell>
                  <TableCell>
                    {delivery.isPriority && (
                      <Badge variant="outline" className="bg-accent/20 text-accent border-accent/30">
                        <Star className="h-3 w-3 mr-1" />
                        Priority
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(delivery.createdAt, "dd MMM yyyy, HH:mm")}
                  </TableCell>
                  {showManageButton && (
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onManage?.(delivery);
                        }}
                      >
                        Manage
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
                {expandedRow === delivery.id && (
                  <TableRow className="hover:bg-transparent bg-muted/30">
                    <TableCell colSpan={showManageButton ? 9 : 8} className="p-6">
                      <div className="space-y-4">
                        {/* Courier: Show external tracking link */}
                        {delivery.deliveryMethod === "courier" && (
                          <div className="bg-background rounded-lg p-4 border border-border">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-muted-foreground">Courier Tracking Number</p>
                                <p className="font-mono text-lg font-semibold">
                                  {delivery.courierTrackingNumber || "Not assigned"}
                                </p>
                                <p className="text-sm text-muted-foreground mt-1">
                                  Provider: {delivery.courierProvider === "poslaju" ? "Pos Laju" : delivery.courierProvider?.toUpperCase()}
                                </p>
                              </div>
                              {delivery.courierTrackingNumber && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(getCourierTrackingUrl(delivery.courierProvider, delivery.courierTrackingNumber!), "_blank");
                                  }}
                                >
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  Track on Courier Site
                                </Button>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-3">
                              Tracking is managed by the courier provider. Click the button to track on their website.
                            </p>
                          </div>
                        )}

                        {/* Email PDF: Show email sending status */}
                        {delivery.deliveryMethod === "email" && (
                          <div className="bg-background rounded-lg p-4 border border-border">
                            <div className="flex items-center gap-6">
                              <div className={cn(
                                "flex items-center gap-2 p-3 rounded-lg",
                                delivery.status === "pending" ? "bg-yellow-500/10" : "bg-green-500/10"
                              )}>
                                {delivery.status === "delivered" ? (
                                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                                ) : (
                                  <Send className="h-6 w-6 text-yellow-500" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium">
                                  {delivery.status === "delivered" ? "Email Sent Successfully" : "Pending Email Delivery"}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Recipient: {delivery.recipientEmail}
                                </p>
                                {delivery.emailSentAt && (
                                  <p className="text-sm text-muted-foreground">
                                    Sent: {format(delivery.emailSentAt, "dd MMM yyyy, HH:mm")}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-border">
                          <div>
                            <p className="text-xs text-muted-foreground">Tracking ID</p>
                            <p className="text-sm font-medium font-mono">{delivery.trackingId}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Created</p>
                            <p className="text-sm font-medium">
                              {format(delivery.createdAt, "dd MMM yyyy, HH:mm")}
                            </p>
                          </div>
                          {delivery.notes && (
                            <div className="col-span-2 md:col-span-1">
                              <p className="text-xs text-muted-foreground">Notes</p>
                              <p className="text-sm">{delivery.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
