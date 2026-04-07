import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { StatusLogEntry } from "@/types/review";
import { CheckCircle2, XCircle, Clock, FileText, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const actionIcons: Record<string, typeof Clock> = {
  pending: Clock,
  approved: CheckCircle2,
  rejected: XCircle,
  updated: RefreshCw,
};

const actionColors: Record<string, string> = {
  pending: "text-warning-foreground bg-warning/15",
  approved: "text-success bg-success/15",
  rejected: "text-destructive bg-destructive/15",
  updated: "text-primary bg-primary/15",
};

export const SubmissionTimeline = ({ submissionId }: { submissionId: string }) => {
  const [logs, setLogs] = useState<StatusLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "insurance_orders", submissionId, "status_logs"),
      orderBy("timestamp", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      const entries: StatusLogEntry[] = snap.docs.map((doc) => {
        const d = doc.data();
        return {
          action: d.action || "",
          previousStatus: d.previousStatus || "",
          notes: d.notes || "",
          performedBy: d.performedBy || "",
          timestamp: d.timestamp instanceof Timestamp ? d.timestamp.toDate() : new Date(d.timestamp),
        };
      });
      setLogs(entries);
      setLoading(false);
    });
    return () => unsub();
  }, [submissionId]);

  if (loading) return <p className="text-xs text-muted-foreground py-2">Loading timeline...</p>;

  if (logs.length === 0) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
        <FileText className="h-3.5 w-3.5" />
        No activity yet
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {logs.map((log, i) => {
        const Icon = actionIcons[log.action] || Clock;
        const colorCls = actionColors[log.action] || "text-muted-foreground bg-muted";
        return (
          <div key={i} className="flex gap-3">
            <div className={cn("flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center", colorCls)}>
              <Icon className="h-3.5 w-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium capitalize text-foreground">{log.action}</p>
              {log.notes && <p className="text-xs text-muted-foreground mt-0.5">{log.notes}</p>}
              <p className="text-xs text-muted-foreground mt-1">
                {log.performedBy} · {format(log.timestamp, "dd MMM yyyy, HH:mm")}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
