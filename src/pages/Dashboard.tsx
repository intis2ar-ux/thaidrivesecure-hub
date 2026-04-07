import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Header } from "@/components/layout/Header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  CreditCard,
  Truck,
  ArrowRight,
  Send,
  ShieldCheck,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useApplications, usePayments, useDeliveries, useAnalytics } from "@/hooks/useFirestore";
import { cn } from "@/lib/utils";

const Dashboard = () => {
  const navigate = useNavigate();
  const { applications, loading } = useApplications();
  const { payments } = usePayments();
  const { deliveries } = useDeliveries();
  const { analytics, chartData } = useAnalytics();

  const pendingApps = applications.filter((a) => a.status === "pending").length;
  const approvedApps = applications.filter((a) => a.status === "approved").length;
  const rejectedApps = applications.filter((a) => a.status === "rejected").length;

  const pendingPayments = payments.filter((p) => p.verificationStatus === "pending_verification" && p.status === "paid").length;
  const verifiedPayments = payments.filter((p) => p.verificationStatus === "verified").length;

  const pendingDeliveries = deliveries.filter((d) => d.status !== "delivered").length;
  const completedDeliveries = deliveries.filter((d) => d.status === "delivered").length;

  const recentApplications = applications.slice(0, 5);

  if (loading) {
    return (
      <DashboardLayout>
        <Header title="Dashboard" subtitle="Welcome back! Here's your operational overview." />
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
      <Header title="Dashboard" subtitle="Welcome back! Here's your operational overview." />

      <div className="p-6 space-y-6">
        {/* KPI Cards - Pipeline aligned */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Applications"
            value={applications.length}
            icon={FileText}
            subtitle={`${pendingApps} pending review`}
          />
          <StatCard
            title="Approved Applications"
            value={approvedApps}
            icon={CheckCircle}
            subtitle={`${rejectedApps} rejected`}
          />
          <StatCard
            title="Payments Verified"
            value={verifiedPayments}
            icon={ShieldCheck}
            subtitle={`${pendingPayments} awaiting verification`}
          />
          <StatCard
            title="Total Revenue"
            value={`RM${analytics.totalRevenue.toLocaleString()}`}
            icon={DollarSign}
          />
        </div>

        {/* Pipeline Progress Cards */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Operations Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Stage 1: Applications */}
              <div
                className="relative p-4 rounded-lg border border-border bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => navigate("/applications")}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">Applications</p>
                    <p className="text-xs text-muted-foreground">Stage 1 — Review</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-warning-foreground" />
                    <span className="text-sm font-medium">{pendingApps}</span>
                    <span className="text-xs text-muted-foreground">Pending</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="h-3.5 w-3.5 text-success" />
                    <span className="text-sm font-medium">{approvedApps}</span>
                    <span className="text-xs text-muted-foreground">Approved</span>
                  </div>
                </div>
                <ArrowRight className="hidden md:block absolute right-[-20px] top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
              </div>

              {/* Stage 2: Payments */}
              <div
                className="relative p-4 rounded-lg border border-border bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => navigate("/payments")}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <CreditCard className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">Payments</p>
                    <p className="text-xs text-muted-foreground">Stage 2 — Verification</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-warning-foreground" />
                    <span className="text-sm font-medium">{pendingPayments}</span>
                    <span className="text-xs text-muted-foreground">Pending</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-success" />
                    <span className="text-sm font-medium">{verifiedPayments}</span>
                    <span className="text-xs text-muted-foreground">Verified</span>
                  </div>
                </div>
                <ArrowRight className="hidden md:block absolute right-[-20px] top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
              </div>

              {/* Stage 3: Policy Delivery */}
              <div
                className="p-4 rounded-lg border border-border bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => navigate("/policy-delivery")}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-success/10">
                    <Truck className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">Policy Delivery</p>
                    <p className="text-xs text-muted-foreground">Stage 3 — Fulfillment</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex items-center gap-1.5">
                    <Send className="h-3.5 w-3.5 text-warning-foreground" />
                    <span className="text-sm font-medium">{pendingDeliveries}</span>
                    <span className="text-xs text-muted-foreground">Pending</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="h-3.5 w-3.5 text-success" />
                    <span className="text-sm font-medium">{completedDeliveries}</span>
                    <span className="text-xs text-muted-foreground">Delivered</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Application Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData.applicationTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                  <Bar dataKey="approved" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="pending" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="rejected" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData.revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                    formatter={(value: number) => [`RM${value.toLocaleString()}`, "Revenue"]}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="hsl(var(--accent))" strokeWidth={3} dot={{ fill: "hsl(var(--accent))", strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Applications */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Recent Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentApplications.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No applications yet</p>
                ) : (
                  recentApplications.map((app) => (
                    <div
                      key={app.id}
                      onClick={() => navigate("/applications")}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{app.name}</p>
                          <p className="text-xs text-muted-foreground">{app.id} • {app.where}</p>
                        </div>
                      </div>
                      <StatusBadge variant={app.status}>{app.status}</StatusBadge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Payment Methods</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={chartData.paymentMethods} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                    {chartData.paymentMethods.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {chartData.paymentMethods.map((method, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: method.color }} />
                    <span className="text-xs text-muted-foreground">{method.name} ({method.value})</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
