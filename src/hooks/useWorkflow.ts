import { ApplicationStatus } from "@/types";

// Application state machine - simplified to match Firestore schema
export const APPLICATION_STATES: ApplicationStatus[] = [
  "pending",
  "approved",
  "rejected",
];

// Workflow transition rules
interface TransitionRule {
  from: ApplicationStatus;
  to: ApplicationStatus;
  allowedRoles: ("admin" | "staff")[];
}

const workflowRules: TransitionRule[] = [
  { from: "pending", to: "approved", allowedRoles: ["admin"] },
  { from: "pending", to: "rejected", allowedRoles: ["admin"] },
  { from: "rejected", to: "pending", allowedRoles: ["admin"] },
];

export interface WorkflowValidation {
  isValid: boolean;
  blockedReason?: string;
  missingRequirements?: string[];
}

export interface WorkflowContext {
  currentStatus: ApplicationStatus;
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

    if (context.userRole && !rule.allowedRoles.includes(context.userRole)) {
      return {
        isValid: false,
        blockedReason: `Only ${rule.allowedRoles.join(" or ")} can perform this action.`,
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
      approved: 2,
      rejected: 0,
    };
    return stages[status] || 0;
  };

  const getStatusLabel = (status: ApplicationStatus): string => {
    const labels: Record<ApplicationStatus, string> = {
      pending: "Pending",
      approved: "Approved",
      rejected: "Rejected",
    };
    return labels[status] || status;
  };

  const getStatusDescription = (status: ApplicationStatus): string => {
    const descriptions: Record<ApplicationStatus, string> = {
      pending: "Application submitted, awaiting review",
      approved: "Application approved - customer has paid",
      rejected: "Application has been rejected",
    };
    return descriptions[status] || "";
  };

  return {
    validateTransition,
    getNextAllowedStatuses,
    getWorkflowStage,
    getStatusLabel,
    getStatusDescription,
  };
};
