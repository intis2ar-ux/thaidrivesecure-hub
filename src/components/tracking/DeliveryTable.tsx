import { useState } from "react";
import { ChevronDown, ChevronUp, Mail, Truck, Clock, Star } from "lucide-react";
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
import { DeliveryTimeline } from "./DeliveryTimeline";

interface DeliveryTableProps {
  deliveries: DeliveryRecord[];
  onManage?: (delivery: DeliveryRecord) => void;
  showManageButton?: boolean;
}

const getStatusBadge = (status: DeliveryStatus) => {
  const config = {
    pending: { label: "Pending", className: "bg-yellow-500/20 text-yellow-600 border-yellow-500/30" },
    shipped: { label: "Shipped", className: "bg-blue-500/20 text-blue-600 border-blue-500/30" },
    in_transit: { label: "In Transit", className: "bg-blue-500/20 text-blue-600 border-blue-500/30" },
    delivered: { label: "Delivered", className: "bg-green-500/20 text-green-600 border-green-500/30" },
  };

  const { label, className } = config[status];
  return <Badge variant="outline" className={className}>{label}</Badge>;
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
              <TableHead>Policy Number</TableHead>
              <TableHead>Recipient</TableHead>
              <TableHead>Tracking No.</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
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
                  <TableCell className="font-medium text-foreground">
                    {delivery.policyNumber}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-foreground">{delivery.recipientName}</p>
                      <p className="text-xs text-muted-foreground">{delivery.recipientEmail}</p>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{delivery.trackingNumber}</TableCell>
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
                  <TableCell>{getStatusBadge(delivery.status)}</TableCell>
                  <TableCell>
                    {delivery.isPriority && (
                      <Badge variant="outline" className="bg-accent/20 text-accent border-accent/30">
                        <Star className="h-3 w-3 mr-1" />
                        Priority
                      </Badge>
                    )}
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
                    <TableCell colSpan={showManageButton ? 8 : 7} className="p-6">
                      <div className="space-y-4">
                        <DeliveryTimeline
                          currentStatus={delivery.status}
                          shippedAt={delivery.shippedAt}
                          inTransitAt={delivery.inTransitAt}
                          deliveredAt={delivery.deliveredAt}
                          courierProvider={delivery.courierProvider}
                        />
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-border">
                          <div>
                            <p className="text-xs text-muted-foreground">Application ID</p>
                            <p className="text-sm font-medium">{delivery.applicationId}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Created</p>
                            <p className="text-sm font-medium">
                              {format(delivery.createdAt, "dd MMM yyyy, HH:mm")}
                            </p>
                          </div>
                          {delivery.deliveryMethod === "email" && delivery.emailSentAt && (
                            <div>
                              <p className="text-xs text-muted-foreground">Email Sent</p>
                              <p className="text-sm font-medium">
                                {format(delivery.emailSentAt, "dd MMM yyyy, HH:mm")}
                              </p>
                            </div>
                          )}
                          {delivery.notes && (
                            <div className="col-span-2">
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
