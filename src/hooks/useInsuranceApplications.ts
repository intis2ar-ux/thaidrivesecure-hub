import { useState, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { InsuranceApplication } from "@/types/insurance";

const convertTimestamp = (timestamp: any): Date => {
  if (timestamp instanceof Timestamp) return timestamp.toDate();
  if (timestamp?.seconds) return new Timestamp(timestamp.seconds, timestamp.nanoseconds).toDate();
  return new Date(timestamp);
};

export const useInsuranceApplications = () => {
  const [applications, setApplications] = useState<InsuranceApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, "insuranceApplications"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const apps: InsuranceApplication[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            userId: data.userId || "",
            fullName: data.fullName || "",
            icNumber: data.icNumber || "",
            vehiclePlate: data.vehiclePlate || "",
            chassisNumber: data.chassisNumber || "",
            insuranceType: data.insuranceType || "",
            status: data.status || "Pending",
            createdAt: data.createdAt ? convertTimestamp(data.createdAt) : new Date(),
          };
        });
        setApplications(apps);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching insurance applications:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const approveApplication = async (id: string) => {
    await updateDoc(doc(db, "insuranceApplications", id), { status: "Approved" });
  };

  const rejectApplication = async (id: string) => {
    await updateDoc(doc(db, "insuranceApplications", id), { status: "Rejected" });
  };

  return { applications, loading, error, approveApplication, rejectApplication };
};
