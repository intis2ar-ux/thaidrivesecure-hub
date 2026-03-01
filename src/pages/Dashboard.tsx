import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FileText,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useInsuranceApplications } from "@/hooks/useInsuranceApplications";

const Dashboard = () => {
  const navigate = useNavigate();
  const { applications, loading } = useInsuranceApplications();

  const totalCount = applications.length;
  const pendingCount = applications.filter((a) => a.status === "Pending").length;
  const approvedCount = applications.filter((a) => a.status === "Approved").length;
  const rejectedCount = applications.filter((a) => a.status === "Rejected").length;

  const recentApplications = applications.slice(0, 5);

  // Chart data grouped by insurance type
  const chartData = (() => {
    const typeMap: Record<string, { pending: number; approved: number; rejected: number }> = {};
    applications.forEach((app) => {
      const key = app.insuranceType || "Unknown";
      if (!typeMap[key]) typeMap[key] = { pending: 0, approved: 0, rejected: 0 };
      if (app.status === "Pending") typeMap[key].pending++;
      else if (app.status === "Approved") typeMap[key].approved++;
      else if (app.status === "Rejected") typeMap[key].rejected++;
    });
    return Object.entries(typeMap).map(([name, data]) => ({ name, ...data }));
  })();

  if (loading) {
    return (
      <DashboardLayout>
        <Header title="Dashboard" subtitle="Welcome back! Here's what's happening today." />
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Header title="Dashboard" subtitle="Welcome back! Here's what's happening today." />

      <div className="p-6 space-y-6">
        {/* Glassmorphism Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <GlassCard
            title="Total Applications"
            value={totalCount}
            icon={<FileText className="h-6 w-6" />}
            iconBg="bg-primary/15"
            iconColor="text-primary"
            onClick={() => navigate("/insurance-applications")}
          />
          <GlassCard
            title="Pending"
            value={pendingCount}
            icon={<Clock className="h-6 w-6" />}
            iconBg="bg-warning/15"
            iconColor="text-warning"
            onClick={() => navigate("/insurance-applications?status=Pending")}
          />
          <GlassCard
            title="Approved"
            value={approvedCount}
            icon={<CheckCircle className="h-6 w-6" />}
            iconBg="bg-success/15"
            iconColor="text-success"
            onClick={() => navigate("/insurance-applications?status=Approved")}
          />
          <GlassCard
            title="Rejected"
            value={rejectedCount}
            icon={<XCircle className="h-6 w-6" />}
            iconBg="bg-destructive/15"
            iconColor="text-destructive"
            onClick={() => navigate("/insurance-applications?status=Rejected")}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Applications by Insurance Type</CardTitle>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="approved" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="pending" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="rejected" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground py-12">No data to display yet</p>
              )}
            </CardContent>
          </Card>

          {/* Recent Applications */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Recent Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentApplications.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No applications yet</p>
                ) : (
                  recentApplications.map((app) => {
                    const statusColor =
                      app.status === "Approved" ? "text-success" :
                      app.status === "Rejected" ? "text-destructive" : "text-warning";
                    return (
                      <div
                        key={app.id}
                        onClick={() => navigate("/insurance-applications")}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                      >
                        <div>
                          <p className="font-medium text-sm">{app.fullName}</p>
                          <p className="text-xs text-muted-foreground">{app.icNumber} • {app.insuranceType}</p>
                        </div>
                        <span className={`text-xs font-semibold ${statusColor}`}>{app.status}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

// Glassmorphism Card Component
const GlassCard = ({
  title,
  value,
  icon,
  iconBg,
  iconColor,
  onClick,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  onClick?: () => void;
}) => (
  <div
    onClick={onClick}
    className="relative overflow-hidden rounded-xl border border-border/50 p-6 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group"
    style={{
      background: "rgba(255, 255, 255, 0.6)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      boxShadow: "0 4px 30px rgba(0, 0, 0, 0.06)",
    }}
  >
    <div className="flex items-start justify-between">
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-3xl font-bold text-foreground">{value}</p>
      </div>
      <div className={`p-3 rounded-xl ${iconBg} ${iconColor}`}>{icon}</div>
    </div>
    {/* Subtle gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
  </div>
);

export default Dashboard;
