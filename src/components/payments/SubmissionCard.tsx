import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { ReviewSubmission } from "@/types/review";
import { ReviewStatusBadge, QueuePriorityBadge } from "./ReviewStatusBadge";
import { SubmissionTimeline } from "./SubmissionTimeline";
import { ReceiptModal } from "./ReceiptModal";
import { Payment } from "@/types";
import {
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  StickyNote,
  QrCode,
  Banknote,
  User,
  Car,
  MapPin,
  Calendar,
  Users,
  Package,
  Receipt,
  Sparkles,
  FileImage,
  ExternalLink,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SubmissionCardProps {
  submission: ReviewSubmission;
  onApprove: (id: string, notes: string, performedBy: string) => Promise<void>;
  onReject: (id: string, reason: string, performedBy: string) => Promise<void>;
}

export const SubmissionCard = ({ submission, onApprove, onReject }: SubmissionCardProps) => {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);

  const isPending = submission.reviewStatus === "awaiting_review" || submission.reviewStatus === "under_review";

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await onApprove(submission.id, notes, user?.name || "Staff");
      setNotes("");
      toast.success("Submission approved successfully");
    } catch {
      toast.error("Failed to approve");
    }
    setActionLoading(false);
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    setActionLoading(true);
    try {
      await onReject(submission.id, rejectReason, user?.name || "Staff");
      setRejectReason("");
      setShowRejectDialog(false);
      toast.success("Submission rejected");
    } catch {
      toast.error("Failed to reject");
    }
    setActionLoading(false);
  };

  // Smart suggestion logic
  const getSmartSuggestion = () => {
    if (submission.reviewStatus !== "awaiting_review") return null;
    const hasDocuments = submission.documents?.passportUrls?.length || submission.documents?.vehicleGrantUrl;
    if (hasDocuments && submission.totalPrice > 0) {
      return { label: "Likely valid", color: "text-success bg-success/10 border-success/20" };
    }
    if (!hasDocuments) {
      return { label: "Missing documents", color: "text-destructive bg-destructive/10 border-destructive/20" };
    }
    return null;
  };

  const suggestion = getSmartSuggestion();

  const receiptPayment: Payment = {
    id: submission.id,
    applicationId: submission.id,
    customerName: submission.customerName,
    method: submission.paymentMethod,
    amount: submission.totalPrice,
    status: submission.reviewStatus === "approved" ? "paid" : "pending",
    createdAt: submission.createdAt,
  };

  return (
    <>
      <Card className={cn(
        "transition-all duration-200 hover:shadow-md border",
        submission.queuePriority === "urgent" && isPending && "border-destructive/40 shadow-destructive/5",
        submission.queuePriority === "priority" && isPending && "border-warning/40",
        !isPending && "opacity-90"
      )}>
        {/* Compact row */}
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {/* Left: Customer + Meta */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-foreground truncate">{submission.customerName}</h3>
                {submission.isNew && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-accent text-accent-foreground">
                    NEW
                  </span>
                )}
                {suggestion && (
                  <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-medium border flex items-center gap-1", suggestion.color)}>
                    <Sparkles className="h-2.5 w-2.5" />
                    {suggestion.label}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                <span className="font-mono">{submission.id.slice(0, 8)}...</span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  {submission.paymentMethod === "qr" ? <QrCode className="h-3 w-3" /> : <Banknote className="h-3 w-3" />}
                  {submission.paymentMethod === "qr" ? "QR" : "Cash"}
                </span>
                <span>·</span>
                <span>{formatDistanceToNow(submission.createdAt, { addSuffix: true })}</span>
              </div>
            </div>

            {/* Center: Amount */}
            <div className="text-right flex-shrink-0">
              <p className="text-lg font-bold text-foreground">RM{submission.totalPrice.toLocaleString()}</p>
              <QueuePriorityBadge priority={submission.queuePriority} />
            </div>

            {/* Status */}
            <ReviewStatusBadge status={submission.reviewStatus} />

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {isPending && user?.role === "admin" && (
                <>
                  <Button size="sm" className="bg-success hover:bg-success/90 text-success-foreground gap-1" onClick={handleApprove} disabled={actionLoading}>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Approve
                  </Button>
                  <Button size="sm" variant="destructive" className="gap-1" onClick={() => setShowRejectDialog(true)} disabled={actionLoading}>
                    <XCircle className="h-3.5 w-3.5" />
                    Reject
                  </Button>
                </>
              )}
              {submission.reviewStatus === "approved" && (
                <Button size="sm" variant="outline" className="gap-1" onClick={() => setReceiptOpen(true)}>
                  <Receipt className="h-3.5 w-3.5" />
                  Receipt
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={() => setExpanded(!expanded)} className="gap-1 text-muted-foreground">
                {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                {expanded ? "Hide" : "Details"}
              </Button>
            </div>
          </div>

          {/* Expanded Details */}
          {expanded && (
            <div className="mt-4 pt-4 border-t border-border/50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Column 1: Customer & Application */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Customer & Application</h4>
                  <div className="space-y-2.5">
                    <DetailRow icon={User} label="Name" value={submission.customerName} />
                    <DetailRow icon={User} label="Phone" value={submission.phone} />
                    <DetailRow icon={Car} label="Vehicle" value={submission.vehicleType} />
                    <DetailRow icon={MapPin} label="Border Route" value={submission.borderRoute} />
                    <DetailRow icon={Calendar} label="Travel Day" value={submission.travelDay} />
                    <DetailRow icon={Users} label="Passengers" value={String(submission.passengers)} />
                    <DetailRow icon={Package} label="Packages" value={submission.packages.join(", ") || "None"} />
                  </div>

                  {/* Documents */}
                  {(submission.documents?.passportUrls?.length || submission.documents?.vehicleGrantUrl) && (
                    <div className="pt-2">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Documents</h4>
                      <div className="space-y-1.5">
                        {submission.documents.passportUrls?.map((url, i) => (
                          <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-accent hover:underline">
                            <FileImage className="h-3 w-3" />
                            Passport {i + 1}
                            <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        ))}
                        {submission.documents.vehicleGrantUrl && (
                          <a href={submission.documents.vehicleGrantUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-accent hover:underline">
                            <FileImage className="h-3 w-3" />
                            Vehicle Grant
                            <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Column 2: Payment Details */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Payment Details</h4>
                  <div className="space-y-2.5">
                    <DetailRow icon={Receipt} label="Amount" value={`RM${submission.totalPrice.toLocaleString()}`} />
                    <DetailRow
                      icon={submission.paymentMethod === "qr" ? QrCode : Banknote}
                      label="Method"
                      value={submission.paymentMethod === "qr" ? "QR Payment" : "Cash at Counter"}
                    />
                    <DetailRow icon={Calendar} label="Submitted" value={format(submission.createdAt, "dd MMM yyyy, HH:mm")} />
                  </div>

                  {/* Notes input for staff */}
                  {isPending && (
                    <div className="pt-3">
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                        <StickyNote className="h-3 w-3 inline mr-1" />
                        Staff Notes
                      </label>
                      <Textarea
                        placeholder="Add review notes..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="text-sm min-h-[60px]"
                      />
                    </div>
                  )}
                </div>

                {/* Column 3: Activity Timeline */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Activity Timeline</h4>
                  <SubmissionTimeline submissionId={submission.id} />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reject Confirmation Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">Reject Submission</AlertDialogTitle>
            <AlertDialogDescription>
              This will notify the customer that their submission needs to be updated. Please provide a reason.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            placeholder="Reason for rejection (required)..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="min-h-[80px]"
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReject} className="bg-destructive hover:bg-destructive/90" disabled={actionLoading}>
              Confirm Rejection
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ReceiptModal payment={receiptPayment} open={receiptOpen} onOpenChange={setReceiptOpen} />
    </>
  );
};

const DetailRow = ({ icon: Icon, label, value }: { icon: typeof User; label: string; value: string }) => (
  <div className="flex items-start gap-2 text-sm">
    <Icon className="h-3.5 w-3.5 mt-0.5 text-muted-foreground flex-shrink-0" />
    <span className="text-muted-foreground flex-shrink-0">{label}:</span>
    <span className="font-medium text-foreground truncate">{value}</span>
  </div>
);
