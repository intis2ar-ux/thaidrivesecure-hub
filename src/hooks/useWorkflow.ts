import { ApplicationStatus, DeliveryStatus, PaymentStatus } from "@/types";

// Application state machine
export const APPLICATION_STATES: ApplicationStatus[] = [
  "pending",      // Submitted
  "verified",     // AI/Manual Verified
  "approved",     // Approved by admin
  "rejected",     // Rejected
  "completed",    // Fully completed
];

// Extended application workflow states
export type ExtendedApplicationState = 
  | "submitted"
  | "ai_verified"
  | "manual_review"
  | "approved"
  | "payment_pending"
  | "payment_confirmed"
  | "policy_issued"
  | "delivery_pending"
  | "delivery_in_transit"
  | "completed"
  | "rejected";

// Workflow transition rules
interface TransitionRule {
  from: ApplicationStatus;
  to: ApplicationStatus;
  requires?: {
    documentVerified?: boolean;
    paymentConfirmed?: boolean;
    deliveryCompleted?: boolean;
    rejectionReason?: boolean;
  };
  allowedRoles: ("admin" | "staff")[];
}

const workflowRules: TransitionRule[] = [
  // Pending can go to verified (after documents are verified)
  { from: "pending", to: "verified", requires: { documentVerified: true }, allowedRoles: ["admin", "staff"] },
  { from: "pending", to: "rejected", requires: { rejectionReason: true }, allowedRoles: ["admin"] },
  
  // Verified can go to approved (admin only)
  { from: "verified", to: "approved", allowedRoles: ["admin"] },
  { from: "verified", to: "rejected", requires: { rejectionReason: true }, allowedRoles: ["admin"] },
  
  // Approved can go to completed (requires payment + delivery)
  { from: "approved", to: "completed", requires: { paymentConfirmed: true, deliveryCompleted: true }, allowedRoles: ["admin"] },
  { from: "approved", to: "rejected", requires: { rejectionReason: true }, allowedRoles: ["admin"] },
  
  // Rejected can go back to pending (re-submission)
  { from: "rejected", to: "pending", allowedRoles: ["admin"] },
];

export interface WorkflowValidation {
  isValid: boolean;
  blockedReason?: string;
  missingRequirements?: string[];
}

export interface WorkflowContext {
  currentStatus: ApplicationStatus;
  documentVerified: boolean;
  paymentConfirmed: boolean;
  deliveryCompleted: boolean;
  hasRejectionReason: boolean;
  userRole: "admin" | "staff";
}

export const useWorkflow = () => {
  const validateTransition = (
    from: ApplicationStatus,
    to: ApplicationStatus,
    context: Partial<WorkflowContext>
  ): WorkflowValidation => {
    const rule = workflowRules.find((r) => r.from === from && r.to === to);

    if (!rule) {
      return {
        isValid: false,
        blockedReason: `Cannot transition from "${from}" to "${to}". This transition is not allowed.`,
      };
    }

    // Check role
    if (context.userRole && !rule.allowedRoles.includes(context.userRole)) {
      return {
        isValid: false,
        blockedReason: `Only ${rule.allowedRoles.join(" or ")} can perform this action.`,
      };
    }

    // Check requirements
    const missingRequirements: string[] = [];

    if (rule.requires?.documentVerified && !context.documentVerified) {
      missingRequirements.push("Documents must be verified before this action");
    }

    if (rule.requires?.paymentConfirmed && !context.paymentConfirmed) {
      missingRequirements.push("Payment must be confirmed before marking as completed");
    }

    if (rule.requires?.deliveryCompleted && !context.deliveryCompleted) {
      missingRequirements.push("Delivery must be completed before marking as completed");
    }

    if (rule.requires?.rejectionReason && !context.hasRejectionReason) {
      missingRequirements.push("A rejection reason must be provided");
    }

    if (missingRequirements.length > 0) {
      return {
        isValid: false,
        blockedReason: "Cannot complete this action due to missing requirements.",
        missingRequirements,
      };
    }

    return { isValid: true };
  };

  const getNextAllowedStatuses = (
    currentStatus: ApplicationStatus,
    userRole: "admin" | "staff"
  ): ApplicationStatus[] => {
    return workflowRules
      .filter((r) => r.from === currentStatus && r.allowedRoles.includes(userRole))
      .map((r) => r.to);
  };

  const getWorkflowStage = (status: ApplicationStatus): number => {
    const stages: Record<ApplicationStatus, number> = {
      pending: 1,
      verified: 2,
      approved: 3,
      rejected: 0,
      completed: 4,
    };
    return stages[status] || 0;
  };

  const getStatusLabel = (status: ApplicationStatus): string => {
    const labels: Record<ApplicationStatus, string> = {
      pending: "Submitted",
      verified: "Documents Verified",
      approved: "Approved",
      rejected: "Rejected",
      completed: "Completed",
    };
    return labels[status] || status;
  };

  const getStatusDescription = (status: ApplicationStatus): string => {
    const descriptions: Record<ApplicationStatus, string> = {
      pending: "Application submitted, awaiting document verification",
      verified: "Documents have been verified, awaiting admin approval",
      approved: "Application approved, awaiting payment and delivery",
      rejected: "Application has been rejected",
      completed: "Application fully completed",
    };
    return descriptions[status] || "";
  };

  const canApproveApplication = (
    documentVerified: boolean,
    userRole: "admin" | "staff"
  ): WorkflowValidation => {
    if (userRole !== "admin") {
      return { isValid: false, blockedReason: "Only admin can approve applications" };
    }
    if (!documentVerified) {
      return { isValid: false, blockedReason: "Documents must be verified before approval" };
    }
    return { isValid: true };
  };

  const canCompleteApplication = (
    paymentConfirmed: boolean,
    deliveryCompleted: boolean
  ): WorkflowValidation => {
    const missing: string[] = [];
    if (!paymentConfirmed) missing.push("Payment confirmation required");
    if (!deliveryCompleted) missing.push("Delivery must be marked as delivered");

    if (missing.length > 0) {
      return {
        isValid: false,
        blockedReason: "Cannot mark as completed",
        missingRequirements: missing,
      };
    }
    return { isValid: true };
  };

  const canIssuePolicy = (paymentConfirmed: boolean): WorkflowValidation => {
    if (!paymentConfirmed) {
      return { isValid: false, blockedReason: "Cannot issue policy before payment is confirmed" };
    }
    return { isValid: true };
  };

  return {
    validateTransition,
    getNextAllowedStatuses,
    getWorkflowStage,
    getStatusLabel,
    getStatusDescription,
    canApproveApplication,
    canCompleteApplication,
    canIssuePolicy,
  };
};
