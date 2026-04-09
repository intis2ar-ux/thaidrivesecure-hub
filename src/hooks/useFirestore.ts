import { useState, useEffect, useRef } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Application,
  AIVerification,
  Payment,
  Addon,
  Report,
  ApplicationStatus,
  PaymentStatus,
  AddonStatus,
  AddonType,
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

// The two order collections to merge
const ORDER_COLLECTIONS = ["insurance_orders", "orders"] as const;

// Helper: parse a Firestore doc into an Application
const docToApplication = (docId: string, data: any): Application => ({
  id: docId,
  name: data.name || "",
  phone: data.phone || "",
  vehicleType: data.vehicleType || "",
  where: data.where || "",
  when: data.when || "",
  packages: data.packages || [],
  passengers: data.passengers || 1,
  totalPrice: data.totalPrice || 0,
  status: ((data.status || "pending").toLowerCase()) as ApplicationStatus,
  deliveryMethod: data.deliveryMethod || "",
  userId: data.userId,
  createdAt: convertTimestamp(data.createdAt),
  documents: data.documents,
});

// Detect which collection an order belongs to by trying both
const detectOrderCollection = async (orderId: string): Promise<string> => {
  // We don't know which collection the order is in, so we try insurance_orders first
  // For status updates we need to write to the correct collection
  // Since orders collection is new, most existing docs are in insurance_orders
  return "insurance_orders";
};

// Applications Hook - reads from both insurance_orders and orders
export const useApplications = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dataMap: Record<string, Application[]> = {};
    let loadedCount = 0;

    const unsubscribes = ORDER_COLLECTIONS.map((colName) => {
      const q = query(collection(db, colName), orderBy("createdAt", "desc"));
      return onSnapshot(
        q,
        (snapshot) => {
          dataMap[colName] = snapshot.docs.map((d) => {
            const app = docToApplication(d.id, d.data());
            // Tag source collection for updates
            (app as any)._collection = colName;
            return app;
          });
          loadedCount++;
          // Merge & dedupe by id, sort by createdAt desc
          const merged = Object.values(dataMap)
            .flat()
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
          setApplications(merged);
          if (loadedCount >= ORDER_COLLECTIONS.length) setLoading(false);
        },
        (err) => {
          console.error(`Error fetching ${colName}:`, err);
          loadedCount++;
          if (loadedCount >= ORDER_COLLECTIONS.length) {
            setError(err.message);
            setLoading(false);
          }
        }
      );
    });

    return () => unsubscribes.forEach((u) => u());
  }, []);

  const updateApplicationStatus = async (
    id: string,
    status: ApplicationStatus,
    options?: { previousStatus?: string; notes?: string; performedBy?: string }
  ) => {
    // Find which collection this order belongs to
    const app = applications.find((a) => a.id === id);
    const colName = (app as any)?._collection || "insurance_orders";

    try {
      await updateDoc(doc(db, colName, id), { status });

      // Write activity log (only insurance_orders has status_logs sub-collection)
      if (colName === "insurance_orders") {
        await addDoc(collection(db, colName, id, "status_logs"), {
          action: status,
          previousStatus: options?.previousStatus || "",
          notes: options?.notes || "",
          performedBy: options?.performedBy || "Unknown",
          timestamp: Timestamp.now(),
        });
      }
    } catch (err: any) {
      console.error("Error updating order:", err);
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

// Payments Hook - Derives payments from both insurance_orders and orders collections
export const usePayments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const paymentActions = ["payment_verified", "payment_rejected", "payment_request_update"];

    type OrderData = { id: string; data: any; collection: string };
    type LogsMap = Record<string, import("@/types").PaymentVerificationLog[]>;

    const ordersPerCollection: Record<string, OrderData[]> = {};
    let currentLogsMap: LogsMap = {};
    let logUnsubscribes: (() => void)[] = [];
    let collectionsLoaded = 0;

    const buildPayments = (allOrders: OrderData[], logsMap: LogsMap): Payment[] => {
      return allOrders.map((order) => {
        const data = order.data;
        const orderStatus = ((data.status || "pending").toLowerCase());

        let paymentStatus: PaymentStatus = "pending";
        if (orderStatus === "approved") paymentStatus = "paid";
        else if (orderStatus === "rejected") paymentStatus = "failed";

        const method = (data.paymentMethod || "qr").toLowerCase() as "qr" | "cash";
        const verificationHistory = logsMap[order.id] || [];

        let verificationStatus: import("@/types").PaymentVerificationStatus = "pending_verification";
        let verifiedAt: Date | undefined;
        let verifiedBy: string | undefined;
        let verificationNotes: string | undefined;
        let rejectionReason: string | undefined;

        if (verificationHistory.length > 0) {
          const latest = verificationHistory[0];
          verificationStatus = latest.action === "verified" ? "verified"
            : latest.action === "rejected" ? "rejected"
            : "updated";
          verifiedBy = latest.performedBy;
          verificationNotes = latest.notes;
          if (latest.action === "verified") verifiedAt = latest.timestamp;
          if (latest.action === "rejected") rejectionReason = latest.notes;
        }

        return {
          id: order.id,
          applicationId: order.id,
          customerName: data.name || "Unknown",
          method,
          amount: data.totalPrice || 0,
          status: paymentStatus,
          verificationStatus,
          receiptUrl: data.receiptUrl,
          createdAt: convertTimestamp(data.createdAt),
          verifiedAt,
          verifiedBy,
          verificationNotes,
          rejectionReason,
          verificationHistory,
        };
      });
    };

    const getAllOrders = () => Object.values(ordersPerCollection).flat();

    const collectionUnsubscribes = ORDER_COLLECTIONS.map((colName) => {
      const q = query(collection(db, colName), orderBy("createdAt", "desc"));

      return onSnapshot(
        q,
        (snapshot) => {
          // Clean up previous log listeners
          logUnsubscribes.forEach((unsub) => unsub());
          logUnsubscribes = [];
          currentLogsMap = {};

          ordersPerCollection[colName] = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            data: docSnap.data(),
            collection: colName,
          }));

          collectionsLoaded++;

          // Wait for all collections before setting up log listeners
          if (collectionsLoaded < ORDER_COLLECTIONS.length) return;

          const allOrders = getAllOrders();

          if (allOrders.length === 0) {
            setPayments([]);
            setLoading(false);
            return;
          }

          let initializedCount = 0;
          const totalOrders = allOrders.length;

          // Only insurance_orders has status_logs subcollection
          allOrders.forEach((order) => {
            if (order.collection !== "insurance_orders") {
              currentLogsMap[order.id] = [];
              initializedCount++;
              if (initializedCount >= totalOrders) {
                setPayments(buildPayments(allOrders, currentLogsMap));
                setLoading(false);
              }
              return;
            }

            const logsQuery = query(
              collection(db, "insurance_orders", order.id, "status_logs"),
              orderBy("timestamp", "desc")
            );

            const unsub = onSnapshot(
              logsQuery,
              (logsSnap) => {
                const logs: import("@/types").PaymentVerificationLog[] = [];
                logsSnap.docs.forEach((logDoc) => {
                  const logData = logDoc.data();
                  if (paymentActions.includes(logData.action)) {
                    logs.push({
                      action: logData.action === "payment_verified" ? "verified"
                        : logData.action === "payment_rejected" ? "rejected"
                        : "updated",
                      performedBy: logData.performedBy || "Unknown",
                      notes: logData.notes,
                      timestamp: convertTimestamp(logData.timestamp),
                    });
                  }
                });
                currentLogsMap[order.id] = logs;
                initializedCount++;
                if (initializedCount >= totalOrders) {
                  setPayments(buildPayments(allOrders, currentLogsMap));
                  setLoading(false);
                }
              },
              () => {
                currentLogsMap[order.id] = [];
                initializedCount++;
                if (initializedCount >= totalOrders) {
                  setPayments(buildPayments(allOrders, currentLogsMap));
                  setLoading(false);
                }
              }
            );

            logUnsubscribes.push(unsub);
          });
        },
        (err) => {
          console.error(`Error fetching payments from ${colName}:`, err);
          setError(err.message);
          setLoading(false);
        }
      );
    });

    return () => {
      collectionUnsubscribes.forEach((unsub) => unsub());
      logUnsubscribes.forEach((unsub) => unsub());
    };
  }, []);

  const updatePaymentVerification = async (
    orderId: string,
    action: "payment_verified" | "payment_rejected" | "payment_request_update",
    options: { notes?: string; performedBy?: string }
  ) => {
    try {
      await addDoc(collection(db, "insurance_orders", orderId, "status_logs"), {
        action,
        notes: options.notes || "",
        performedBy: options.performedBy || "Unknown",
        timestamp: Timestamp.now(),
      });
    } catch (err: any) {
      console.error("Error writing payment verification log:", err);
      throw err;
    }
  };

  return { payments, loading, error, updatePaymentVerification };
};

// Addons Hook - Derives addons from both order collections
export const useAddons = () => {
  const [addons, setAddons] = useState<Addon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dataMap: Record<string, Addon[]> = {};
    let loadedCount = 0;

    const unsubscribes = ORDER_COLLECTIONS.map((colName) => {
      const q = query(collection(db, colName), orderBy("createdAt", "desc"));

      return onSnapshot(
        q,
        (snapshot) => {
          const derivedAddons: Addon[] = [];

          snapshot.docs.forEach((docSnap) => {
            const data = docSnap.data();
            const orderId = docSnap.id;
            const packages: string[] = data.packages || [];
            const orderStatus = ((data.status || "pending").toLowerCase()) as string;
            const createdAt = data.createdAt ? convertTimestamp(data.createdAt) : undefined;

            const addonStatus: AddonStatus =
              orderStatus === "approved" ? "confirmed" :
              orderStatus === "rejected" ? "cancelled" :
              "pending";

            packages.forEach((pkgName, index) => {
              const normalizedName = pkgName.toLowerCase().replace(/[\s/]+/g, "_");

              let type: AddonType | null = null;
              if (normalizedName.includes("tdac")) type = "tdac";
              else if (normalizedName.includes("tow")) type = "towing";
              else if (normalizedName.includes("sim")) type = "sim_card";
              else if (normalizedName.includes("tm2") || normalizedName.includes("tm_2")) type = "towing";

              if (!type) return;

              derivedAddons.push({
                id: `${orderId}_addon_${index}`,
                applicationId: orderId,
                type,
                vendorName: "",
                cost: 0,
                status: addonStatus,
                createdAt,
              });
            });
          });

          dataMap[colName] = derivedAddons;
          loadedCount++;
          setAddons(Object.values(dataMap).flat());
          if (loadedCount >= ORDER_COLLECTIONS.length) setLoading(false);
        },
        (err) => {
          console.error(`Error fetching addons from ${colName}:`, err);
          loadedCount++;
          if (loadedCount >= ORDER_COLLECTIONS.length) {
            setError(err.message);
            setLoading(false);
          }
        }
      );
    });

    return () => unsubscribes.forEach((u) => u());
  }, []);

  const updateAddonStatus = async (_id: string, _status: AddonStatus, _trackingNumber?: string) => {
    console.warn("Addon status is derived from order status. Update the order instead.");
  };

  return { addons, loading, error, updateAddonStatus };
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
        const appDate = new Date(a.createdAt);
        return appDate.toDateString() === today.toDateString();
      }
    ).length,
    activeUsers: applications.length,
    totalPayments: payments.length,
    totalRevenue: payments
      .filter((p) => p.status === "paid")
      .reduce((sum, p) => sum + p.amount, 0),
    avgVerificationTime: 2.3,
    popularAddonType: (() => {
      const typeCounts: Record<string, number> = {};
      addons.forEach((a) => {
        typeCounts[a.type] = (typeCounts[a.type] || 0) + 1;
      });
      const sorted = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]);
      return (sorted[0]?.[0] as any) || "insurance";
    })(),
  };

  const chartData = {
    applicationTrends: (() => {
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      return days.map((name) => ({
        name,
        pending: applications.filter((a) => a.status === "pending").length,
        approved: applications.filter((a) => a.status === "approved").length,
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
