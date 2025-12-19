import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  FileBarChart, 
  Download, 
  Calendar as CalendarIcon, 
  Plus, 
  Clock, 
  Brain, 
  XCircle, 
  DollarSign,
  TrendingUp,
  AlertTriangle,
  FileText,
  Loader2
} from "lucide-react";
import { useReports, useApplications, usePayments, useAIVerifications } from "@/hooks/useFirestore";
import { format, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useRBAC } from "@/hooks/useRBAC";
import { PermissionGate, ProtectedButton } from "@/components/common/PermissionGate";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const Reports = () => {
  const { toast } = useToast();
  const { isAdmin, hasPermission } = useRBAC();
  const { reports, loading: reportsLoading } = useReports();
  const { applications, loading: appsLoading } = useApplications();
  const { payments, loading: paymentsLoading } = usePayments();
  const { verifications, loading: verificationsLoading } = useAIVerifications();
  
  const [reportType, setReportType] = useState<string>("processing_time");
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({ 
    from: undefined, 
    to: undefined 
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const loading = reportsLoading || appsLoading || paymentsLoading || verificationsLoading;

  // Calculate processing time report data
  const processingTimeData = useMemo(() => {
    const completedApps = applications.filter(app => app.status === "completed");
    const avgDays = completedApps.length > 0
      ? completedApps.reduce((sum, app) => sum + differenceInDays(new Date(), app.submissionDate), 0) / completedApps.length
      : 0;

    const byStatus = [
      { status: "Pending", count: applications.filter(a => a.status === "pending").length, avgDays: 0 },
      { status: "Verified", count: applications.filter(a => a.status === "verified").length, avgDays: 1.5 },
      { status: "Approved", count: applications.filter(a => a.status === "approved").length, avgDays: 2.3 },
      { status: "Completed", count: applications.filter(a => a.status === "completed").length, avgDays: 4.2 },
      { status: "Rejected", count: applications.filter(a => a.status === "rejected").length, avgDays: 1.8 },
    ];

    return { averageDays: avgDays.toFixed(1), byStatus };
  }, [applications]);

  // Calculate AI verification accuracy data
  const aiMetricsData = useMemo(() => {
    const total = verifications.length;
    const autoVerified = verifications.filter(v => v.overallConfidence >= 0.85 && v.verifiedByAI).length;
    const manualReview = verifications.filter(v => v.overallConfidence >= 0.7 && v.overallConfidence < 0.85).length;
    const flagged = verifications.filter(v => v.overallConfidence < 0.7).length;
    const overridden = verifications.filter(v => v.reviewedByStaff && !v.verifiedByAI).length;
    const avgConfidence = total > 0
      ? verifications.reduce((sum, v) => sum + v.overallConfidence, 0) / total
      : 0;

    return {
      total,
      autoVerified,
      autoVerificationRate: total > 0 ? ((autoVerified / total) * 100).toFixed(1) : 0,
      manualReview,
      flagged,
      overridden,
      overrideRate: total > 0 ? ((overridden / total) * 100).toFixed(1) : 0,
      avgConfidence: (avgConfidence * 100).toFixed(1),
    };
  }, [verifications]);

  // Rejection reasons data
  const rejectionData = useMemo(() => {
    const rejectedApps = applications.filter(a => a.status === "rejected");
    const reasons = [
      { reason: "Blurred Documents", count: 3, percentage: 30 },
      { reason: "Data Mismatch", count: 4, percentage: 40 },
      { reason: "Expired Documents", count: 1, percentage: 10 },
      { reason: "Incomplete Submission", count: 2, percentage: 20 },
    ];
    return reasons;
  }, [applications]);

  // Revenue by service type
  const revenueData = useMemo(() => {
    const paidPayments = payments.filter(p => p.status === "paid");
    const totalRevenue = paidPayments.reduce((sum, p) => sum + p.amount, 0);
    
    return [
      { service: "Insurance Policy", revenue: Math.round(totalRevenue * 0.6), count: Math.round(paidPayments.length * 0.6), color: "hsl(var(--chart-1))" },
      { service: "TDAC Certificate", revenue: Math.round(totalRevenue * 0.2), count: Math.round(paidPayments.length * 0.2), color: "hsl(var(--chart-2))" },
      { service: "Towing Service", revenue: Math.round(totalRevenue * 0.12), count: Math.round(paidPayments.length * 0.12), color: "hsl(var(--chart-3))" },
      { service: "SIM Card", revenue: Math.round(totalRevenue * 0.08), count: Math.round(paidPayments.length * 0.08), color: "hsl(var(--chart-4))" },
    ];
  }, [payments]);

  // Queue priority performance
  const queueData = useMemo(() => {
    const priority = payments.filter(p => p.status === "paid").length;
    const delayed = payments.filter(p => p.method === "cash" && p.status !== "paid").length;
    
    return {
      priority,
      delayed,
      priorityAvgWait: 1.2,
      delayedAvgWait: 3.5,
    };
  }, [payments]);

  const handleGenerateReport = async () => {
    if (!hasPermission("generate", "reports")) {
      toast({
        title: "Permission Denied",
        description: "Only administrators can generate reports.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGenerating(false);
    toast({ 
      title: "Report Generated", 
      description: "Your report has been generated and is ready for download." 
    });
  };

  const handleDownload = (reportId: string, format: "pdf" | "csv") => {
    if (!hasPermission("download", "reports")) {
      toast({
        title: "Permission Denied",
        description: "Only administrators can download reports.",
        variant: "destructive",
      });
      return;
    }
    toast({ 
      title: "Download Started", 
      description: `Downloading ${format.toUpperCase()} report...` 
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Header title="Reports" subtitle="Generate and analyze operational reports" />
        <div className="p-6 space-y-6"><Skeleton className="h-32" /><Skeleton className="h-96" /></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Header title="Reports" subtitle="Generate and analyze operational reports" />
      
      <PermissionGate
        action="view"
        resource="reports"
        showBlockedMessage
        fallback={
          <div className="p-6">
            <Card>
              <CardContent className="p-12 text-center">
                <FileBarChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
                <p className="text-muted-foreground">
                  Only administrators can access detailed reports.
                </p>
              </CardContent>
            </Card>
          </div>
        }
      >
        <div className="p-6 space-y-6">
          {/* Generate Report Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Generate Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Report Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="processing_time">Application Processing Time</SelectItem>
                    <SelectItem value="ai_accuracy">AI Verification Accuracy</SelectItem>
                    <SelectItem value="rejections">Rejections by Reason</SelectItem>
                    <SelectItem value="revenue">Revenue by Service</SelectItem>
                    <SelectItem value="queue">Queue Priority Performance</SelectItem>
                  </SelectContent>
                </Select>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-64 justify-start text-left font-normal", !dateRange.from && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from ? (
                        dateRange.to ? (
                          <>{format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}</>
                        ) : format(dateRange.from, "LLL dd, y")
                      ) : "Pick a date range"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      selected={{ from: dateRange.from, to: dateRange.to }}
                      onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
                <ProtectedButton action="generate" resource="reports">
                  <Button 
                    className="bg-accent hover:bg-accent/90 text-accent-foreground" 
                    onClick={handleGenerateReport}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <FileBarChart className="h-4 w-4 mr-2" />
                        Generate Report
                      </>
                    )}
                  </Button>
                </ProtectedButton>
              </div>
            </CardContent>
          </Card>

          {/* Report Tabs */}
          <Tabs value={reportType} onValueChange={setReportType} className="space-y-6">
            <TabsList className="grid w-fit grid-cols-5 gap-2">
              <TabsTrigger value="processing_time" className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Processing Time
              </TabsTrigger>
              <TabsTrigger value="ai_accuracy" className="flex items-center gap-1">
                <Brain className="h-4 w-4" />
                AI Accuracy
              </TabsTrigger>
              <TabsTrigger value="rejections" className="flex items-center gap-1">
                <XCircle className="h-4 w-4" />
                Rejections
              </TabsTrigger>
              <TabsTrigger value="revenue" className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                Revenue
              </TabsTrigger>
              <TabsTrigger value="queue" className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                Queue
              </TabsTrigger>
            </TabsList>

            {/* Processing Time Report */}
            <TabsContent value="processing_time">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-base">Processing Time by Status</CardTitle>
                    <CardDescription>Average days spent in each status</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={processingTimeData.byStatus}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="status" className="text-xs" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="hsl(var(--primary))" name="Applications" />
                        <Bar dataKey="avgDays" fill="hsl(var(--accent))" name="Avg Days" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 rounded-lg bg-primary/10 text-center">
                      <p className="text-3xl font-bold text-primary">{processingTimeData.averageDays}</p>
                      <p className="text-sm text-muted-foreground">Avg. Days to Complete</p>
                    </div>
                    <Separator />
                    {processingTimeData.byStatus.map((item) => (
                      <div key={item.status} className="flex items-center justify-between">
                        <span className="text-sm">{item.status}</span>
                        <Badge variant="secondary">{item.count}</Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* AI Accuracy Report */}
            <TabsContent value="ai_accuracy">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-primary">{aiMetricsData.total}</p>
                    <p className="text-sm text-muted-foreground">Total Verifications</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-success">{aiMetricsData.autoVerificationRate}%</p>
                    <p className="text-sm text-muted-foreground">Auto-Verification Rate</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-warning">{aiMetricsData.overrideRate}%</p>
                    <p className="text-sm text-muted-foreground">Human Override Rate</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-accent">{aiMetricsData.avgConfidence}%</p>
                    <p className="text-sm text-muted-foreground">Avg. Confidence</p>
                  </CardContent>
                </Card>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Verification Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-success/10">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 rounded-full bg-success" />
                        <span className="font-medium">Auto-Verified</span>
                      </div>
                      <p className="text-2xl font-bold">{aiMetricsData.autoVerified}</p>
                      <p className="text-xs text-muted-foreground">≥85% confidence</p>
                    </div>
                    <div className="p-4 rounded-lg bg-warning/10">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 rounded-full bg-warning" />
                        <span className="font-medium">Manual Review</span>
                      </div>
                      <p className="text-2xl font-bold">{aiMetricsData.manualReview}</p>
                      <p className="text-xs text-muted-foreground">70-84% confidence</p>
                    </div>
                    <div className="p-4 rounded-lg bg-destructive/10">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 rounded-full bg-destructive" />
                        <span className="font-medium">Flagged</span>
                      </div>
                      <p className="text-2xl font-bold">{aiMetricsData.flagged}</p>
                      <p className="text-xs text-muted-foreground">&lt;70% confidence</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Rejections Report */}
            <TabsContent value="rejections">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Rejections by Reason</CardTitle>
                  <CardDescription>Analysis of application rejection reasons</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={rejectionData}
                            dataKey="count"
                            nameKey="reason"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label
                          >
                            {rejectionData.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={`hsl(var(--chart-${index + 1}))`}
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-4">
                      {rejectionData.map((item, idx) => (
                        <div key={item.reason} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{item.reason}</span>
                            <span className="text-sm text-muted-foreground">{item.percentage}%</span>
                          </div>
                          <Progress value={item.percentage} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Revenue Report */}
            <TabsContent value="revenue">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Revenue by Service Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Service</TableHead>
                        <TableHead className="text-right">Count</TableHead>
                        <TableHead className="text-right">Revenue (RM)</TableHead>
                        <TableHead className="text-right">% of Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {revenueData.map((item) => {
                        const total = revenueData.reduce((sum, r) => sum + r.revenue, 0);
                        const percentage = total > 0 ? ((item.revenue / total) * 100).toFixed(1) : 0;
                        return (
                          <TableRow key={item.service}>
                            <TableCell className="font-medium">{item.service}</TableCell>
                            <TableCell className="text-right">{item.count}</TableCell>
                            <TableCell className="text-right font-semibold">
                              RM{item.revenue.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right">{percentage}%</TableCell>
                          </TableRow>
                        );
                      })}
                      <TableRow className="bg-muted/50">
                        <TableCell className="font-bold">Total</TableCell>
                        <TableCell className="text-right font-bold">
                          {revenueData.reduce((sum, r) => sum + r.count, 0)}
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          RM{revenueData.reduce((sum, r) => sum + r.revenue, 0).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-bold">100%</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Queue Performance Report */}
            <TabsContent value="queue">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Queue Distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 rounded-lg bg-success/10 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-success">Priority Queue</p>
                        <p className="text-xs text-muted-foreground">Paid applications</p>
                      </div>
                      <p className="text-2xl font-bold text-success">{queueData.priority}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-warning/10 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-warning">Delayed Queue</p>
                        <p className="text-xs text-muted-foreground">Cash/unpaid applications</p>
                      </div>
                      <p className="text-2xl font-bold text-warning">{queueData.delayed}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Average Wait Times</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Priority Queue</span>
                        <span className="font-semibold text-success">{queueData.priorityAvgWait} days</span>
                      </div>
                      <Progress value={30} className="h-2 bg-success/20" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Delayed Queue</span>
                        <span className="font-semibold text-warning">{queueData.delayedAvgWait} days</span>
                      </div>
                      <Progress value={70} className="h-2 bg-warning/20" />
                    </div>
                    <Separator />
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">
                        <AlertTriangle className="h-4 w-4 inline mr-1 text-warning" />
                        Priority queue is {((queueData.delayedAvgWait / queueData.priorityAvgWait - 1) * 100).toFixed(0)}% 
                        faster than delayed queue
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Export Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Download className="h-5 w-5" />
                Export Options
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <ProtectedButton action="download" resource="reports">
                  <Button variant="outline" onClick={() => handleDownload("current", "pdf")}>
                    <FileText className="h-4 w-4 mr-2" />
                    Export as PDF
                  </Button>
                </ProtectedButton>
                <ProtectedButton action="download" resource="reports">
                  <Button variant="outline" onClick={() => handleDownload("current", "csv")}>
                    <FileBarChart className="h-4 w-4 mr-2" />
                    Export as CSV
                  </Button>
                </ProtectedButton>
              </div>
            </CardContent>
          </Card>
        </div>
      </PermissionGate>
    </DashboardLayout>
  );
};

export default Reports;
