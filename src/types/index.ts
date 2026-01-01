export type UserRole = "admin" | "staff";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  lastLogin: Date;
  avatar?: string;
}

export type ApplicationStatus = "pending" | "verified" | "approved" | "rejected" | "completed";
export type DeliveryOption = "takeaway" | "email_pdf" | "shipping";
export type VehicleType = "sedan" | "mpv" | "pickup_suv" | "motorcycle";
export type PackageType = "compulsory" | "compulsory_voluntary";

export interface Application {
  id: string; // Format: 25-001, 25-002, etc.
  status: ApplicationStatus;
  submissionDate: Date;
  // Customer info
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  // Trip details
  destination: string;
  travelDate: Date;
  passengerCount: number;
  // Package details
  vehicleType: VehicleType;
  packageType: PackageType;
  addons: string[]; // e.g., ["TM2/3", "TDAC"]
  // Delivery
  deliveryOption: DeliveryOption;
  deliveryTrackingId?: string;
  // Pricing
  totalPrice: number;
}

export interface ExtractedField {
  label: string;
  value: string;
  confidence: number;
  expectedValue?: string;
  isMismatch?: boolean;
  ocrRegion?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export type RejectionReason = "blurred" | "mismatch" | "expired" | "unclear" | "incomplete" | "fraudulent";

export interface VerificationAudit {
  id: string;
  reviewerName: string;
  reviewerId: string;
  action: "approved" | "rejected" | "flagged" | "re_upload_requested";
  reason?: RejectionReason;
  notes?: string;
  timestamp: Date;
}

export interface AIVerification {
  id: string;
  applicationId: string;
  documentType: "drivers_license" | "passport" | "vehicle_registration";
  documentId: string;
  extractedFields: ExtractedField[];
  overallConfidence: number;
  verifiedByAI: boolean;
  reviewedByStaff: boolean;
  flagged: boolean;
  timestamp: Date;
  documentImageUrl?: string;
  rejectionReason?: RejectionReason;
  reviewerNotes?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  auditTrail?: VerificationAudit[];
  reUploadRequested?: boolean;
}

export type PaymentMethod = "qr" | "cash";
export type PaymentStatus = "pending" | "paid" | "failed";

export interface Payment {
  id: string;
  applicationId: string;
  method: PaymentMethod;
  amount: number;
  status: PaymentStatus;
  receiptUrl?: string;
  createdAt: Date;
}

export type AddonType = "tdac" | "insurance" | "towing" | "sim_card";
export type AddonStatus = "pending" | "confirmed" | "completed" | "cancelled";

export interface Addon {
  id: string;
  applicationId: string;
  type: AddonType;
  vendorName: string;
  cost: number;
  status: AddonStatus;
  trackingNumber?: string;
}

export type LogSeverity = "info" | "warning" | "error";

export interface ApplicationLog {
  id: string;
  applicationId: string;
  action: string;
  performedBy: string;
  timestamp: Date;
  remarks?: string;
}

export interface SystemLog {
  id: string;
  eventType: string;
  severity: LogSeverity;
  triggeredBy: string;
  message: string;
  timestamp: Date;
}

export interface Analytics {
  newUsersToday: number;
  activeUsers: number;
  totalPayments: number;
  totalRevenue: number;
  avgVerificationTime: number;
  popularAddonType: AddonType;
}

export interface Report {
  id: string;
  type: "daily" | "weekly" | "monthly" | "custom";
  startDate: Date;
  endDate: Date;
  totalUsers: number;
  totalApplications: number;
  totalVerified: number;
  totalRejected: number;
  totalRevenue: number;
  downloadUrl: string;
  createdAt: Date;
}

export type DeliveryStatus = "pending" | "shipped" | "in_transit" | "delivered";
export type DeliveryMethod = "courier" | "email";
export type CourierProvider = "poslaju" | "dhl" | "jnt" | "gdex";

export interface DeliveryRecord {
  id: string;
  trackingId: string; // Format: 2025-001, 2025-002, etc.
  policyNumber: string;
  recipientName: string;
  recipientEmail: string;
  courierTrackingNumber?: string; // External courier tracking number
  deliveryMethod: DeliveryMethod;
  courierProvider?: CourierProvider;
  status: DeliveryStatus;
  isPriority: boolean;
  shippedAt?: Date;
  inTransitAt?: Date;
  deliveredAt?: Date;
  emailSentAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
