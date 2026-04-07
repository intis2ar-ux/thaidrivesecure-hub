export type ReviewStatus = "awaiting_review" | "under_review" | "approved" | "rejected";

export type QueuePriority = "normal" | "priority" | "urgent";

export interface ReviewSubmission {
  id: string;
  customerName: string;
  phone: string;
  vehicleType: string;
  vehiclePlate?: string;
  borderRoute: string;
  travelDay: string;
  packages: string[];
  passengers: number;
  totalPrice: number;
  paymentMethod: "qr" | "cash";
  reviewStatus: ReviewStatus;
  queuePriority: QueuePriority;
  createdAt: Date;
  documents?: {
    passportUrls?: string[];
    vehicleGrantUrl?: string;
  };
  isNew: boolean;
  staffNotes?: string;
}

export interface StatusLogEntry {
  action: string;
  previousStatus: string;
  notes: string;
  performedBy: string;
  timestamp: Date;
}
