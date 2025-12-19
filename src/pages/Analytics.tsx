import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Users, TrendingUp, DollarSign, Clock, BarChart3, Package } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Area, AreaChart } from "recharts";
import { useAnalytics } from "@/hooks/useFirestore";

const Analytics = () => {
  const { analytics, chartData } = useAnalytics();

  const userGrowthData = [
    { name: "Week 1", users: 120 }, { name: "Week 2", users: 145 }, { name: "Week 3", users: 178 },
    { name: "Week 4", users: 210 }, { name: "Week 5", users: 258 }, { name: "Week 6", users: 295 },
  ];

  const verificationTimeData = [
    { name: "Mon", time: 2.1 }, { name: "Tue", time: 2.4 }, { name: "Wed", time: 1.9 },
    { name: "Thu", time: 2.3 }, { name: "Fri", time: 2.8 }, { name: "Sat", time: 1.5 }, { name: "Sun", time: 1.2 },
  ];

  const addonColors = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"];

  return (
    <DashboardLayout>
      <Header title="Analytics" subtitle="Insights and performance metrics" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="New Users Today" value={analytics.newUsersToday} icon={Users} trend={{ value: 15, isPositive: true }} />
          <StatCard title="Active Users" value={analytics.activeUsers} icon={TrendingUp} trend={{ value: 8, isPositive: true }} />
          <StatCard title="Total Revenue" value={`RM${analytics.totalRevenue.toLocaleString()}`} icon={DollarSign} trend={{ value: 12, isPositive: true }} />
          <StatCard title="Avg Verification Time" value={`${analytics.avgVerificationTime}min`} icon={Clock} trend={{ value: 5, isPositive: false }} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-base font-semibold flex items-center gap-2"><Users className="h-5 w-5 text-accent" />User Growth</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={userGrowthData}>
                  <defs><linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} /><stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} /><YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                  <Area type="monotone" dataKey="users" stroke="hsl(var(--accent))" strokeWidth={2} fill="url(#userGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base font-semibold flex items-center gap-2"><DollarSign className="h-5 w-5 text-success" />Revenue Trend</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} /><YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} formatter={(value: number) => [`RM${value.toLocaleString()}`, "Revenue"]} />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-base font-semibold flex items-center gap-2"><Clock className="h-5 w-5 text-warning" />Avg Verification Time</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={verificationTimeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} /><YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} unit="min" />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} formatter={(value: number) => [`${value} min`, "Time"]} />
                  <Line type="monotone" dataKey="time" stroke="hsl(var(--warning))" strokeWidth={2} dot={{ fill: "hsl(var(--warning))" }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base font-semibold flex items-center gap-2"><BarChart3 className="h-5 w-5 text-primary" />Payment Methods</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart><Pie data={chartData.paymentMethods} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2} dataKey="value">{chartData.paymentMethods.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}</Pie><Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} /></PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2">{chartData.paymentMethods.map((method, index) => (<div key={index} className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: method.color }} /><span className="text-xs text-muted-foreground">{method.name}</span></div>))}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base font-semibold flex items-center gap-2"><Package className="h-5 w-5 text-accent" />Popular Add-ons</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart><Pie data={chartData.addonTypes} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2} dataKey="value">{chartData.addonTypes.map((entry, index) => (<Cell key={`cell-${index}`} fill={addonColors[index]} />))}</Pie><Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} /></PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2">{chartData.addonTypes.map((addon, index) => (<div key={index} className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: addonColors[index] }} /><span className="text-xs text-muted-foreground">{addon.name}</span></div>))}</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
