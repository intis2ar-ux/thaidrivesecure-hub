import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Payment } from "@/types";
import { format } from "date-fns";
import { QrCode, Banknote, CheckCircle } from "lucide-react";

interface ReceiptModalProps {
  payment: Payment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ReceiptModal = ({ payment, open, onOpenChange }: ReceiptModalProps) => {
  if (!payment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary">
            <CheckCircle className="h-5 w-5 text-success" />
            Payment Receipt
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Header */}
          <div className="text-center space-y-1">
            <p className="text-2xl font-bold text-foreground">RM{payment.amount.toLocaleString()}</p>
            <p className="text-sm text-success font-medium">Payment Successful</p>
          </div>

          <Separator />

          {/* Details */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Payment ID</span>
              <span className="font-mono text-foreground">{payment.id}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Customer</span>
              <span className="font-medium text-foreground">{payment.customerName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Method</span>
              <span className="flex items-center gap-1.5 text-foreground">
                {payment.method === "qr" ? (
                  <QrCode className="h-3.5 w-3.5" />
                ) : (
                  <Banknote className="h-3.5 w-3.5" />
                )}
                {payment.method === "qr" ? "QR Payment" : "Cash"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Date</span>
              <span className="text-foreground">{format(payment.createdAt, "dd MMM yyyy, HH:mm")}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <span className="text-success font-medium capitalize">{payment.status}</span>
            </div>
          </div>

          <Separator />

          <div className="flex justify-between font-semibold">
            <span className="text-foreground">Total Paid</span>
            <span className="text-foreground">RM{payment.amount.toLocaleString()}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
