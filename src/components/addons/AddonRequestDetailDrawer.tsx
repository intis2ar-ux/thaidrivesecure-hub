import { format } from "date-fns";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Plug, ScrollText, Shield, FileCheck, FileText, Truck, Smartphone,
  User, Phone, MapPin, Calendar, CarFront, ExternalLink,
} from "lucide-react";
import type { AddonRequest, AddonServiceType } from "@/types/addon-forms";

const iconMap: Record<string, React.ElementType> = {
  Plug, ScrollText, Shield, FileCheck, FileText, Truck, Smartphone,
};

const typeIconMap: Record<AddonServiceType, string> = {
  adapter: "Plug",
  authorization_letter: "ScrollText",
  personal_insurance: "Shield",
  tm2_tm3: "FileCheck",
  tdac: "FileText",
  towing: "Truck",
  sim_card: "Smartphone",
};

const typeLabelMap: Record<AddonServiceType, string> = {
  adapter: "Adapter",
  authorization_letter: "Authorization Letter",
  personal_insurance: "Personal Insurance",
  tm2_tm3: "TM2 / TM3",
  tdac: "TDAC",
  towing: "Towing",
  sim_card: "SIM Card",
};

interface Props {
  request: AddonRequest | null;
  open: boolean;
  onClose: () => void;
}

export const AddonRequestDetailDrawer = ({ request, open, onClose }: Props) => {
  if (!request) return null;

  const Icon = iconMap[typeIconMap[request.addonType]] || FileText;

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary text-primary-foreground">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <SheetTitle className="text-base">
                {typeLabelMap[request.addonType]}
              </SheetTitle>
              <p className="text-xs text-muted-foreground">
                Submitted {format(request.createdAt, "dd MMM yyyy, HH:mm")}
              </p>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-5">
          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</span>
            <StatusBadge variant={request.status}>{request.status}</StatusBadge>
          </div>

          <Separator />

          {/* Customer Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Customer Information</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2.5 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{request.fullName}</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{request.phone}</span>
              </div>
            </div>
          </div>

          {/* Additional Details */}
          {Object.keys(request.additionalDetails).length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Additional Details</h4>
                <div className="space-y-2">
                  {Object.entries(request.additionalDetails).map(([key, value]) => {
                    const icon = key === "destination" ? MapPin
                      : key === "travelDate" ? Calendar
                      : key === "driverName" ? CarFront
                      : User;
                    const label = key === "destination" ? "Destination"
                      : key === "travelDate" ? "Travel Date"
                      : key === "driverName" ? "Driver Name"
                      : key;

                    return (
                      <div key={key} className="flex items-center gap-2.5 text-sm">
                        {(() => { const I = icon; return <I className="h-4 w-4 text-muted-foreground" />; })()}
                        <div>
                          <span className="text-muted-foreground text-xs">{label}: </span>
                          <span className="text-foreground">{value}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* Documents */}
          {Object.keys(request.documentUrls).length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Uploaded Documents</h4>
                <div className="space-y-2">
                  {Object.entries(request.documentUrls).map(([key, url]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between p-2.5 bg-muted/30 rounded-lg border"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <span className="text-sm capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => window.open(url, "_blank")}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
