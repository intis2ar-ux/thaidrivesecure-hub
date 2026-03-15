import { useState } from "react";
import { Application } from "@/types";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { 
  User, 
  Phone, 
  MapPin, 
  Calendar, 
  Users, 
  Car,
  Shield,
  Package,
  Truck,
  CreditCard,
  FileText,
  Eye,
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/pricing";

interface ApplicationDetailPanelProps {
  application: Application;
  onClose: () => void;
}

const deliveryLabels: Record<string, string> = {
  takeaway: "Self Collect",
  email_pdf: "Via PDF (Email)",
  shipping: "Courier Delivery",
  "Via PDF": "Via PDF (Email)",
};

// Document preview modal component
const DocumentPreviewModal = ({
  isOpen,
  onClose,
  imageUrl,
  title,
}: {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title: string;
}) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 3));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.5));
  const handleRotate = () => setRotation((r) => (r + 90) % 360);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setZoom(1);
      setRotation(0);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl w-[90vw] max-h-[90vh] p-0 overflow-hidden">
        <div className="flex items-center justify-between p-3 border-b border-border bg-muted/30">
          <h3 className="text-sm font-semibold text-foreground truncate">{title}</h3>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleZoomOut} disabled={zoom <= 0.5}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-xs text-muted-foreground w-12 text-center">{Math.round(zoom * 100)}%</span>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleZoomIn} disabled={zoom >= 3}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleRotate}>
              <RotateCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="overflow-auto flex items-center justify-center bg-black/5 min-h-[400px] max-h-[calc(90vh-60px)]">
          <img
            src={imageUrl}
            alt={title}
            className="transition-transform duration-200"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
              maxWidth: zoom <= 1 ? "100%" : "none",
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
              (e.target as HTMLImageElement).parentElement!.innerHTML =
                '<p class="text-sm text-muted-foreground p-8">Unable to load image. The file may not be accessible.</p>';
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const ApplicationDetailPanel = ({ application, onClose }: ApplicationDetailPanelProps) => {
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);
  return (
    <div className="bg-card border-l border-border h-full overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between z-10">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Application Details</h2>
          <p className="text-sm text-muted-foreground">#{application.id}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-4 space-y-6">
        {/* Customer Details Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wide flex items-center gap-2">
            <User className="h-4 w-4" />
            Customer Details
          </h3>
          <div className="bg-muted/30 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <User className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Full Name</p>
                <p className="font-medium text-foreground">{application.name}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Phone Number</p>
                <p className="font-medium text-foreground">{application.phone || "-"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Car className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Vehicle Type</p>
                <p className="font-medium text-foreground">{application.vehicleType || "-"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Passengers</p>
                <p className="font-medium text-foreground">{application.passengers}</p>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Trip Details Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wide flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Trip Details
          </h3>
          <div className="bg-muted/30 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Border Route</p>
                <p className="font-medium text-foreground">{application.where || "-"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Travel Day</p>
                <p className="font-medium text-foreground">{application.when || "-"}</p>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Insurance & Add-ons Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wide flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Packages
          </h3>
          <div className="bg-muted/30 rounded-lg p-4 space-y-2">
            {application.packages && application.packages.length > 0 ? (
              application.packages.map((pkg) => (
                <div key={pkg} className="flex items-center gap-2">
                  <Package className="h-3.5 w-3.5 text-accent" />
                  <Badge variant="outline" className="border-accent text-accent bg-accent/5">
                    {pkg}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No packages</p>
            )}
          </div>
        </div>

        <Separator />

        {/* Documents Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wide flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documents
          </h3>
          <div className="bg-muted/30 rounded-lg p-4 space-y-3">
            {application.documents?.passportUrls && application.documents.passportUrls.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-medium">Passport Documents</p>
                {application.documents.passportUrls.map((url, index) => (
                  <button
                    key={index}
                    onClick={() => setPreviewImage({ url, title: `Passport ${index + 1}` })}
                    className="flex items-center gap-2 text-sm text-primary hover:underline cursor-pointer"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Passport {index + 1}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No passport documents</p>
            )}
            
            {application.documents?.vehicleGrantUrl ? (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-medium">Vehicle Grant</p>
                <button
                  onClick={() => setPreviewImage({ url: application.documents!.vehicleGrantUrl!, title: "Vehicle Grant" })}
                  className="flex items-center gap-2 text-sm text-primary hover:underline cursor-pointer"
                >
                  <Eye className="h-3.5 w-3.5" />
                  View Vehicle Grant
                </button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No vehicle grant document</p>
            )}
          </div>
        </div>

        <Separator />

        {/* Pricing Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wide flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Pricing
          </h3>
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex justify-between font-semibold">
              <span className="text-foreground">Total Price</span>
              <span className="text-lg text-primary">{formatPrice(application.totalPrice)}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Delivery & Status Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wide flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Delivery & Status
          </h3>
          <div className="bg-muted/30 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Delivery Method</span>
              </div>
              <Badge variant="outline" className="bg-background">
                {deliveryLabels[application.deliveryMethod] || application.deliveryMethod || "-"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Application Status</span>
              <StatusBadge variant={application.status}>{application.status}</StatusBadge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Created At</span>
              <span className="text-sm text-foreground">
                {application.createdAt ? format(application.createdAt, "dd MMM yyyy, HH:mm") : "-"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Document Preview Modal */}
      {previewImage && (
        <DocumentPreviewModal
          isOpen={!!previewImage}
          onClose={() => setPreviewImage(null)}
          imageUrl={previewImage.url}
          title={previewImage.title}
        />
      )}
    </div>
  );
};
