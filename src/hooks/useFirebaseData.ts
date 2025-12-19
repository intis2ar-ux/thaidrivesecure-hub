import { useState, useEffect } from "react";
import { 
  getApplications, 
  getAIVerifications, 
  getPayments, 
  getAddons, 
  getApplicationLogs, 
  getSystemLogs, 
  getReports,
  getAnalyticsData
} from "@/services/firebaseService";
import { 
  mockApplications, 
  mockAIVerifications, 
  mockPayments, 
  mockAddons, 
  mockApplicationLogs, 
  mockSystemLogs,
  mockReports,
  mockAnalytics,
  chartData
} from "@/data/mockData";
import { 
  Application, 
  AIVerification, 
  Payment, 
  Addon, 
  ApplicationLog, 
  SystemLog,
  Report,
  Analytics
} from "@/types";

interface UseFirebaseDataResult<T> {
  data: T;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

function useFirebaseData<T>(
  fetchFn: () => Promise<T[]>,
  mockData: T[]
): UseFirebaseDataResult<T[]> {
  const [data, setData] = useState<T[]>(mockData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await fetchFn();
      if (result.length > 0) {
        setData(result);
      }
    } catch (err: any) {
      console.warn("Firebase fetch failed, using mock data:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
}

export const useApplications = () => {
  return useFirebaseData<Application>(getApplications, mockApplications);
};

export const useAIVerifications = () => {
  return useFirebaseData<AIVerification>(getAIVerifications, mockAIVerifications);
};

export const usePayments = () => {
  return useFirebaseData<Payment>(getPayments, mockPayments);
};

export const useAddons = () => {
  return useFirebaseData<Addon>(getAddons, mockAddons);
};

export const useApplicationLogs = () => {
  return useFirebaseData<ApplicationLog>(getApplicationLogs, mockApplicationLogs);
};

export const useSystemLogs = () => {
  return useFirebaseData<SystemLog>(getSystemLogs, mockSystemLogs);
};

export const useReports = () => {
  return useFirebaseData<Report>(getReports, mockReports);
};

export const useDashboardData = () => {
  const [analytics, setAnalytics] = useState<Analytics>(mockAnalytics);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAnalyticsData();
        setAnalytics({
          newUsersToday: data.newUsersToday,
          activeUsers: data.activeUsers,
          totalPayments: data.totalPayments,
          totalRevenue: data.totalRevenue,
          avgVerificationTime: data.avgVerificationTime,
          popularAddonType: data.popularAddonType,
        });
      } catch (err) {
        console.warn("Using mock analytics data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return { analytics, chartData, loading };
};
