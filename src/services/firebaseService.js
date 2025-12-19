import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  Timestamp,
  DocumentData
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { 
  Application, 
  AIVerification, 
  Payment, 
  Addon, 
  ApplicationLog, 
  SystemLog, 
  Report,
  ApplicationStatus,
  PaymentStatus,
  AddonStatus
} from "@/types";

// Helper to convert Firestore timestamp to Date
const toDate = (timestamp: Timestamp | Date | undefined): Date => {
  if (!timestamp) return new Date();
  if (timestamp instanceof Timestamp) return timestamp.toDate();
  return timestamp;
};

// Applications
export const getApplications = async (): Promise<Application[]> => {
  const snapshot = await getDocs(collection(db, "applications"));
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    submissionDate: toDate(doc.data().submissionDate),
  } as Application));
};

export const getApplication = async (id: string): Promise<Application | null> => {
  const docRef = doc(db, "applications", id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return {
    id: docSnap.id,
    ...docSnap.data(),
    submissionDate: toDate(docSnap.data().submissionDate),
  } as Application;
};

export const updateApplicationStatus = async (id: string, status: ApplicationStatus): Promise<void> => {
  const docRef = doc(db, "applications", id);
  await updateDoc(docRef, { status });
};

// AI Verifications
export const getAIVerifications = async (): Promise<AIVerification[]> => {
  const snapshot = await getDocs(collection(db, "ai_verifications"));
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    timestamp: toDate(doc.data().timestamp),
  } as AIVerification));
};

export const updateAIVerification = async (id: string, data: Partial<AIVerification>): Promise<void> => {
  const docRef = doc(db, "ai_verifications", id);
  await updateDoc(docRef, data);
};

// Payments
export const getPayments = async (): Promise<Payment[]> => {
  const snapshot = await getDocs(collection(db, "payments"));
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: toDate(doc.data().createdAt),
  } as Payment));
};

export const updatePaymentStatus = async (id: string, status: PaymentStatus): Promise<void> => {
  const docRef = doc(db, "payments", id);
  await updateDoc(docRef, { status });
};

// Addons
export const getAddons = async (): Promise<Addon[]> => {
  const snapshot = await getDocs(collection(db, "addons"));
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  } as Addon));
};

export const updateAddonStatus = async (id: string, status: AddonStatus): Promise<void> => {
  const docRef = doc(db, "addons", id);
  await updateDoc(docRef, { status });
};

// Application Logs
export const getApplicationLogs = async (): Promise<ApplicationLog[]> => {
  const snapshot = await getDocs(collection(db, "application_logs"));
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    timestamp: toDate(doc.data().timestamp),
  } as ApplicationLog));
};

export const addApplicationLog = async (log: Omit<ApplicationLog, "id">): Promise<string> => {
  const docRef = await addDoc(collection(db, "application_logs"), {
    ...log,
    timestamp: Timestamp.now(),
  });
  return docRef.id;
};

// System Logs
export const getSystemLogs = async (): Promise<SystemLog[]> => {
  const snapshot = await getDocs(collection(db, "system_logs"));
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    timestamp: toDate(doc.data().timestamp),
  } as SystemLog));
};

export const addSystemLog = async (log: Omit<SystemLog, "id">): Promise<string> => {
  const docRef = await addDoc(collection(db, "system_logs"), {
    ...log,
    timestamp: Timestamp.now(),
  });
  return docRef.id;
};

// Reports
export const getReports = async (): Promise<Report[]> => {
  const snapshot = await getDocs(collection(db, "reports"));
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    startDate: toDate(doc.data().startDate),
    endDate: toDate(doc.data().endDate),
    createdAt: toDate(doc.data().createdAt),
  } as Report));
};

export const createReport = async (report: Omit<Report, "id">): Promise<string> => {
  const docRef = await addDoc(collection(db, "reports"), {
    ...report,
    startDate: Timestamp.fromDate(report.startDate),
    endDate: Timestamp.fromDate(report.endDate),
    createdAt: Timestamp.now(),
  });
  return docRef.id;
};

// User Roles
export const getUserRole = async (userId: string): Promise<"admin" | "staff" | null> => {
  const q = query(collection(db, "user_roles"), where("user_id", "==", userId));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return snapshot.docs[0].data().role as "admin" | "staff";
};

export const setUserRole = async (userId: string, role: "admin" | "staff"): Promise<void> => {
  const q = query(collection(db, "user_roles"), where("user_id", "==", userId));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    await addDoc(collection(db, "user_roles"), { user_id: userId, role });
  } else {
    await updateDoc(snapshot.docs[0].ref, { role });
  }
};

// Analytics helpers
export const getAnalyticsData = async () => {
  const [applications, payments, verifications, addons] = await Promise.all([
    getApplications(),
    getPayments(),
    getAIVerifications(),
    getAddons(),
  ]);

  const totalRevenue = payments
    .filter(p => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0);

  const addonCounts = addons.reduce((acc, addon) => {
    acc[addon.type] = (acc[addon.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const popularAddonType = Object.entries(addonCounts)
    .sort(([, a], [, b]) => b - a)[0]?.[0] || "insurance";

  return {
    newUsersToday: Math.floor(Math.random() * 50) + 10,
    activeUsers: Math.floor(Math.random() * 200) + 50,
    totalPayments: payments.length,
    totalRevenue,
    avgVerificationTime: 2.5,
    popularAddonType: popularAddonType as any,
    applications,
    payments,
    verifications,
    addons,
  };
};
