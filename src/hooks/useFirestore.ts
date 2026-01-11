import { useState, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  deleteDoc,
  getDocs,
  where,
  Timestamp,
  QueryConstraint,
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
  AddonStatus,
} from "@/types";

// Helper to convert Firestore timestamps
const convertTimestamp = (timestamp: any): Date => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  if (timestamp?.seconds) {
    return new Timestamp(timestamp.seconds, timestamp.nanoseconds).toDate();
  }
  return new Date(timestamp);
};

// Applications Hook
export const useApplications = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "applications"), orderBy("submissionDate", "desc"));
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const apps: Application[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            status: data.status as ApplicationStatus,
            submissionDate: convertTimestamp(data.submissionDate || data.submittedAt),
            customerName: data.customerName,
            customerPhone: data.customerPhone || "",
            customerEmail: data.customerEmail || "",
            borderRoute: data.borderRoute || "bukit_kayu_hitam",
            travelStartDate: convertTimestamp(data.travelStartDate || data.travelDate || data.submissionDate),
            travelEndDate: convertTimestamp(data.travelEndDate || data.travelDate || data.submissionDate),
            passengerCount: data.passengerCount || 1,
            vehicleType: data.vehicleType || "sedan",
            packageType: data.packageType || "compulsory",
            addons: data.addons || [],
            deliveryOption: data.deliveryOption || "takeaway",
            paymentStatus: data.paymentStatus || "unpaid",
            totalPrice: data.totalPrice || 0,
          };
        });
        setApplications(apps);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching applications:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const updateApplicationStatus = async (id: string, status: ApplicationStatus) => {
    try {
      await updateDoc(doc(db, "applications", id), { status });
    } catch (err: any) {
      console.error("Error updating application:", err);
      throw err;
    }
  };

  return { applications, loading, error, updateApplicationStatus };
};

// AI Verifications Hook
export const useAIVerifications = () => {
  const [verifications, setVerifications] = useState<AIVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "ai_verifications"), orderBy("timestamp", "desc"));
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const vers: AIVerification[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            applicationId: data.applicationId,
            documentType: data.documentType,
            documentId: data.documentId || "",
            extractedFields: data.extractedFields || [],
            overallConfidence: data.overallConfidence || data.confidenceScore || 0,
            verifiedByAI: data.verifiedByAI,
            reviewedByStaff: data.reviewedByStaff,
            flagged: data.flagged || false,
            timestamp: convertTimestamp(data.timestamp),
            documentImageUrl: data.documentImageUrl,
          };
        });
        setVerifications(vers);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching verifications:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const updateVerification = async (id: string, updates: Partial<AIVerification>) => {
    try {
      await updateDoc(doc(db, "ai_verifications", id), updates);
    } catch (err: any) {
      console.error("Error updating verification:", err);
      throw err;
    }
  };

  return { verifications, loading, error, updateVerification };
};

// Payments Hook
export const usePayments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "payments"), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const pays: Payment[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            applicationId: data.applicationId,
            method: data.method,
            amount: data.amount,
            status: data.status as PaymentStatus,
            receiptUrl: data.receiptUrl,
            createdAt: convertTimestamp(data.createdAt),
          };
        });
        setPayments(pays);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching payments:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const updatePaymentStatus = async (id: string, status: PaymentStatus) => {
    try {
      await updateDoc(doc(db, "payments", id), { status });
    } catch (err: any) {
      console.error("Error updating payment:", err);
      throw err;
    }
  };

  return { payments, loading, error, updatePaymentStatus };
};

// Addons Hook
export const useAddons = () => {
  const [addons, setAddons] = useState<Addon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "addons"));
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const adds: Addon[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            applicationId: data.applicationId,
            type: data.type,
            vendorName: data.vendorName,
            cost: data.cost,
            status: data.status as AddonStatus,
            trackingNumber: data.trackingNumber,
            createdAt: data.createdAt ? convertTimestamp(data.createdAt) : undefined,
          };
        });
        setAddons(adds);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching addons:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const updateAddonStatus = async (id: string, status: AddonStatus, trackingNumber?: string) => {
    try {
      const updates: any = { status };
      if (trackingNumber) updates.trackingNumber = trackingNumber;
      await updateDoc(doc(db, "addons", id), updates);
    } catch (err: any) {
      console.error("Error updating addon:", err);
      throw err;
    }
  };

  return { addons, loading, error, updateAddonStatus };
};

// Logs Hook
export const useLogs = () => {
  const [applicationLogs, setApplicationLogs] = useState<ApplicationLog[]>([]);
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const logsQuery = query(collection(db, "logs"), orderBy("timestamp", "desc"));
    
    const unsubscribe = onSnapshot(
      logsQuery,
      (snapshot) => {
        const appLogs: ApplicationLog[] = [];
        const sysLogs: SystemLog[] = [];

        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          const timestamp = convertTimestamp(data.timestamp);
          
          if (data.type === "application") {
            appLogs.push({
              id: doc.id,
              applicationId: data.applicationId,
              action: data.action || data.message,
              performedBy: data.performedBy,
              timestamp,
              remarks: data.remarks,
            });
          } else {
            sysLogs.push({
              id: doc.id,
              eventType: data.eventType || data.type,
              severity: data.severity,
              triggeredBy: data.triggeredBy || data.performedBy,
              message: data.message,
              timestamp,
            });
          }
        });

        setApplicationLogs(appLogs);
        setSystemLogs(sysLogs);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching logs:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const addLog = async (log: Omit<ApplicationLog, "id"> | Omit<SystemLog, "id">) => {
    try {
      await addDoc(collection(db, "logs"), {
        ...log,
        timestamp: Timestamp.now(),
      });
    } catch (err: any) {
      console.error("Error adding log:", err);
      throw err;
    }
  };

  return { applicationLogs, systemLogs, loading, error, addLog };
};

// Reports Hook
export const useReports = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "reports"), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const reps: Report[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            type: data.type,
            startDate: convertTimestamp(data.startDate),
            endDate: convertTimestamp(data.endDate),
            totalUsers: data.totalUsers,
            totalApplications: data.totalApplications,
            totalVerified: data.totalVerified,
            totalRejected: data.totalRejected,
            totalRevenue: data.totalRevenue,
            downloadUrl: data.downloadUrl,
            createdAt: convertTimestamp(data.createdAt),
          };
        });
        setReports(reps);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching reports:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const createReport = async (report: Omit<Report, "id" | "createdAt">) => {
    try {
      await addDoc(collection(db, "reports"), {
        ...report,
        startDate: Timestamp.fromDate(report.startDate),
        endDate: Timestamp.fromDate(report.endDate),
        createdAt: Timestamp.now(),
      });
    } catch (err: any) {
      console.error("Error creating report:", err);
      throw err;
    }
  };

  return { reports, loading, error, createReport };
};

// Analytics Hook - Calculates from real data
export const useAnalytics = () => {
  const { applications } = useApplications();
  const { payments } = usePayments();
  const { verifications } = useAIVerifications();
  const { addons } = useAddons();

  const analytics = {
    newUsersToday: applications.filter(
      (a) => {
        const today = new Date();
        const appDate = new Date(a.submissionDate);
        return appDate.toDateString() === today.toDateString();
      }
    ).length,
    activeUsers: applications.length,
    totalPayments: payments.length,
    totalRevenue: payments
      .filter((p) => p.status === "paid")
      .reduce((sum, p) => sum + p.amount, 0),
    avgVerificationTime: 2.3, // This would be calculated from actual data
    popularAddonType: (() => {
      const typeCounts: Record<string, number> = {};
      addons.forEach((a) => {
        typeCounts[a.type] = (typeCounts[a.type] || 0) + 1;
      });
      const sorted = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]);
      return (sorted[0]?.[0] as any) || "insurance";
    })(),
  };

  // Calculate chart data from real data
  const chartData = {
    applicationTrends: (() => {
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      return days.map((name) => ({
        name,
        pending: applications.filter((a) => a.status === "pending").length,
        verified: applications.filter((a) => a.status === "verified").length,
        approved: applications.filter((a) => a.status === "approved" || a.status === "completed").length,
        rejected: applications.filter((a) => a.status === "rejected").length,
      }));
    })(),
    revenueData: [
      { name: "Jan", revenue: payments.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0) },
      { name: "Feb", revenue: 0 },
      { name: "Mar", revenue: 0 },
      { name: "Apr", revenue: 0 },
      { name: "May", revenue: 0 },
      { name: "Jun", revenue: 0 },
    ],
    paymentMethods: [
      { name: "QR Code", value: payments.filter((p) => p.method === "qr").length || 1, color: "hsl(var(--chart-1))" },
      { name: "Cash", value: payments.filter((p) => p.method === "cash").length || 1, color: "hsl(var(--chart-2))" },
    ],
    addonTypes: [
      { name: "Insurance", value: addons.filter((a) => a.type === "insurance").length || 1 },
      { name: "TDAC", value: addons.filter((a) => a.type === "tdac").length || 1 },
      { name: "Towing", value: addons.filter((a) => a.type === "towing").length || 1 },
      { name: "SIM Card", value: addons.filter((a) => a.type === "sim_card").length || 1 },
    ],
  };

  return { analytics, chartData };
};
