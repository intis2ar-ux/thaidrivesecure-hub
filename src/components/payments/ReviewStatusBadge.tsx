import { cn } from "@/lib/utils";
import { ReviewStatus, QueuePriority } from "@/types/review";
import { Clock, Eye, CheckCircle2, XCircle, Flame, AlertTriangle, Circle } from "lucide-react";

const statusConfig: Record<ReviewStatus, { label: string; icon: typeof Clock; classes: string }> = {
  awaiting_review: {
    label: "Awaiting Review",
    icon: Clock,
    classes: "bg-warning/15 text-warning-foreground border-warning/30",
  },
  under_review: {
    label: "Under Review",
    icon: Eye,
    classes: "bg-primary/15 text-primary border-primary/30",
  },
  approved: {
    label: "Approved",
    icon: CheckCircle2,
    classes: "bg-success/15 text-success border-success/30",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    classes: "bg-destructive/15 text-destructive border-destructive/30",
  },
};

export const ReviewStatusBadge = ({ status, className }: { status: ReviewStatus; className?: string }) => {
  const config = statusConfig[status];
  const Icon = config.icon;
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border", config.classes, className)}>
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
};

const priorityConfig: Record<QueuePriority, { label: string; icon: typeof Circle; classes: string }> = {
  normal: { label: "Normal", icon: Circle, classes: "text-muted-foreground" },
  priority: { label: "Priority", icon: AlertTriangle, classes: "text-warning-foreground" },
  urgent: { label: "Urgent", icon: Flame, classes: "text-destructive" },
};

export const QueuePriorityBadge = ({ priority, className }: { priority: QueuePriority; className?: string }) => {
  const config = priorityConfig[priority];
  const Icon = config.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-medium", config.classes, className)}>
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
};
