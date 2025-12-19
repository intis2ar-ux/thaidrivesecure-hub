export type AuditAction =
  | "application_created"
  | "application_updated"
  | "application_approved"
  | "application_rejected"
  | "application_completed"
  | "document_uploaded"
  | "document_verified"
  | "document_rejected"
  | "ai_verification_completed"
  | "ai_override"
  | "payment_received"
  | "payment_failed"
  | "payment_refunded"
  | "delivery_shipped"
  | "delivery_in_transit"
  | "delivery_completed"
  | "addon_added"
  | "addon_cancelled"
  | "user_login"
  | "user_logout"
  | "settings_updated"
  | "report_generated"
  | "status_changed";

export type AuditModule =
  | "application"
  | "verification"
  | "payment"
  | "delivery"
  | "addon"
  | "user"
  | "settings"
  | "report"
  | "system";

export interface AuditLog {
  id: string;
  action: AuditAction;
  module: AuditModule;
  resourceId: string;
  resourceType: string;
  previousState?: string;
  newState?: string;
  performedBy: {
    userId: string;
    userName: string;
    userRole: "admin" | "staff";
  };
  reason?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
  timestamp: Date;
  ipAddress?: string;
}

export interface AuditLogFilter {
  module?: AuditModule;
  action?: AuditAction;
  userId?: string;
  resourceId?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface AIMetrics {
  totalVerifications: number;
  autoVerifiedCount: number;
  manualReviewCount: number;
  flaggedCount: number;
  humanOverrideCount: number;
  autoVerificationSuccessRate: number;
  humanOverrideRate: number;
  averageConfidence: number;
  falsePositiveRate: number;
  falseNegativeRate: number;
}

export interface ReportData {
  applicationProcessingTime: {
    averageDays: number;
    byStatus: { status: string; count: number; avgDays: number }[];
  };
  aiVerificationAccuracy: AIMetrics;
  rejectionsByReason: { reason: string; count: number; percentage: number }[];
  revenueByService: { service: string; revenue: number; count: number }[];
  queuePriority: {
    priority: number;
    delayed: number;
    averageWaitTime: { priority: number; delayed: number };
  };
}
