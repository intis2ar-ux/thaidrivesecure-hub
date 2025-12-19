import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "./firebase";

const sampleApplications = [
  { trackingId: "TRK-2024-001", customerName: "Somchai Prasert", customerEmail: "somchai@email.com", documentType: "passport", status: "pending", queueCategory: "paid", deliveryOption: "postal", submissionDate: Timestamp.fromDate(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)) },
  { trackingId: "TRK-2024-002", customerName: "Nattaya Wong", customerEmail: "nattaya@email.com", documentType: "vehicle_registration", status: "verified", queueCategory: "paid", deliveryOption: "counter", submissionDate: Timestamp.fromDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)) },
  { trackingId: "TRK-2024-003", customerName: "Prasit Chaiyaporn", customerEmail: "prasit@email.com", documentType: "driving_license", status: "approved", queueCategory: "unpaid", deliveryOption: "postal", deliveryTrackingId: "TH12345678", submissionDate: Timestamp.fromDate(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)) },
  { trackingId: "TRK-2024-004", customerName: "Kannika Sutthipong", customerEmail: "kannika@email.com", documentType: "passport", status: "rejected", queueCategory: "paid", deliveryOption: "counter", submissionDate: Timestamp.fromDate(new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)) },
  { trackingId: "TRK-2024-005", customerName: "Wichai Somboon", customerEmail: "wichai@email.com", documentType: "vehicle_registration", status: "completed", queueCategory: "paid", deliveryOption: "postal", deliveryTrackingId: "TH98765432", submissionDate: Timestamp.fromDate(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)) },
  { trackingId: "TRK-2024-006", customerName: "Supaporn Malee", customerEmail: "supaporn@email.com", documentType: "driving_license", status: "pending", queueCategory: "unpaid", deliveryOption: "counter", submissionDate: Timestamp.fromDate(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)) },
];

const samplePayments = [
  { applicationId: "TRK-2024-001", amount: 1500, method: "qr", status: "paid", receiptUrl: "https://example.com/receipt/1", createdAt: Timestamp.fromDate(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)) },
  { applicationId: "TRK-2024-002", amount: 2000, method: "card", status: "paid", receiptUrl: "https://example.com/receipt/2", createdAt: Timestamp.fromDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)) },
  { applicationId: "TRK-2024-003", amount: 1200, method: "cash", status: "pending", createdAt: Timestamp.fromDate(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)) },
  { applicationId: "TRK-2024-004", amount: 1800, method: "fpx", status: "paid", receiptUrl: "https://example.com/receipt/4", createdAt: Timestamp.fromDate(new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)) },
  { applicationId: "TRK-2024-005", amount: 2500, method: "qr", status: "paid", receiptUrl: "https://example.com/receipt/5", createdAt: Timestamp.fromDate(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)) },
  { applicationId: "TRK-2024-006", amount: 1000, method: "card", status: "failed", createdAt: Timestamp.fromDate(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)) },
];

const sampleVerifications = [
  { applicationId: "TRK-2024-001", documentType: "passport", extractedText: "Name: Somchai Prasert, DOB: 1985-03-15, Passport: TH123456", confidenceScore: 0.95, verifiedByAI: true, reviewedByStaff: false, timestamp: Timestamp.fromDate(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)) },
  { applicationId: "TRK-2024-002", documentType: "vehicle_registration", extractedText: "Vehicle: Toyota Camry 2020, Plate: กข 1234", confidenceScore: 0.88, verifiedByAI: true, reviewedByStaff: true, timestamp: Timestamp.fromDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)) },
  { applicationId: "TRK-2024-003", documentType: "driving_license", extractedText: "License: DL789012, Class: B, Expires: 2025-12-31", confidenceScore: 0.92, verifiedByAI: true, reviewedByStaff: true, timestamp: Timestamp.fromDate(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)) },
  { applicationId: "TRK-2024-004", documentType: "passport", extractedText: "Document unclear - possible tampering detected", confidenceScore: 0.45, verifiedByAI: false, reviewedByStaff: true, timestamp: Timestamp.fromDate(new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)) },
  { applicationId: "TRK-2024-005", documentType: "vehicle_registration", extractedText: "Vehicle: Honda Civic 2022, Plate: ขค 5678", confidenceScore: 0.97, verifiedByAI: true, reviewedByStaff: true, timestamp: Timestamp.fromDate(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)) },
  { applicationId: "TRK-2024-006", documentType: "driving_license", extractedText: "License: DL345678, Class: A2", confidenceScore: 0.65, verifiedByAI: false, reviewedByStaff: false, timestamp: Timestamp.fromDate(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)) },
];

const sampleAddons = [
  { applicationId: "TRK-2024-001", type: "insurance", vendorName: "Thai Life Insurance", cost: 5000, status: "confirmed", trackingNumber: null },
  { applicationId: "TRK-2024-002", type: "tdac", vendorName: "TDAC Center", cost: 800, status: "pending" },
  { applicationId: "TRK-2024-003", type: "towing", vendorName: "Fast Tow Service", cost: 1500, status: "completed", trackingNumber: "TOW-001" },
  { applicationId: "TRK-2024-004", type: "sim_card", vendorName: "AIS Mobile", cost: 299, status: "cancelled" },
  { applicationId: "TRK-2024-005", type: "insurance", vendorName: "Bangkok Insurance", cost: 4500, status: "completed", trackingNumber: "INS-002" },
  { applicationId: "TRK-2024-006", type: "tdac", vendorName: "TDAC Center", cost: 800, status: "pending" },
];

const sampleLogs = [
  { type: "application", applicationId: "TRK-2024-001", action: "Application submitted", performedBy: "System", timestamp: Timestamp.fromDate(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)), remarks: "New application received" },
  { type: "application", applicationId: "TRK-2024-002", action: "Status updated to verified", performedBy: "admin@thaidrive.com", timestamp: Timestamp.fromDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)), remarks: "AI verification passed" },
  { type: "application", applicationId: "TRK-2024-003", action: "Status updated to approved", performedBy: "staff@thaidrive.com", timestamp: Timestamp.fromDate(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)), remarks: "Documents approved" },
  { type: "system", eventType: "Login", severity: "info", triggeredBy: "admin@thaidrive.com", message: "Admin user logged in successfully", timestamp: Timestamp.fromDate(new Date(Date.now() - 4 * 60 * 60 * 1000)) },
  { type: "system", eventType: "Payment Error", severity: "error", triggeredBy: "System", message: "Payment gateway timeout for TRK-2024-006", timestamp: Timestamp.fromDate(new Date(Date.now() - 6 * 60 * 60 * 1000)) },
  { type: "system", eventType: "AI Verification", severity: "warning", triggeredBy: "AI Engine", message: "Low confidence score detected for TRK-2024-004", timestamp: Timestamp.fromDate(new Date(Date.now() - 8 * 60 * 60 * 1000)) },
  { type: "system", eventType: "Backup", severity: "info", triggeredBy: "System", message: "Daily database backup completed successfully", timestamp: Timestamp.fromDate(new Date(Date.now() - 12 * 60 * 60 * 1000)) },
];

export const seedFirestore = async (): Promise<{ success: boolean; message: string }> => {
  try {
    // Seed applications
    for (const app of sampleApplications) {
      await addDoc(collection(db, "applications"), app);
    }

    // Seed payments
    for (const payment of samplePayments) {
      await addDoc(collection(db, "payments"), payment);
    }

    // Seed AI verifications
    for (const verification of sampleVerifications) {
      await addDoc(collection(db, "ai_verifications"), verification);
    }

    // Seed addons
    for (const addon of sampleAddons) {
      await addDoc(collection(db, "addons"), addon);
    }

    // Seed logs
    for (const log of sampleLogs) {
      await addDoc(collection(db, "logs"), log);
    }

    return { success: true, message: "Sample data added successfully!" };
  } catch (error: any) {
    console.error("Error seeding Firestore:", error);
    return { success: false, message: error.message };
  }
};
