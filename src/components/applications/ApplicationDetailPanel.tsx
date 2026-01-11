import { Application } from "@/types";
import { format, differenceInDays } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  Car, 
  Bike,
  Shield,
  Package,
  Truck,
  CreditCard,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  calculatePricingBreakdown, 
  formatPrice,
  vehicleTypeLabels as pricingVehicleLabels,
  packageTypeLabels as pricingPackageLabels
} from "@/lib/pricing";

interface ApplicationDetailPanelProps {
  application: Application;
  onClose: () => void;
}

const vehicleTypeLabels: Record<string, string> = {
  sedan: "Sedan",
  mpv: "MPV",
  pickup_suv: "Pickup/SUV",
  motorcycle: "Motorcycle",
};

const packageTypeLabels: Record<string, string> = {
  compulsory: "Compulsory Insurance",
  compulsory_voluntary: "Compulsory & Voluntary Insurance",
};

const packageDescriptions: Record<string, string> = {
  compulsory: "Basic third-party liability coverage required for cross-border travel to Thailand.",
  compulsory_voluntary: "Enhanced coverage including both mandatory third-party liability and additional voluntary protection for comprehensive peace of mind.",
};

const deliveryLabels: Record<string, string> = {
  takeaway: "Self Collect",
  email_pdf: "Via PDF (Email)",
  shipping: "Courier Delivery",
};

const addonLabels: Record<string, { name: string; description: string }> = {
  "TM2/3": { 
    name: "TM2/3 Form", 
    description: "Temporary Motor Vehicle Import Permit for Thailand" 
  },
  "TDAC": { 
    name: "TDAC", 
    description: "Thailand Driving Assistance Card" 
  },
};

// Calculate number of days between dates
const calculateDays = (startDate?: Date, endDate?: Date): number => {
  if (!startDate) return 1;
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000);
  const days = differenceInDays(end, start) + 1;
  return days > 0 ? days : 1;
};

// Get end date (actual or calculated)
const getEndDate = (startDate?: Date, endDate?: Date): Date | null => {
  if (!startDate) return null;
  if (endDate) return new Date(endDate);
  return new Date(new Date(startDate).getTime() + 6 * 24 * 60 * 60 * 1000);
};

export const ApplicationDetailPanel = ({ application, onClose }: ApplicationDetailPanelProps) => {
  const VehicleIcon = application.vehicleType === "motorcycle" ? Bike : Car;
  
  // Calculate number of days from travel dates
  const numberOfDays = calculateDays(application.travelDate, application.travelEndDate);
  const calculatedEndDate = getEndDate(application.travelDate, application.travelEndDate);
  
  // Calculate pricing breakdown using centralized pricing logic
  const pricingBreakdown = calculatePricingBreakdown(
    application.packageType,
    application.vehicleType,
    application.passengerCount || 1,
    application.addons || [],
    numberOfDays
  );

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
                <p className="font-medium text-foreground">{application.customerName}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Phone Number</p>
                <p className="font-medium text-foreground">{application.customerPhone || "-"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="font-medium text-foreground">{application.customerEmail || "-"}</p>
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
                <p className="font-medium text-foreground">
                  Bukit Kayu Hitam → {application.destination || "Thailand"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Travel Dates</p>
                <p className="font-medium text-foreground">
                  {application.travelDate ? format(application.travelDate, "dd MMMM yyyy") : "-"}
                  {calculatedEndDate && (
                    <span> – {format(calculatedEndDate, "dd MMMM yyyy")}</span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Number of Days</p>
                <p className="font-medium text-foreground">{numberOfDays} days</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Passenger Count</p>
                <p className="font-medium text-foreground">{application.passengerCount || 1} passengers</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <VehicleIcon className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Vehicle Type</p>
                <p className="font-medium text-foreground">{vehicleTypeLabels[application.vehicleType] || "-"}</p>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Insurance & Add-ons Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wide flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Insurance & Add-ons
          </h3>
          <div className="bg-muted/30 rounded-lg p-4 space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Shield className="h-4 w-4 text-accent" />
                <p className="font-medium text-foreground">{packageTypeLabels[application.packageType] || "-"}</p>
              </div>
              <p className="text-xs text-muted-foreground pl-6">
                {packageDescriptions[application.packageType] || ""}
              </p>
            </div>
            
            {application.addons && application.addons.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-border/50">
                <p className="text-xs text-muted-foreground font-medium">Selected Add-ons:</p>
                {application.addons.map((addon) => (
                  <div key={addon} className="flex items-start gap-2 pl-2">
                    <Package className="h-3.5 w-3.5 text-accent mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {addonLabels[addon]?.name || addon}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {addonLabels[addon]?.description || ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Pricing Breakdown Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wide flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Pricing Breakdown
          </h3>
          <div className="bg-muted/30 rounded-lg p-4 space-y-2">
            {!pricingBreakdown.isValid && pricingBreakdown.validationError && (
              <div className="text-sm text-destructive mb-2">
                ⚠️ {pricingBreakdown.validationError}
              </div>
            )}
            {pricingBreakdown.items.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {item.label}
                  {item.description && (
                    <span className="text-xs ml-1">({item.description})</span>
                  )}
                </span>
                <span className="text-foreground">{formatPrice(item.amount)}</span>
              </div>
            ))}
            <Separator className="my-2" />
            <div className="flex justify-between font-semibold">
              <span className="text-foreground">Total Price</span>
              <span className="text-lg text-primary">{formatPrice(pricingBreakdown.totalPrice)}</span>
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
                {deliveryLabels[application.deliveryOption] || "-"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Application Status</span>
              <StatusBadge variant={application.status}>{application.status}</StatusBadge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Submitted</span>
              <span className="text-sm text-foreground">
                {application.submissionDate ? format(application.submissionDate, "dd MMM yyyy, HH:mm") : "-"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
