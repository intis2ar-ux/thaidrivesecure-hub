import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollText, Server, Search, Filter } from "lucide-react";
import { useLogs } from "@/hooks/useFirestore";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const Logs = () => {
  const { applicationLogs, systemLogs, loading } = useLogs();
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("all");

  const filteredSystemLogs = systemLogs.filter((log) => {
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) || log.eventType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === "all" || log.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  if (loading) {
    return (
      <DashboardLayout>
        <Header title="Logs" subtitle="Application and system activity monitoring" />
        <div className="p-6 space-y-6"><Skeleton className="h-96" /></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Header title="Logs" subtitle="Application and system activity monitoring" />
      <div className="p-6 space-y-6">
        <Tabs defaultValue="application" className="space-y-6">
          <TabsList className="grid w-fit grid-cols-2">
            <TabsTrigger value="application" className="flex items-center gap-2"><ScrollText className="h-4 w-4" />Application Logs</TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2"><Server className="h-4 w-4" />System Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="application">
            <Card>
              <CardHeader><CardTitle className="text-base font-semibold">Application Activity Logs</CardTitle></CardHeader>
              <CardContent>
                {applicationLogs.length === 0 ? <p className="text-center text-muted-foreground py-8">No logs found</p> : (
                  <Table>
                    <TableHeader><TableRow><TableHead>Log ID</TableHead><TableHead>Application ID</TableHead><TableHead>Action</TableHead><TableHead>Performed By</TableHead><TableHead>Timestamp</TableHead><TableHead>Remarks</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {applicationLogs.map((log) => (
                        <TableRow key={log.id} className="hover:bg-muted/50">
                          <TableCell className="font-mono text-sm">{log.id}</TableCell>
                          <TableCell className="font-mono">{log.applicationId}</TableCell>
                          <TableCell>{log.action}</TableCell>
                          <TableCell>{log.performedBy}</TableCell>
                          <TableCell>{format(log.timestamp, "MMM dd, yyyy HH:mm:ss")}</TableCell>
                          <TableCell className="max-w-xs">{log.remarks || <span className="text-muted-foreground">-</span>}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search logs..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
                  <Select value={severityFilter} onValueChange={setSeverityFilter}><SelectTrigger className="w-40"><Filter className="h-4 w-4 mr-2" /><SelectValue placeholder="Severity" /></SelectTrigger><SelectContent><SelectItem value="all">All Severity</SelectItem><SelectItem value="info">Info</SelectItem><SelectItem value="warning">Warning</SelectItem><SelectItem value="error">Error</SelectItem></SelectContent></Select>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base font-semibold">System Logs ({filteredSystemLogs.length})</CardTitle></CardHeader>
              <CardContent>
                {filteredSystemLogs.length === 0 ? <p className="text-center text-muted-foreground py-8">No logs found</p> : (
                  <Table>
                    <TableHeader><TableRow><TableHead>Log ID</TableHead><TableHead>Event Type</TableHead><TableHead>Severity</TableHead><TableHead>Triggered By</TableHead><TableHead>Message</TableHead><TableHead>Timestamp</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {filteredSystemLogs.map((log) => (
                        <TableRow key={log.id} className={cn("hover:bg-muted/50", log.severity === "error" && "bg-destructive/5", log.severity === "warning" && "bg-warning/5")}>
                          <TableCell className="font-mono text-sm">{log.id}</TableCell>
                          <TableCell>{log.eventType}</TableCell>
                          <TableCell><StatusBadge variant={log.severity}>{log.severity}</StatusBadge></TableCell>
                          <TableCell>{log.triggeredBy}</TableCell>
                          <TableCell className="max-w-md"><p className="truncate">{log.message}</p></TableCell>
                          <TableCell>{format(log.timestamp, "MMM dd, yyyy HH:mm:ss")}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{applicationLogs.length + systemLogs.length}</p><p className="text-sm text-muted-foreground">Total Logs</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-primary">{systemLogs.filter((l) => l.severity === "info").length}</p><p className="text-sm text-muted-foreground">Info</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-warning">{systemLogs.filter((l) => l.severity === "warning").length}</p><p className="text-sm text-muted-foreground">Warnings</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-destructive">{systemLogs.filter((l) => l.severity === "error").length}</p><p className="text-sm text-muted-foreground">Errors</p></CardContent></Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Logs;
