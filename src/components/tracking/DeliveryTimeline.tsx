import { Package, Truck, MapPin, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { DeliveryStatus } from "@/types";
import { format } from "date-fns";

interface TimelineStep {
  status: DeliveryStatus;
  label: string;
  icon: React.ElementType;
  timestamp?: Date;
}

interface DeliveryTimelineProps {
  currentStatus: DeliveryStatus;
  shippedAt?: Date;
  inTransitAt?: Date;
  deliveredAt?: Date;
  courierProvider?: string;
}

const statusOrder: DeliveryStatus[] = ["pending", "shipped", "in_transit", "delivered"];

export const DeliveryTimeline = ({
  currentStatus,
  shippedAt,
  inTransitAt,
  deliveredAt,
  courierProvider,
}: DeliveryTimelineProps) => {
  const getStatusIndex = (status: DeliveryStatus) => statusOrder.indexOf(status);
  const currentIndex = getStatusIndex(currentStatus);

  const steps: TimelineStep[] = [
    { status: "pending", label: "Order Received", icon: Package },
    { status: "shipped", label: "Shipped", icon: Package, timestamp: shippedAt },
    { status: "in_transit", label: "In Transit", icon: Truck, timestamp: inTransitAt },
    { status: "delivered", label: "Delivered", icon: CheckCircle2, timestamp: deliveredAt },
  ];

  return (
    <div className="w-full py-6">
      {courierProvider && (
        <div className="text-center mb-6">
          <span className="text-sm text-muted-foreground">Delivery Provider: </span>
          <span className="text-sm font-semibold text-foreground uppercase">
            {courierProvider === "poslaju" ? "Pos Laju" : courierProvider.toUpperCase()}
          </span>
        </div>
      )}
      
      <div className="relative flex justify-between">
        {/* Progress Line */}
        <div className="absolute top-6 left-0 right-0 h-1 bg-muted mx-12">
          <div
            className="h-full bg-accent transition-all duration-500"
            style={{
              width: `${currentIndex === 0 ? 0 : (currentIndex / (steps.length - 1)) * 100}%`,
            }}
          />
        </div>

        {steps.map((step, index) => {
          const stepIndex = getStatusIndex(step.status);
          const isCompleted = stepIndex < currentIndex;
          const isCurrent = stepIndex === currentIndex;
          const isPending = stepIndex > currentIndex;

          return (
            <div
              key={step.status}
              className="relative flex flex-col items-center z-10 flex-1"
            >
              <div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300",
                  isCompleted && "bg-accent text-accent-foreground",
                  isCurrent && "bg-accent text-accent-foreground ring-4 ring-accent/30",
                  isPending && "bg-muted text-muted-foreground"
                )}
              >
                <step.icon className="h-5 w-5" />
              </div>
              <span
                className={cn(
                  "mt-3 text-sm font-medium text-center",
                  (isCompleted || isCurrent) ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
              {step.timestamp && (
                <span className="text-xs text-muted-foreground mt-1">
                  {format(step.timestamp, "dd MMM, HH:mm")}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
