import {
  Application,
  AIVerification,
  Payment,
  Addon,
  ApplicationLog,
  SystemLog,
  Analytics,
  Report,
} from "@/types";

export const mockApplications: Application[] = [
  { id: "APP-001", trackingId: "TRK-2024-001", status: "pending", submissionDate: new Date("2024-01-15"), deliveryOption: "postal", customerName: "Ahmad Razak", customerEmail: "ahmad@email.com", documentType: "Drivers License" },
  { id: "APP-002", trackingId: "TRK-2024-002", status: "verified", submissionDate: new Date("2024-01-14"), deliveryOption: "counter", customerName: "Siti Aminah", customerEmail: "siti@email.com", documentType: "Vehicle Registration" },
  { id: "APP-003", trackingId: "TRK-2024-003", status: "approved", submissionDate: new Date("2024-01-13"), deliveryOption: "postal", deliveryTrackingId: "MY1234567890", customerName: "Raj Kumar", customerEmail: "raj@email.com", documentType: "Insurance Policy" },
  { id: "APP-004", trackingId: "TRK-2024-004", status: "rejected", submissionDate: new Date("2024-01-12"), deliveryOption: "counter", customerName: "Lim Wei Ming", customerEmail: "weiming@email.com", documentType: "Drivers License" },
  { id: "APP-005", trackingId: "TRK-2024-005", status: "completed", submissionDate: new Date("2024-01-11"), deliveryOption: "postal", deliveryTrackingId: "MY0987654321", customerName: "Nurul Huda", customerEmail: "nurul@email.com", documentType: "Vehicle Registration" },
  { id: "APP-006", trackingId: "TRK-2024-006", status: "pending", submissionDate: new Date("2024-01-16"), deliveryOption: "counter", customerName: "Tan Ah Kow", customerEmail: "ahkow@email.com", documentType: "Insurance Policy" },
  { id: "APP-007", trackingId: "TRK-2024-007", status: "verified", submissionDate: new Date("2024-01-16"), deliveryOption: "postal", customerName: "Fatimah Zahra", customerEmail: "fatimah@email.com", documentType: "Drivers License" },
  { id: "APP-008", trackingId: "TRK-2024-008", status: "pending", submissionDate: new Date("2024-01-17"), deliveryOption: "counter", customerName: "Muthu Samy", customerEmail: "muthu@email.com", documentType: "Vehicle Registration" },
  { id: "APP-009", trackingId: "TRK-2024-009", status: "approved", submissionDate: new Date("2024-01-18"), deliveryOption: "postal", deliveryTrackingId: "MY5678901234", customerName: "Wong Mei Ling", customerEmail: "meiling@email.com", documentType: "Drivers License" },
  { id: "APP-010", trackingId: "TRK-2024-010", status: "verified", submissionDate: new Date("2024-01-18"), deliveryOption: "counter", customerName: "Zainab Ibrahim", customerEmail: "zainab@email.com", documentType: "Insurance Policy" },
];

export const mockAIVerifications: AIVerification[] = [
  { id: "VER-001", applicationId: "APP-001", documentType: "drivers_license", documentId: "123456", extractedFields: [{ label: "Name", value: "Ahmad Razak", confidence: 0.96 }, { label: "Date of Birth", value: "15 Mar 1985", confidence: 0.94 }, { label: "License Number", value: "D123456", confidence: 0.99 }, { label: "Expiry Date", value: "17 Dec 2029", confidence: 0.92 }], overallConfidence: 0.95, verifiedByAI: true, reviewedByStaff: false, flagged: false, timestamp: new Date("2024-01-15T10:30:00") },
  { id: "VER-002", applicationId: "APP-002", documentType: "vehicle_registration", documentId: "VR789012", extractedFields: [{ label: "Plate Number", value: "WKL 1234", confidence: 0.98 }, { label: "Make", value: "Toyota", confidence: 0.95 }, { label: "Model", value: "Camry", confidence: 0.93 }, { label: "Year", value: "2022", confidence: 0.97 }], overallConfidence: 0.88, verifiedByAI: true, reviewedByStaff: true, flagged: false, timestamp: new Date("2024-01-14T14:20:00") },
  { id: "VER-003", applicationId: "APP-003", documentType: "passport", documentId: "A12345678", extractedFields: [{ label: "Name", value: "Raj Kumar", confidence: 0.72 }, { label: "Date of Birth", value: "22 Jul 1990", confidence: 0.68 }, { label: "Passport No", value: "A12345678", confidence: 0.85 }, { label: "Expiry Date", value: "15 Sep 2028", confidence: 0.70 }], overallConfidence: 0.72, verifiedByAI: false, reviewedByStaff: true, flagged: true, timestamp: new Date("2024-01-13T09:15:00") },
  { id: "VER-004", applicationId: "APP-004", documentType: "drivers_license", documentId: "456789", extractedFields: [{ label: "Name", value: "Lim Wei Ming", confidence: 0.45 }, { label: "Date of Birth", value: "03 Nov 1978", confidence: 0.42 }, { label: "License Number", value: "D456789", confidence: 0.55 }, { label: "Expiry Date", value: "20 Jun 2025", confidence: 0.40 }], overallConfidence: 0.45, verifiedByAI: false, reviewedByStaff: true, flagged: true, timestamp: new Date("2024-01-12T16:45:00") },
  { id: "VER-005", applicationId: "APP-006", documentType: "vehicle_registration", documentId: "VR345678", extractedFields: [{ label: "Plate Number", value: "JHR 5678", confidence: 0.97 }, { label: "Make", value: "Honda", confidence: 0.94 }, { label: "Model", value: "Civic", confidence: 0.92 }, { label: "Year", value: "2023", confidence: 0.96 }], overallConfidence: 0.91, verifiedByAI: true, reviewedByStaff: false, flagged: false, timestamp: new Date("2024-01-16T11:00:00") },
  { id: "VER-006", applicationId: "APP-007", documentType: "drivers_license", documentId: "789012", extractedFields: [{ label: "Name", value: "Fatimah Zahra", confidence: 0.98 }, { label: "Date of Birth", value: "08 Jan 1992", confidence: 0.96 }, { label: "License Number", value: "D789012", confidence: 0.99 }, { label: "Expiry Date", value: "25 Mar 2030", confidence: 0.95 }], overallConfidence: 0.97, verifiedByAI: true, reviewedByStaff: false, flagged: false, timestamp: new Date("2024-01-17T08:30:00") },
  { id: "VER-007", applicationId: "APP-008", documentType: "vehicle_registration", documentId: "VR901234", extractedFields: [{ label: "Plate Number", value: "PEN 9012", confidence: 0.89 }, { label: "Make", value: "Proton", confidence: 0.92 }, { label: "Model", value: "Saga", confidence: 0.88 }, { label: "Year", value: "2021", confidence: 0.91 }], overallConfidence: 0.90, verifiedByAI: true, reviewedByStaff: false, flagged: false, timestamp: new Date("2024-01-17T10:15:00") },
  { id: "VER-008", applicationId: "APP-009", documentType: "drivers_license", documentId: "234567", extractedFields: [{ label: "Name", value: "Wong Mei Ling", confidence: 0.94 }, { label: "Date of Birth", value: "12 May 1988", confidence: 0.91 }, { label: "License Number", value: "D234567", confidence: 0.97 }, { label: "Expiry Date", value: "30 Nov 2028", confidence: 0.93 }], overallConfidence: 0.94, verifiedByAI: true, reviewedByStaff: true, flagged: false, timestamp: new Date("2024-01-18T09:00:00") },
  { id: "VER-009", applicationId: "APP-010", documentType: "passport", documentId: "B87654321", extractedFields: [{ label: "Name", value: "Zainab Ibrahim", confidence: 0.82 }, { label: "Date of Birth", value: "20 Aug 1995", confidence: 0.78 }, { label: "Passport No", value: "B87654321", confidence: 0.88 }, { label: "Expiry Date", value: "10 Feb 2029", confidence: 0.80 }], overallConfidence: 0.82, verifiedByAI: true, reviewedByStaff: false, flagged: false, timestamp: new Date("2024-01-18T11:30:00") },
  { id: "VER-010", applicationId: "APP-005", documentType: "vehicle_registration", documentId: "VR567890", extractedFields: [{ label: "Plate Number", value: "KUL 3456", confidence: 0.65 }, { label: "Make", value: "Perodua", confidence: 0.72 }, { label: "Model", value: "Myvi", confidence: 0.68 }, { label: "Year", value: "2020", confidence: 0.70 }], overallConfidence: 0.68, verifiedByAI: false, reviewedByStaff: false, flagged: true, timestamp: new Date("2024-01-18T14:00:00") },
];

export const mockPayments: Payment[] = [
  { id: "PAY-001", applicationId: "APP-001", method: "qr", amount: 1500, status: "paid", receiptUrl: "/receipts/pay-001.pdf", createdAt: new Date("2024-01-15T10:45:00") },
  { id: "PAY-002", applicationId: "APP-002", method: "qr", amount: 2200, status: "paid", receiptUrl: "/receipts/pay-002.pdf", createdAt: new Date("2024-01-14T14:30:00") },
  { id: "PAY-003", applicationId: "APP-003", method: "cash", amount: 3500, status: "paid", receiptUrl: "/receipts/pay-003.pdf", createdAt: new Date("2024-01-13T09:30:00") },
  { id: "PAY-004", applicationId: "APP-004", method: "cash", amount: 1500, status: "pending", createdAt: new Date("2024-01-12T17:00:00") },
  { id: "PAY-005", applicationId: "APP-005", method: "qr", amount: 2800, status: "paid", receiptUrl: "/receipts/pay-005.pdf", createdAt: new Date("2024-01-11T13:20:00") },
  { id: "PAY-006", applicationId: "APP-006", method: "qr", amount: 1800, status: "failed", createdAt: new Date("2024-01-16T11:15:00") },
  { id: "PAY-007", applicationId: "APP-007", method: "cash", amount: 2100, status: "pending", createdAt: new Date("2024-01-16T15:00:00") },
  { id: "PAY-008", applicationId: "APP-008", method: "qr", amount: 1950, status: "paid", receiptUrl: "/receipts/pay-008.pdf", createdAt: new Date("2024-01-17T09:00:00") },
  { id: "PAY-009", applicationId: "APP-009", method: "cash", amount: 2450, status: "paid", receiptUrl: "/receipts/pay-009.pdf", createdAt: new Date("2024-01-18T10:30:00") },
  { id: "PAY-010", applicationId: "APP-010", method: "qr", amount: 1750, status: "pending", createdAt: new Date("2024-01-18T12:00:00") },
];

export const mockAddons: Addon[] = [
  { id: "ADD-001", applicationId: "APP-001", type: "insurance", vendorName: "AXA Malaysia", cost: 500, status: "confirmed", trackingNumber: "INS-001" },
  { id: "ADD-002", applicationId: "APP-002", type: "towing", vendorName: "KL Tow Service", cost: 300, status: "pending" },
  { id: "ADD-003", applicationId: "APP-003", type: "tdac", vendorName: "JPJ Official", cost: 750, status: "completed", trackingNumber: "TDAC-003" },
  { id: "ADD-004", applicationId: "APP-005", type: "sim_card", vendorName: "Maxis Mobile", cost: 199, status: "completed", trackingNumber: "SIM-004" },
  { id: "ADD-005", applicationId: "APP-006", type: "insurance", vendorName: "AIA Malaysia", cost: 650, status: "pending" },
  { id: "ADD-006", applicationId: "APP-007", type: "towing", vendorName: "Penang Tow", cost: 350, status: "confirmed", trackingNumber: "TOW-006" },
  { id: "ADD-007", applicationId: "APP-008", type: "tdac", vendorName: "JPJ Official", cost: 750, status: "pending" },
  { id: "ADD-008", applicationId: "APP-009", type: "sim_card", vendorName: "Celcom", cost: 179, status: "completed", trackingNumber: "SIM-008" },
  { id: "ADD-009", applicationId: "APP-010", type: "insurance", vendorName: "Prudential", cost: 580, status: "confirmed", trackingNumber: "INS-009" },
  { id: "ADD-010", applicationId: "APP-004", type: "towing", vendorName: "JB Tow Service", cost: 320, status: "cancelled" },
];

export const mockApplicationLogs: ApplicationLog[] = [
  {
    id: "LOG-001",
    applicationId: "APP-001",
    action: "Application submitted",
    performedBy: "System",
    timestamp: new Date("2024-01-15T10:00:00"),
  },
  {
    id: "LOG-002",
    applicationId: "APP-001",
    action: "AI verification started",
    performedBy: "System",
    timestamp: new Date("2024-01-15T10:05:00"),
  },
  {
    id: "LOG-003",
    applicationId: "APP-002",
    action: "Staff review completed",
    performedBy: "Staff User",
    timestamp: new Date("2024-01-14T14:25:00"),
    remarks: "All documents verified",
  },
  {
    id: "LOG-004",
    applicationId: "APP-004",
    action: "Application rejected",
    performedBy: "Admin User",
    timestamp: new Date("2024-01-12T17:00:00"),
    remarks: "Document quality too low",
  },
];

export const mockSystemLogs: SystemLog[] = [
  {
    id: "SLOG-001",
    eventType: "Authentication",
    severity: "info",
    triggeredBy: "admin@thaidrivesecure.com",
    message: "Admin user logged in successfully",
    timestamp: new Date("2024-01-17T08:00:00"),
  },
  {
    id: "SLOG-002",
    eventType: "AI Service",
    severity: "warning",
    triggeredBy: "System",
    message: "AI verification queue exceeds 100 items",
    timestamp: new Date("2024-01-17T09:30:00"),
  },
  {
    id: "SLOG-003",
    eventType: "Payment Gateway",
    severity: "error",
    triggeredBy: "PAY-006",
    message: "Payment processing failed: Card declined",
    timestamp: new Date("2024-01-16T11:15:00"),
  },
  {
    id: "SLOG-004",
    eventType: "Database",
    severity: "info",
    triggeredBy: "System",
    message: "Daily backup completed successfully",
    timestamp: new Date("2024-01-17T03:00:00"),
  },
];

export const mockAnalytics: Analytics = {
  newUsersToday: 42,
  activeUsers: 187,
  totalPayments: 156,
  totalRevenue: 458750,
  avgVerificationTime: 2.3,
  popularAddonType: "insurance",
};

export const mockReports: Report[] = [
  { id: "RPT-001", type: "daily", startDate: new Date("2024-01-17"), endDate: new Date("2024-01-17"), totalUsers: 42, totalApplications: 28, totalVerified: 22, totalRejected: 3, totalRevenue: 42500, downloadUrl: "/reports/daily-2024-01-17.pdf", createdAt: new Date("2024-01-17T23:59:00") },
  { id: "RPT-002", type: "weekly", startDate: new Date("2024-01-08"), endDate: new Date("2024-01-14"), totalUsers: 285, totalApplications: 198, totalVerified: 172, totalRejected: 18, totalRevenue: 315000, downloadUrl: "/reports/weekly-2024-w02.pdf", createdAt: new Date("2024-01-14T23:59:00") },
  { id: "RPT-003", type: "monthly", startDate: new Date("2024-01-01"), endDate: new Date("2024-01-31"), totalUsers: 1250, totalApplications: 856, totalVerified: 742, totalRejected: 68, totalRevenue: 1250000, downloadUrl: "/reports/monthly-2024-01.pdf", createdAt: new Date("2024-01-31T23:59:00") },
  { id: "RPT-004", type: "daily", startDate: new Date("2024-01-18"), endDate: new Date("2024-01-18"), totalUsers: 38, totalApplications: 25, totalVerified: 20, totalRejected: 2, totalRevenue: 38000, downloadUrl: "/reports/daily-2024-01-18.pdf", createdAt: new Date("2024-01-18T23:59:00") },
  { id: "RPT-005", type: "weekly", startDate: new Date("2024-01-15"), endDate: new Date("2024-01-21"), totalUsers: 312, totalApplications: 215, totalVerified: 188, totalRejected: 15, totalRevenue: 345000, downloadUrl: "/reports/weekly-2024-w03.pdf", createdAt: new Date("2024-01-21T23:59:00") },
  { id: "RPT-006", type: "daily", startDate: new Date("2024-01-19"), endDate: new Date("2024-01-19"), totalUsers: 45, totalApplications: 32, totalVerified: 28, totalRejected: 2, totalRevenue: 48000, downloadUrl: "/reports/daily-2024-01-19.pdf", createdAt: new Date("2024-01-19T23:59:00") },
  { id: "RPT-007", type: "custom", startDate: new Date("2024-01-10"), endDate: new Date("2024-01-20"), totalUsers: 520, totalApplications: 380, totalVerified: 335, totalRejected: 28, totalRevenue: 580000, downloadUrl: "/reports/custom-2024-01-10-20.pdf", createdAt: new Date("2024-01-20T23:59:00") },
  { id: "RPT-008", type: "daily", startDate: new Date("2024-01-20"), endDate: new Date("2024-01-20"), totalUsers: 52, totalApplications: 35, totalVerified: 30, totalRejected: 3, totalRevenue: 52000, downloadUrl: "/reports/daily-2024-01-20.pdf", createdAt: new Date("2024-01-20T23:59:00") },
  { id: "RPT-009", type: "weekly", startDate: new Date("2024-01-22"), endDate: new Date("2024-01-28"), totalUsers: 295, totalApplications: 205, totalVerified: 178, totalRejected: 16, totalRevenue: 325000, downloadUrl: "/reports/weekly-2024-w04.pdf", createdAt: new Date("2024-01-28T23:59:00") },
  { id: "RPT-010", type: "monthly", startDate: new Date("2024-02-01"), endDate: new Date("2024-02-29"), totalUsers: 1380, totalApplications: 925, totalVerified: 812, totalRejected: 72, totalRevenue: 1420000, downloadUrl: "/reports/monthly-2024-02.pdf", createdAt: new Date("2024-02-29T23:59:00") },
];

export const chartData = {
  applicationTrends: [
    { name: "Mon", pending: 12, verified: 8, approved: 15, rejected: 2 },
    { name: "Tue", pending: 18, verified: 12, approved: 20, rejected: 3 },
    { name: "Wed", pending: 15, verified: 10, approved: 18, rejected: 1 },
    { name: "Thu", pending: 22, verified: 15, approved: 25, rejected: 4 },
    { name: "Fri", pending: 28, verified: 20, approved: 30, rejected: 2 },
    { name: "Sat", pending: 8, verified: 5, approved: 10, rejected: 1 },
    { name: "Sun", pending: 5, verified: 3, approved: 6, rejected: 0 },
  ],
  revenueData: [
    { name: "Jan", revenue: 125000 },
    { name: "Feb", revenue: 148000 },
    { name: "Mar", revenue: 162000 },
    { name: "Apr", revenue: 155000 },
    { name: "May", revenue: 178000 },
    { name: "Jun", revenue: 195000 },
  ],
  paymentMethods: [
    { name: "QR Code", value: 60, color: "hsl(var(--chart-1))" },
    { name: "Cash", value: 40, color: "hsl(var(--chart-2))" },
  ],
  addonTypes: [
    { name: "Insurance", value: 40 },
    { name: "TDAC", value: 25 },
    { name: "Towing", value: 20 },
    { name: "SIM Card", value: 15 },
  ],
};
