import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
  Timestamp,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

// Helper to convert Firestore timestamp to Date
const toDate = (timestamp) => {
  if (!timestamp) return new Date();
  if (timestamp.toDate) return timestamp.toDate();
  return timestamp;
};

// Applications
export const getApplications = async () => {
  const snapshot = await getDocs(collection(db, "applications"));
  return snapshot.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      ...data,
      submissionDate: toDate(data.submissionDate),
    };
  });
};

export const getApplication = async (id) => {
  const docRef = doc(db, "applications", id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;

  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    submissionDate: toDate(data.submissionDate),
  };
};

export const updateApplicationStatus = async (id, status) => {
  const docRef = doc(db, "applications", id);
  await updateDoc(docRef, { status });
};

// AI Verifications
export const getAIVerifications = async () => {
  const snapshot = await getDocs(collection(db, "ai_verifications"));
  return snapshot.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      ...data,
      timestamp: toDate(data.timestamp),
    };
  });
};

export const updateAIVerification = async (id, data) => {
  const docRef = doc(db, "ai_verifications", id);
  await updateDoc(docRef, data);
};

// Payments
export const getPayments = async () => {
  const snapshot = await getDocs(collection(db, "payments"));
  return snapshot.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      ...data,
      createdAt: toDate(data.createdAt),
    };
  });
};

export const updatePaymentStatus = async (id, status) => {
  const docRef = doc(db, "payments", id);
  await updateDoc(docRef, { status });
};

// Addons
export const getAddons = async () => {
  const snapshot = await getDocs(collection(db, "addons"));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const updateAddonStatus = async (id, status) => {
  const docRef = doc(db, "addons", id);
  await updateDoc(docRef, { status });
};

// Application Logs
export const getApplicationLogs = async () => {
  const snapshot = await getDocs(collection(db, "application_logs"));
  return snapshot.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      ...data,
      timestamp: toDate(data.timestamp),
    };
  });
};

export const addApplicationLog = async (log) => {
  const docRef = await addDoc(collection(db, "application_logs"), {
    ...log,
    timestamp: Timestamp.now(),
  });
  return docRef.id;
};

// System Logs
export const getSystemLogs = async () => {
  const snapshot = await getDocs(collection(db, "system_logs"));
  return snapshot.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      ...data,
      timestamp: toDate(data.timestamp),
    };
  });
};

export const addSystemLog = async (log) => {
  const docRef = await addDoc(collection(db, "system_logs"), {
    ...log,
    timestamp: Timestamp.now(),
  });
  return docRef.id;
};

// Reports
export const getReports = async () => {
  const snapshot = await getDocs(collection(db, "reports"));
  return snapshot.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      ...data,
      startDate: toDate(data.startDate),
      endDate: toDate(data.endDate),
      createdAt: toDate(data.createdAt),
    };
  });
};

export const createReport = async (report) => {
  const docRef = await addDoc(collection(db, "reports"), {
    ...report,
    startDate: Timestamp.fromDate(report.startDate),
    endDate: Timestamp.fromDate(report.endDate),
    createdAt: Timestamp.now(),
  });
  return docRef.id;
};

// User Roles
export const getUserRole = async (userId) => {
  const q = query(collection(db, "user_roles"), where("user_id", "==", userId));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return snapshot.docs[0].data().role;
};

export const setUserRole = async (userId, role) => {
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
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const addonCounts = addons.reduce((acc, addon) => {
    acc[addon.type] = (acc[addon.type] || 0) + 1;
    return acc;
  }, {});

  const popularAddonType =
    Object.entries(addonCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ||
    "insurance";

  return {
    newUsersToday: Math.floor(Math.random() * 50) + 10,
    activeUsers: Math.floor(Math.random() * 200) + 50,
    totalPayments: payments.length,
    totalRevenue,
    avgVerificationTime: 2.5,
    popularAddonType,
    applications,
    payments,
    verifications,
    addons,
  };
};
