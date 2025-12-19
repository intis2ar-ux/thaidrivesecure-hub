import { useState, useEffect, useCallback } from "react";
import { collection, addDoc, query, orderBy, limit, onSnapshot, where, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { AuditLog, AuditAction, AuditModule, AuditLogFilter } from "@/types/audit";

export const useAuditLog = () => {
  const { user } = useAuth();
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch audit logs
  useEffect(() => {
    const q = query(
      collection(db, "audit_logs"),
      orderBy("timestamp", "desc"),
      limit(500)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const logs = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            timestamp: data.timestamp?.toDate() || new Date(),
          } as AuditLog;
        });
        setAuditLogs(logs);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching audit logs:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Log an action
  const logAction = useCallback(
    async (
      action: AuditAction,
      module: AuditModule,
      resourceId: string,
      resourceType: string,
      options?: {
        previousState?: string;
        newState?: string;
        reason?: string;
        notes?: string;
        metadata?: Record<string, unknown>;
      }
    ) => {
      if (!user) {
        console.warn("Cannot log action: no user context");
        return null;
      }

      try {
        const auditEntry: Omit<AuditLog, "id"> = {
          action,
          module,
          resourceId,
          resourceType,
          previousState: options?.previousState,
          newState: options?.newState,
          performedBy: {
            userId: user.id,
            userName: user.name,
            userRole: user.role,
          },
          reason: options?.reason,
          notes: options?.notes,
          metadata: options?.metadata,
          timestamp: new Date(),
        };

        const docRef = await addDoc(collection(db, "audit_logs"), {
          ...auditEntry,
          timestamp: Timestamp.now(),
        });

        return docRef.id;
      } catch (err: any) {
        console.error("Error logging audit action:", err);
        setError(err.message);
        return null;
      }
    },
    [user]
  );

  // Filter logs
  const filterLogs = useCallback(
    (filter: AuditLogFilter): AuditLog[] => {
      return auditLogs.filter((log) => {
        if (filter.module && log.module !== filter.module) return false;
        if (filter.action && log.action !== filter.action) return false;
        if (filter.userId && log.performedBy.userId !== filter.userId) return false;
        if (filter.resourceId && log.resourceId !== filter.resourceId) return false;
        if (filter.startDate && log.timestamp < filter.startDate) return false;
        if (filter.endDate && log.timestamp > filter.endDate) return false;
        return true;
      });
    },
    [auditLogs]
  );

  // Get logs by resource
  const getLogsByResource = useCallback(
    (resourceId: string): AuditLog[] => {
      return auditLogs.filter((log) => log.resourceId === resourceId);
    },
    [auditLogs]
  );

  // Get logs by user
  const getLogsByUser = useCallback(
    (userId: string): AuditLog[] => {
      return auditLogs.filter((log) => log.performedBy.userId === userId);
    },
    [auditLogs]
  );

  // Log specific actions - convenience methods
  const logApplicationAction = useCallback(
    async (
      action: AuditAction,
      applicationId: string,
      previousStatus?: string,
      newStatus?: string,
      reason?: string
    ) => {
      return logAction(action, "application", applicationId, "Application", {
        previousState: previousStatus,
        newState: newStatus,
        reason,
      });
    },
    [logAction]
  );

  const logVerificationAction = useCallback(
    async (
      action: AuditAction,
      verificationId: string,
      options?: {
        previousState?: string;
        newState?: string;
        reason?: string;
        notes?: string;
        originalAIConfidence?: number;
      }
    ) => {
      return logAction(action, "verification", verificationId, "Verification", {
        ...options,
        metadata: options?.originalAIConfidence
          ? { originalAIConfidence: options.originalAIConfidence }
          : undefined,
      });
    },
    [logAction]
  );

  const logPaymentAction = useCallback(
    async (action: AuditAction, paymentId: string, previousStatus?: string, newStatus?: string) => {
      return logAction(action, "payment", paymentId, "Payment", {
        previousState: previousStatus,
        newState: newStatus,
      });
    },
    [logAction]
  );

  const logDeliveryAction = useCallback(
    async (action: AuditAction, deliveryId: string, previousStatus?: string, newStatus?: string, notes?: string) => {
      return logAction(action, "delivery", deliveryId, "Delivery", {
        previousState: previousStatus,
        newState: newStatus,
        notes,
      });
    },
    [logAction]
  );

  return {
    auditLogs,
    loading,
    error,
    logAction,
    logApplicationAction,
    logVerificationAction,
    logPaymentAction,
    logDeliveryAction,
    filterLogs,
    getLogsByResource,
    getLogsByUser,
  };
};
