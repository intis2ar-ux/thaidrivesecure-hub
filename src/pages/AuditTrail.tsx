import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  History,
  Search,
  Filter,
  Calendar as CalendarIcon,
  User,
  FileText,
  CreditCard,
  Truck,
  Shield,
  Settings,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowRight,
  X,
} from "lucide-react";
import { useAuditLog } from "@/hooks/useAuditLog";
import { useRBAC } from "@/hooks/useRBAC";
import { AuditLog, AuditModule, AuditAction } from "@/types/audit";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { PermissionGate } from "@/components/common/PermissionGate";

const moduleIcons: Record<AuditModule, React.ReactNode> = {
  application: <FileText className="h-4 w-4" />,
  verification: <Shield className="h-4 w-4" />,
  payment: <CreditCard className="h-4 w-4" />,
  delivery: <Truck className="h-4 w-4" />,
  addon: <FileText className="h-4 w-4" />,
  user: <User className="h-4 w-4" />,
  settings: <Settings className="h-4 w-4" />,
  report: <FileText className="h-4 w-4" />,
  system: <Settings className="h-4 w-4" />,
};

const moduleColors: Record<AuditModule, string> = {
  application: "bg-primary/10 text-primary",
  verification: "bg-accent/10 text-accent",
  payment: "bg-success/10 text-success",
  delivery: "bg-warning/10 text-warning",
  addon: "bg-secondary text-secondary-foreground",
  user: "bg-primary/10 text-primary",
  settings: "bg-muted text-muted-foreground",
  report: "bg-primary/10 text-primary",
  system: "bg-muted text-muted-foreground",
};

const actionLabels: Partial<Record<AuditAction, string>> = {
  application_created: "Application Created",
  application_updated: "Application Updated",
  application_approved: "Application Approved",
  application_rejected: "Application Rejected",
  application_completed: "Application Completed",
  document_verified: "Document Verified",
  document_rejected: "Document Rejected",
  ai_verification_completed: "AI Verification Completed",
  ai_override: "AI Decision Overridden",
  payment_received: "Payment Received",
  payment_failed: "Payment Failed",
  payment_refunded: "Payment Refunded",
  delivery_shipped: "Delivery Shipped",
  delivery_in_transit: "Delivery In Transit",
  delivery_completed: "Delivery Completed",
  status_changed: "Status Changed",
};

const AuditTrail = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { auditLogs, loading, filterLogs } = useAuditLog();
  const { isAdmin } = useRBAC();
  const [searchTerm, setSearchTerm] = useState("");
  const [moduleFilter, setModuleFilter] = useState<string>("all");
  const [userFilter, setUserFilter] = useState<string>("all");
  const [appIdFilter, setAppIdFilter] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });

  // Read appId from URL params on mount
  useEffect(() => {
    const appId = searchParams.get("appId");
    if (appId) {
      setAppIdFilter(appId);
    }
  }, [searchParams]);

  const uniqueUsers = useMemo(() => {
    const users = new Map<string, string>();
    auditLogs.forEach((log) => {
      users.set(log.performedBy.userId, log.performedBy.userName);
    });
    return Array.from(users.entries()).map(([id, name]) => ({ id, name }));
  }, [auditLogs]);

  const clearAppIdFilter = () => {
    setAppIdFilter(null);
    setSearchParams({});
  };

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      // App ID filter (from URL)
      if (appIdFilter && log.resourceId !== appIdFilter) return false;

      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          log.resourceId.toLowerCase().includes(searchLower) ||
          log.performedBy.userName.toLowerCase().includes(searchLower) ||
          actionLabels[log.action]?.toLowerCase().includes(searchLower) ||
          log.reason?.toLowerCase().includes(searchLower) ||
          log.notes?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Module filter
      if (moduleFilter !== "all" && log.module !== moduleFilter) return false;

      // User filter
      if (userFilter !== "all" && log.performedBy.userId !== userFilter) return false;

      // Date range filter
      if (dateRange.from && log.timestamp < dateRange.from) return false;
      if (dateRange.to && log.timestamp > dateRange.to) return false;

      return true;
    });
  }, [auditLogs, searchTerm, moduleFilter, userFilter, dateRange, appIdFilter]);

  const getActionIcon = (action: AuditAction) => {
    if (action.includes("approved") || action.includes("completed") || action.includes("verified")) {
      return <CheckCircle className="h-4 w-4 text-success" />;
    }
    if (action.includes("rejected") || action.includes("failed")) {
      return <XCircle className="h-4 w-4 text-destructive" />;
    }
    if (action.includes("override")) {
      return <AlertTriangle className="h-4 w-4 text-warning" />;
    }
    return <ChevronRight className="h-4 w-4 text-muted-foreground" />;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Header title="Audit Trail" subtitle="System-wide action history and accountability" />
        <div className="p-6 space-y-6">
          <Skeleton className="h-16" />
          <Skeleton className="h-96" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Header 
        title={appIdFilter ? `Audit Trail - ${appIdFilter}` : "Audit Trail"} 
        subtitle={appIdFilter ? `Viewing history for application ${appIdFilter}` : "System-wide action history and accountability"} 
      />

      <PermissionGate
        action="view"
        resource="audit"
        showBlockedMessage
        fallback={
          <div className="p-6">
            <Card>
              <CardContent className="p-12 text-center">
                <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
                <p className="text-muted-foreground">
                  Only administrators can view the audit trail.
                </p>
              </CardContent>
            </Card>
          </div>
        }
      >
        <div className="p-6 space-y-6">
          {/* App ID Filter Banner */}
          {appIdFilter && (
            <Card className="bg-accent/10 border-accent">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-accent" />
                  <div>
                    <p className="font-medium">Filtered by Application</p>
                    <p className="text-sm text-muted-foreground font-mono">{appIdFilter}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={clearAppIdFilter}>
                  <X className="h-4 w-4 mr-1" />
                  Clear Filter
                </Button>
              </CardContent>
            </Card>
          )}
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <History className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{auditLogs.length}</p>
                  <p className="text-sm text-muted-foreground">Total Actions</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-full bg-success/10">
                  <CheckCircle className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {auditLogs.filter((l) => l.action.includes("approved")).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Approvals</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-full bg-destructive/10">
                  <XCircle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {auditLogs.filter((l) => l.action.includes("rejected")).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Rejections</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-full bg-warning/10">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {auditLogs.filter((l) => l.action === "ai_override").length}
                  </p>
                  <p className="text-sm text-muted-foreground">AI Overrides</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by resource ID, user, action..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={moduleFilter} onValueChange={setModuleFilter}>
                  <SelectTrigger className="w-40">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Module" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Modules</SelectItem>
                    <SelectItem value="application">Application</SelectItem>
                    <SelectItem value="verification">Verification</SelectItem>
                    <SelectItem value="payment">Payment</SelectItem>
                    <SelectItem value="delivery">Delivery</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="settings">Settings</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={userFilter} onValueChange={setUserFilter}>
                  <SelectTrigger className="w-48">
                    <User className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="User" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    {uniqueUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-64 justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL dd")} - {format(dateRange.to, "LLL dd")}
                          </>
                        ) : (
                          format(dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        "Pick date range"
                      )}
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
              </div>
            </CardContent>
          </Card>

          {/* Audit Log Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <History className="h-5 w-5" />
                Audit Log ({filteredLogs.length} records)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredLogs.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No audit records found</p>
              ) : (
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Module</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Resource</TableHead>
                        <TableHead>Status Change</TableHead>
                        <TableHead>Performed By</TableHead>
                        <TableHead>Reason/Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLogs.map((log) => (
                        <TableRow key={log.id} className="hover:bg-muted/50">
                          <TableCell className="text-sm">
                            {format(log.timestamp, "MMM dd, HH:mm:ss")}
                          </TableCell>
                          <TableCell>
                            <div
                              className={cn(
                                "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium",
                                moduleColors[log.module]
                              )}
                            >
                              {moduleIcons[log.module]}
                              <span className="capitalize">{log.module}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getActionIcon(log.action)}
                              <span className="text-sm">
                                {actionLabels[log.action] || log.action}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{log.resourceId}</TableCell>
                          <TableCell>
                            {log.previousState && log.newState ? (
                              <div className="flex items-center gap-2 text-sm">
                                <Badge variant="outline" className="capitalize">
                                  {log.previousState}
                                </Badge>
                                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                <Badge variant="default" className="capitalize">
                                  {log.newState}
                                </Badge>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                                <span className="text-xs text-primary-foreground font-medium">
                                  {log.performedBy.userName.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="text-sm font-medium">{log.performedBy.userName}</p>
                                <p className="text-xs text-muted-foreground capitalize">
                                  {log.performedBy.userRole}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <p className="text-sm truncate">{log.reason || log.notes || "-"}</p>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </PermissionGate>
    </DashboardLayout>
  );
};

export default AuditTrail;
