import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "./firebase";

const sampleApplications = [
  { customerName: "Ahmad bin Hassan", customerEmail: "ahmad@email.com", customerPhone: "+60123456789", destination: "Bangkok, Thailand", travelDate: Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)), passengerCount: 2, vehicleType: "sedan", packageType: "compulsory", addons: ["TM2/3"], deliveryOption: "takeaway", totalPrice: 350, status: "pending", submissionDate: Timestamp.fromDate(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)) },
  { customerName: "Siti Nurhaliza", customerEmail: "siti@email.com", customerPhone: "+60198765432", destination: "Phuket, Thailand", travelDate: Timestamp.fromDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)), passengerCount: 4, vehicleType: "mpv", packageType: "compulsory_voluntary", addons: ["TDAC", "TM2/3"], deliveryOption: "shipping", totalPrice: 580, status: "verified", submissionDate: Timestamp.fromDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)) },
  { customerName: "Raj Kumar", customerEmail: "raj@email.com", customerPhone: "+60112233445", destination: "Chiang Mai, Thailand", travelDate: Timestamp.fromDate(new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)), passengerCount: 1, vehicleType: "motorcycle", packageType: "compulsory", addons: [], deliveryOption: "email_pdf", totalPrice: 180, status: "approved", deliveryTrackingId: "MY12345678", submissionDate: Timestamp.fromDate(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)) },
  { customerName: "Lee Wei Ming", customerEmail: "weiming@email.com", customerPhone: "+60134567890", destination: "Hat Yai, Thailand", travelDate: Timestamp.fromDate(new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)), passengerCount: 3, vehicleType: "sedan", packageType: "compulsory", addons: ["TM2/3"], deliveryOption: "takeaway", totalPrice: 320, status: "rejected", submissionDate: Timestamp.fromDate(new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)) },
  { customerName: "Fatimah binti Ali", customerEmail: "fatimah@email.com", customerPhone: "+60145678901", destination: "Krabi, Thailand", travelDate: Timestamp.fromDate(new Date(Date.now() + 21 * 24 * 60 * 60 * 1000)), passengerCount: 5, vehicleType: "pickup_suv", packageType: "compulsory_voluntary", addons: ["TDAC"], deliveryOption: "shipping", totalPrice: 720, status: "completed", deliveryTrackingId: "MY98765432", submissionDate: Timestamp.fromDate(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)) },
  { customerName: "Chong Mei Ling", customerEmail: "meiling@email.com", customerPhone: "+60156789012", destination: "Pattaya, Thailand", travelDate: Timestamp.fromDate(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)), passengerCount: 2, vehicleType: "sedan", packageType: "compulsory", addons: [], deliveryOption: "takeaway", totalPrice: 280, status: "pending", submissionDate: Timestamp.fromDate(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)) },
  { customerName: "Muhammad Hafiz", customerEmail: "hafiz@email.com", customerPhone: "+60167890123", destination: "Surat Thani, Thailand", travelDate: Timestamp.fromDate(new Date(Date.now() + 12 * 24 * 60 * 60 * 1000)), passengerCount: 4, vehicleType: "mpv", packageType: "compulsory_voluntary", addons: ["TM2/3", "TDAC"], deliveryOption: "email_pdf", totalPrice: 650, status: "verified", submissionDate: Timestamp.fromDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) },
  { customerName: "Tan Siew Bee", customerEmail: "siewbee@email.com", customerPhone: "+60178901234", destination: "Songkhla, Thailand", travelDate: Timestamp.fromDate(new Date(Date.now() + 8 * 24 * 60 * 60 * 1000)), passengerCount: 2, vehicleType: "sedan", packageType: "compulsory", addons: ["TM2/3"], deliveryOption: "takeaway", totalPrice: 340, status: "approved", submissionDate: Timestamp.fromDate(new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)) },
  { customerName: "Arun Nair", customerEmail: "arun@email.com", customerPhone: "+60189012345", destination: "Koh Samui, Thailand", travelDate: Timestamp.fromDate(new Date(Date.now() + 18 * 24 * 60 * 60 * 1000)), passengerCount: 1, vehicleType: "motorcycle", packageType: "compulsory", addons: [], deliveryOption: "email_pdf", totalPrice: 150, status: "pending", submissionDate: Timestamp.fromDate(new Date(Date.now() - 9 * 24 * 60 * 60 * 1000)) },
  { customerName: "Nurul Izzah", customerEmail: "nurul@email.com", customerPhone: "+60190123456", destination: "Bangkok, Thailand", travelDate: Timestamp.fromDate(new Date(Date.now() + 25 * 24 * 60 * 60 * 1000)), passengerCount: 6, vehicleType: "pickup_suv", packageType: "compulsory_voluntary", addons: ["TDAC", "TM2/3"], deliveryOption: "shipping", totalPrice: 890, status: "completed", deliveryTrackingId: "MY11223344", submissionDate: Timestamp.fromDate(new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)) },
];

const samplePayments = [
  { applicationId: "TRK-2024-001", amount: 150, method: "qr", status: "paid", receiptUrl: "https://example.com/receipt/1", createdAt: Timestamp.fromDate(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)) },
  { applicationId: "TRK-2024-002", amount: 200, method: "cash", status: "paid", receiptUrl: "https://example.com/receipt/2", createdAt: Timestamp.fromDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)) },
  { applicationId: "TRK-2024-003", amount: 120, method: "qr", status: "pending", createdAt: Timestamp.fromDate(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)) },
  { applicationId: "TRK-2024-004", amount: 180, method: "cash", status: "paid", receiptUrl: "https://example.com/receipt/4", createdAt: Timestamp.fromDate(new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)) },
  { applicationId: "TRK-2024-005", amount: 250, method: "qr", status: "paid", receiptUrl: "https://example.com/receipt/5", createdAt: Timestamp.fromDate(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)) },
  { applicationId: "TRK-2024-006", amount: 100, method: "cash", status: "failed", createdAt: Timestamp.fromDate(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)) },
  { applicationId: "TRK-2024-007", amount: 175, method: "qr", status: "paid", receiptUrl: "https://example.com/receipt/7", createdAt: Timestamp.fromDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) },
  { applicationId: "TRK-2024-008", amount: 225, method: "cash", status: "paid", receiptUrl: "https://example.com/receipt/8", createdAt: Timestamp.fromDate(new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)) },
  { applicationId: "TRK-2024-009", amount: 130, method: "qr", status: "pending", createdAt: Timestamp.fromDate(new Date(Date.now() - 9 * 24 * 60 * 60 * 1000)) },
  { applicationId: "TRK-2024-010", amount: 300, method: "cash", status: "paid", receiptUrl: "https://example.com/receipt/10", createdAt: Timestamp.fromDate(new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)) },
];

const sampleVerifications = [
  { applicationId: "TRK-2024-001", documentType: "passport", status: "pending", extractedFields: [{ label: "Full Name", value: "Ahmad bin Hassan", confidence: 0.95 }, { label: "Passport No", value: "A12345678", confidence: 0.92 }, { label: "Date of Birth", value: "1985-03-15", confidence: 0.88 }], confidenceScore: 0.92, timestamp: Timestamp.fromDate(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)) },
  { applicationId: "TRK-2024-002", documentType: "vehicle_registration", status: "verified", extractedFields: [{ label: "Vehicle Model", value: "Toyota Camry 2020", confidence: 0.97 }, { label: "Plate Number", value: "WKL 1234", confidence: 0.95 }], confidenceScore: 0.96, timestamp: Timestamp.fromDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)) },
  { applicationId: "TRK-2024-003", documentType: "driving_license", status: "verified", extractedFields: [{ label: "License No", value: "DL789012", confidence: 0.94 }, { label: "Class", value: "D", confidence: 0.91 }], confidenceScore: 0.92, timestamp: Timestamp.fromDate(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)) },
  { applicationId: "TRK-2024-004", documentType: "passport", status: "flagged", extractedFields: [{ label: "Full Name", value: "Lee Wei Ming", confidence: 0.45 }, { label: "Passport No", value: "Unclear", confidence: 0.32 }], confidenceScore: 0.38, timestamp: Timestamp.fromDate(new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)) },
  { applicationId: "TRK-2024-005", documentType: "vehicle_registration", status: "verified", extractedFields: [{ label: "Vehicle Model", value: "Honda Civic 2022", confidence: 0.98 }, { label: "Plate Number", value: "JHR 5678", confidence: 0.97 }], confidenceScore: 0.97, timestamp: Timestamp.fromDate(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)) },
  { applicationId: "TRK-2024-006", documentType: "driving_license", status: "pending", extractedFields: [{ label: "License No", value: "DL345678", confidence: 0.72 }, { label: "Class", value: "B2", confidence: 0.68 }], confidenceScore: 0.70, timestamp: Timestamp.fromDate(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)) },
  { applicationId: "TRK-2024-007", documentType: "passport", status: "verified", extractedFields: [{ label: "Full Name", value: "Muhammad Hafiz", confidence: 0.96 }, { label: "Passport No", value: "B98765432", confidence: 0.94 }], confidenceScore: 0.95, timestamp: Timestamp.fromDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) },
  { applicationId: "TRK-2024-008", documentType: "vehicle_registration", status: "verified", extractedFields: [{ label: "Vehicle Model", value: "Proton X70 2023", confidence: 0.93 }, { label: "Plate Number", value: "PNG 9012", confidence: 0.91 }], confidenceScore: 0.92, timestamp: Timestamp.fromDate(new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)) },
  { applicationId: "TRK-2024-009", documentType: "driving_license", status: "pending", extractedFields: [{ label: "License No", value: "DL567890", confidence: 0.85 }, { label: "Class", value: "D", confidence: 0.82 }], confidenceScore: 0.83, timestamp: Timestamp.fromDate(new Date(Date.now() - 9 * 24 * 60 * 60 * 1000)) },
  { applicationId: "TRK-2024-010", documentType: "passport", status: "verified", extractedFields: [{ label: "Full Name", value: "Nurul Izzah", confidence: 0.97 }, { label: "Passport No", value: "C11223344", confidence: 0.95 }], confidenceScore: 0.96, timestamp: Timestamp.fromDate(new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)) },
];

const sampleAddons = [
  { applicationId: "TRK-2024-001", type: "insurance", vendorName: "AIA Malaysia", cost: 500, status: "confirmed", trackingNumber: null },
  { applicationId: "TRK-2024-002", type: "roadtax", vendorName: "JPJ", cost: 80, status: "pending" },
  { applicationId: "TRK-2024-003", type: "towing", vendorName: "AAM Towing", cost: 150, status: "completed", trackingNumber: "TOW-001" },
  { applicationId: "TRK-2024-004", type: "sim_card", vendorName: "Maxis Mobile", cost: 30, status: "cancelled" },
  { applicationId: "TRK-2024-005", type: "insurance", vendorName: "Allianz Malaysia", cost: 450, status: "completed", trackingNumber: "INS-002" },
  { applicationId: "TRK-2024-006", type: "roadtax", vendorName: "JPJ", cost: 80, status: "pending" },
  { applicationId: "TRK-2024-007", type: "insurance", vendorName: "Prudential", cost: 520, status: "confirmed", trackingNumber: "INS-003" },
  { applicationId: "TRK-2024-008", type: "towing", vendorName: "Fast Tow MY", cost: 180, status: "completed", trackingNumber: "TOW-002" },
  { applicationId: "TRK-2024-009", type: "sim_card", vendorName: "Celcom", cost: 35, status: "pending" },
  { applicationId: "TRK-2024-010", type: "insurance", vendorName: "Great Eastern", cost: 480, status: "completed", trackingNumber: "INS-004" },
];

const sampleLogs = [
  { type: "application", applicationId: "TRK-2024-001", action: "Application submitted", performedBy: "System", timestamp: Timestamp.fromDate(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)), remarks: "New application received" },
  { type: "application", applicationId: "TRK-2024-002", action: "Status updated to verified", performedBy: "admin@mydrive.com", timestamp: Timestamp.fromDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)), remarks: "AI verification passed" },
  { type: "application", applicationId: "TRK-2024-003", action: "Status updated to approved", performedBy: "staff@mydrive.com", timestamp: Timestamp.fromDate(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)), remarks: "Documents approved" },
  { type: "system", eventType: "Login", severity: "info", triggeredBy: "admin@mydrive.com", message: "Admin user logged in successfully", timestamp: Timestamp.fromDate(new Date(Date.now() - 4 * 60 * 60 * 1000)) },
  { type: "system", eventType: "Payment Error", severity: "error", triggeredBy: "System", message: "Payment gateway timeout for TRK-2024-006", timestamp: Timestamp.fromDate(new Date(Date.now() - 6 * 60 * 60 * 1000)) },
  { type: "system", eventType: "AI Verification", severity: "warning", triggeredBy: "AI Engine", message: "Low confidence score detected for TRK-2024-004", timestamp: Timestamp.fromDate(new Date(Date.now() - 8 * 60 * 60 * 1000)) },
  { type: "system", eventType: "Backup", severity: "info", triggeredBy: "System", message: "Daily database backup completed successfully", timestamp: Timestamp.fromDate(new Date(Date.now() - 12 * 60 * 60 * 1000)) },
  { type: "application", applicationId: "TRK-2024-007", action: "Document uploaded", performedBy: "staff@mydrive.com", timestamp: Timestamp.fromDate(new Date(Date.now() - 14 * 60 * 60 * 1000)), remarks: "Passport scan uploaded" },
  { type: "system", eventType: "User Created", severity: "info", triggeredBy: "System", message: "New staff account created", timestamp: Timestamp.fromDate(new Date(Date.now() - 16 * 60 * 60 * 1000)) },
  { type: "application", applicationId: "TRK-2024-010", action: "Application completed", performedBy: "admin@mydrive.com", timestamp: Timestamp.fromDate(new Date(Date.now() - 18 * 60 * 60 * 1000)), remarks: "All documents verified and delivered" },
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
