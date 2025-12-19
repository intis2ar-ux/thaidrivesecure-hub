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
export type DeliveryOption = "counter" | "postal";

export interface Application {
  id: string;
  trackingId: string;
  status: ApplicationStatus;
  submissionDate: Date;
  deliveryOption: DeliveryOption;
  deliveryTrackingId?: string;
  customerName: string;
  customerEmail: string;
  documentType: string;
}

export interface ExtractedField {
  label: string;
  value: string;
  confidence: number;
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
