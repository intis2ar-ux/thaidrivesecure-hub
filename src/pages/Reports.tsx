import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FileBarChart, Download, Calendar as CalendarIcon, Plus } from "lucide-react";
import { mockReports } from "@/data/mockData";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const Reports = () => {
  const { toast } = useToast();
  const [reportType, setReportType] = useState<string>("daily");
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });

  const handleGenerateReport = () => {
    toast({
      title: "Report Generation Started",
      description: "Your report will be ready in a few moments.",
    });
  };

  const handleDownload = (url: string) => {
    toast({
      title: "Download Started",
      description: "Your report is being downloaded.",
    });
  };

  return (
    <DashboardLayout>
      <Header
        title="Reports"
        subtitle="Generate and download operational reports"
      />

      <div className="p-6 space-y-6">
        {/* Generate Report */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Generate New Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Report Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily Report</SelectItem>
                  <SelectItem value="weekly">Weekly Report</SelectItem>
                  <SelectItem value="monthly">Monthly Report</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>

              {reportType === "custom" && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-64 justify-start text-left font-normal",
                        !dateRange.from && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL dd, y")} -{" "}
                            {format(dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        "Pick a date range"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      selected={{ from: dateRange.from, to: dateRange.to }}
                      onSelect={(range) =>
                        setDateRange({ from: range?.from, to: range?.to })
                      }
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              )}

              <Button
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
                onClick={handleGenerateReport}
              >
                <FileBarChart className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Report History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Report History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date Range</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Applications</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead>Rejected</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Generated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockReports.map((report) => (
                  <TableRow key={report.id} className="hover:bg-muted/50">
                    <TableCell className="font-mono text-sm">
                      {report.id}
                    </TableCell>
                    <TableCell className="capitalize">{report.type}</TableCell>
                    <TableCell>
                      {format(report.startDate, "MMM dd")} -{" "}
                      {format(report.endDate, "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell>{report.totalUsers}</TableCell>
                    <TableCell>{report.totalApplications}</TableCell>
                    <TableCell className="text-success">
                      {report.totalVerified}
                    </TableCell>
                    <TableCell className="text-destructive">
                      {report.totalRejected}
                    </TableCell>
                    <TableCell className="font-medium">
                      ฿{report.totalRevenue.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {format(report.createdAt, "MMM dd, HH:mm")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownload(report.downloadUrl)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Report Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Daily Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {mockReports.filter((r) => r.type === "daily").length}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Generated this month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Weekly Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {mockReports.filter((r) => r.type === "weekly").length}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Generated this month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Monthly Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {mockReports.filter((r) => r.type === "monthly").length}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Generated this year
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
