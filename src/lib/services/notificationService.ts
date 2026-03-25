import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export type NotificationType = "application" | "verification" | "payment" | "tracking" | "system";
export type NotificationPriority = "low" | "medium" | "high";
export type RecipientRole = "admin" | "staff" | "all";

interface CreateNotificationParams {
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  recipientRole: RecipientRole;
  targetPage: string;
  targetId?: string;
  recipientUserId?: string;
}

export const createNotification = async (params: CreateNotificationParams) => {
  try {
    await addDoc(collection(db, "WDBnotifications"), {
      title: params.title,
      message: params.message,
      type: params.type,
      priority: params.priority,
      recipientRole: params.recipientRole,
      targetPage: params.targetPage,
      targetId: params.targetId || "",
      recipientUserId: params.recipientUserId || "",
      isRead: false,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Failed to create notification:", error);
  }
};

// ── Application Notifications ──────────────────────────────────

export const notifyApplicationStatusChanged = (
  appId: string,
  appName: string,
  newStatus: string,
  performedBy: string
) => {
  const statusMessages: Record<string, { title: string; message: string; priority: NotificationPriority }> = {
    pending: {
      title: "Application Set to Pending",
      message: `Application for ${appName} has been set to pending by ${performedBy}.`,
      priority: "low",
    },
    approved: {
      title: "Application Approved",
      message: `Application for ${appName} has been approved by ${performedBy}.`,
      priority: "medium",
    },
    rejected: {
      title: "Application Rejected",
      message: `Application for ${appName} has been rejected by ${performedBy}.`,
      priority: "high",
    },
  };

  const config = statusMessages[newStatus] || statusMessages.pending;

  return createNotification({
    ...config,
    type: "application",
    recipientRole: "all",
    targetPage: "/applications",
    targetId: appId,
  });
};

// ── AI Verification Notifications ──────────────────────────────

export const notifyVerificationApproved = (verificationId: string, appId: string) =>
  createNotification({
    title: "Document Verified",
    message: `Verification for application ${appId} has been approved by staff.`,
    type: "verification",
    priority: "medium",
    recipientRole: "all",
    targetPage: "/verification",
    targetId: verificationId,
  });

export const notifyVerificationRejected = (verificationId: string, appId: string) =>
  createNotification({
    title: "Document Rejected",
    message: `Verification for application ${appId} has been rejected and requires attention.`,
    type: "verification",
    priority: "high",
    recipientRole: "all",
    targetPage: "/verification",
    targetId: verificationId,
  });

export const notifyReUploadRequested = (verificationId: string, appId: string) =>
  createNotification({
    title: "Re-upload Requested",
    message: `A document re-upload has been requested for application ${appId}.`,
    type: "verification",
    priority: "medium",
    recipientRole: "staff",
    targetPage: "/verification",
    targetId: verificationId,
  });

// ── Tracking Notifications ─────────────────────────────────────

export const notifyDeliveryUpdated = (deliveryId: string, trackingId: string, updates: Record<string, any>) => {
  const statusLabel = updates.status ? ` to "${updates.status}"` : "";
  return createNotification({
    title: "Tracking Status Updated",
    message: `Delivery ${trackingId} has been updated${statusLabel}.`,
    type: "tracking",
    priority: "low",
    recipientRole: "staff",
    targetPage: "/tracking",
    targetId: deliveryId,
  });
};

// ── Add-on / System Notifications ──────────────────────────────

export const notifyAddonStatusChanged = (addonId: string, addonType: string, newStatus: string) =>
  createNotification({
    title: "Add-on Status Updated",
    message: `${addonType.replace("_", " ")} add-on has been updated to ${newStatus}.`,
    type: "system",
    priority: "medium",
    recipientRole: "staff",
    targetPage: "/addons",
    targetId: addonId,
  });
