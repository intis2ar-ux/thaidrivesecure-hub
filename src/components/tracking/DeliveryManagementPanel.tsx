import { useState, useEffect } from "react";
import { Save, Truck, Mail, Send, CheckCircle2, ExternalLink } from "lucide-react";
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

const getCourierTrackingUrl = (provider: string | undefined, trackingNumber: string) => {
  const urls: Record<string, string> = {
    poslaju: `https://www.pos.com.my/track?trackingId=${trackingNumber}`,
    dhl: `https://www.dhl.com/my-en/home/tracking.html?tracking-id=${trackingNumber}`,
    jnt: `https://www.jtexpress.my/track?billcodes=${trackingNumber}`,
    gdex: `https://www.gdexpress.com/mytracking/${trackingNumber}`,
  };
  return provider ? urls[provider] || "#" : "#";
};

export const DeliveryManagementPanel = ({
  delivery,
  open,
  onClose,
  onUpdate,
}: DeliveryManagementPanelProps) => {
  const [status, setStatus] = useState<DeliveryStatus>("pending");
  const [courierProvider, setCourierProvider] = useState<CourierProvider | undefined>(undefined);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset state when delivery changes
  useEffect(() => {
    if (delivery) {
      setStatus(delivery.status);
      setCourierProvider(delivery.courierProvider);
      setTrackingNumber(delivery.trackingNumber);
      setNotes(delivery.notes || "");
    }
  }, [delivery]);

  if (!delivery) return null;

  const handleSave = async () => {
    setIsSubmitting(true);
    
    const updates: Partial<DeliveryRecord> = {
      status,
      courierProvider,
      trackingNumber,
      notes,
      updatedAt: new Date(),
    };

    // For email PDF, set emailSentAt when marked as delivered
    if (delivery.deliveryMethod === "email" && status === "delivered" && !delivery.emailSentAt) {
      updates.emailSentAt = new Date();
      updates.deliveredAt = new Date();
    }

    onUpdate(delivery.id, updates);
    setIsSubmitting(false);
    onClose();
  };

  const handleSendEmail = () => {
    setStatus("delivered");
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2">
            {delivery.deliveryMethod === "courier" ? (
              <Truck className="h-5 w-5 text-accent" />
            ) : (
              <Mail className="h-5 w-5 text-accent" />
            )}
            {delivery.deliveryMethod === "courier" ? "Courier Delivery" : "Email PDF Delivery"}
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
          </div>

          <Separator />

          {/* COURIER METHOD - Just tracking number management */}
          {delivery.deliveryMethod === "courier" && (
            <div className="space-y-4">
              <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
                <p className="text-sm font-medium text-blue-600 mb-2">Courier Tracking</p>
                <p className="text-xs text-muted-foreground">
                  Courier deliveries are tracked externally. Enter the tracking number from the courier provider below.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="courier" className="text-sm font-medium">
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
                <Label htmlFor="tracking" className="text-sm font-medium">
                  Courier Tracking Number
                </Label>
                <Input
                  id="tracking"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking number from courier"
                  className="font-mono"
                />
              </div>

              {courierProvider && trackingNumber && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.open(getCourierTrackingUrl(courierProvider, trackingNumber), "_blank")}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Track on {courierProvider === "poslaju" ? "Pos Laju" : courierProvider.toUpperCase()} Website
                </Button>
              )}
            </div>
          )}

          {/* EMAIL PDF METHOD - Full tracking by staff */}
          {delivery.deliveryMethod === "email" && (
            <div className="space-y-4">
              <Label className="text-sm font-medium">Email Status</Label>
              
              <div className="flex gap-2">
                <Button
                  variant={status === "pending" ? "default" : "outline"}
                  className={cn(
                    "flex-1 justify-center gap-2",
                    status === "pending" && "bg-yellow-500 text-white hover:bg-yellow-600"
                  )}
                  onClick={() => setStatus("pending")}
                >
                  <Send className="h-4 w-4" />
                  Pending
                </Button>
                <Button
                  variant={status === "delivered" ? "default" : "outline"}
                  className={cn(
                    "flex-1 justify-center gap-2",
                    status === "delivered" && "bg-green-500 text-white hover:bg-green-600"
                  )}
                  onClick={handleSendEmail}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Sent
                </Button>
              </div>

              {delivery.emailSentAt && (
                <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/20">
                  <p className="text-sm text-green-600">
                    Email sent on {format(delivery.emailSentAt, "dd MMM yyyy, HH:mm")}
                  </p>
                </div>
              )}

              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">
                  When you mark as "Sent", the system will record the timestamp and the customer will be notified.
                </p>
              </div>
            </div>
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
