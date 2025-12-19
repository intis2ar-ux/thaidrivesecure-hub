import { useState } from "react";
import { X, Save, Truck, Mail, Clock, CheckCircle2, Package } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DeliveryRecord, DeliveryStatus, CourierProvider } from "@/types";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface DeliveryManagementPanelProps {
  delivery: DeliveryRecord | null;
  open: boolean;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<DeliveryRecord>) => void;
}

const statusSteps: { status: DeliveryStatus; label: string; icon: React.ElementType }[] = [
  { status: "pending", label: "Pending", icon: Clock },
  { status: "shipped", label: "Shipped", icon: Package },
  { status: "in_transit", label: "In Transit", icon: Truck },
  { status: "delivered", label: "Delivered", icon: CheckCircle2 },
];

export const DeliveryManagementPanel = ({
  delivery,
  open,
  onClose,
  onUpdate,
}: DeliveryManagementPanelProps) => {
  const [status, setStatus] = useState<DeliveryStatus>(delivery?.status || "pending");
  const [courierProvider, setCourierProvider] = useState<CourierProvider | undefined>(
    delivery?.courierProvider
  );
  const [trackingNumber, setTrackingNumber] = useState(delivery?.trackingNumber || "");
  const [notes, setNotes] = useState(delivery?.notes || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!delivery) return null;

  const handleStatusChange = (newStatus: DeliveryStatus) => {
    setStatus(newStatus);
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    
    const updates: Partial<DeliveryRecord> = {
      status,
      courierProvider,
      trackingNumber,
      notes,
      updatedAt: new Date(),
    };

    // Set timestamps based on status
    if (status === "shipped" && !delivery.shippedAt) {
      updates.shippedAt = new Date();
    }
    if (status === "in_transit" && !delivery.inTransitAt) {
      updates.inTransitAt = new Date();
    }
    if (status === "delivered" && !delivery.deliveredAt) {
      updates.deliveredAt = new Date();
    }
    if (delivery.deliveryMethod === "email" && status === "delivered") {
      updates.emailSentAt = new Date();
    }

    onUpdate(delivery.id, updates);
    setIsSubmitting(false);
    onClose();
  };

  const handleMarkEmailSent = () => {
    setStatus("delivered");
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-accent" />
            Manage Delivery
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6">
          {/* Delivery Info */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Policy Number</p>
                <p className="font-semibold text-foreground">{delivery.policyNumber}</p>
              </div>
              <Badge variant="outline" className={cn(
                delivery.isPriority 
                  ? "bg-accent/20 text-accent border-accent/30" 
                  : "bg-muted text-muted-foreground"
              )}>
                {delivery.isPriority ? "Priority" : "Standard"}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Recipient</p>
              <p className="font-medium text-foreground">{delivery.recipientName}</p>
              <p className="text-sm text-muted-foreground">{delivery.recipientEmail}</p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              {delivery.deliveryMethod === "courier" ? (
                <>
                  <Truck className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Courier Delivery</span>
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Email PDF</span>
                </>
              )}
            </div>
          </div>

          <Separator />

          {/* Status Update */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Update Status</Label>
            <div className="grid grid-cols-2 gap-2">
              {statusSteps.map((step) => (
                <Button
                  key={step.status}
                  variant={status === step.status ? "default" : "outline"}
                  className={cn(
                    "justify-start gap-2",
                    status === step.status && "bg-accent text-accent-foreground hover:bg-accent/90"
                  )}
                  onClick={() => handleStatusChange(step.status)}
                >
                  <step.icon className="h-4 w-4" />
                  {step.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Courier Details (only for courier method) */}
          {delivery.deliveryMethod === "courier" && (
            <>
              <Separator />
              <div className="space-y-4">
                <Label className="text-sm font-medium">Courier Details</Label>
                
                <div className="space-y-2">
                  <Label htmlFor="courier" className="text-sm text-muted-foreground">
                    Courier Provider
                  </Label>
                  <Select
                    value={courierProvider}
                    onValueChange={(value) => setCourierProvider(value as CourierProvider)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select courier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="poslaju">Pos Laju</SelectItem>
                      <SelectItem value="dhl">DHL</SelectItem>
                      <SelectItem value="jnt">J&T Express</SelectItem>
                      <SelectItem value="gdex">GDex</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tracking" className="text-sm text-muted-foreground">
                    Tracking Number
                  </Label>
                  <Input
                    id="tracking"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Enter tracking number"
                  />
                </div>
              </div>
            </>
          )}

          {/* Email Delivery Actions */}
          {delivery.deliveryMethod === "email" && (
            <>
              <Separator />
              <div className="space-y-4">
                <Label className="text-sm font-medium">Email Delivery</Label>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={handleMarkEmailSent}
                >
                  <Mail className="h-4 w-4" />
                  Mark PDF as Sent
                </Button>
                {delivery.emailSentAt && (
                  <p className="text-sm text-muted-foreground">
                    Email sent: {format(delivery.emailSentAt, "dd MMM yyyy, HH:mm")}
                  </p>
                )}
              </div>
            </>
          )}

          <Separator />

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">
              Delivery Notes
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this delivery..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button
              className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
              onClick={handleSave}
              disabled={isSubmitting}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
