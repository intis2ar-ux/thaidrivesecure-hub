import { cn } from "@/lib/utils";

type StatusVariant = "pending" | "verified" | "approved" | "rejected" | "completed" | "paid" | "failed" | "confirmed" | "cancelled" | "info" | "warning" | "error";

interface StatusBadgeProps {
  variant: StatusVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<StatusVariant, string> = {
  pending: "bg-warning/15 text-warning-foreground border-warning/30",
  verified: "bg-accent/15 text-accent border-accent/30",
  approved: "bg-success/15 text-success border-success/30",
  rejected: "bg-destructive/15 text-destructive border-destructive/30",
  completed: "bg-success/15 text-success border-success/30",
  paid: "bg-success/15 text-success border-success/30",
  failed: "bg-destructive/15 text-destructive border-destructive/30",
  confirmed: "bg-accent/15 text-accent border-accent/30",
  cancelled: "bg-muted text-muted-foreground border-muted-foreground/30",
  info: "bg-primary/15 text-primary border-primary/30",
  warning: "bg-warning/15 text-warning-foreground border-warning/30",
  error: "bg-destructive/15 text-destructive border-destructive/30",
};

export const StatusBadge = ({ variant, children, className }: StatusBadgeProps) => {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
};
