import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertTriangle, CheckCircle, XCircle, Brain, Clock } from "lucide-react";
import { mockAIVerifications, mockApplications } from "@/data/mockData";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const AIVerification = () => {
  const { toast } = useToast();
  const [verifications, setVerifications] = useState(mockAIVerifications);

  const pendingReview = verifications.filter((v) => !v.reviewedByStaff);
  const lowConfidence = verifications.filter((v) => v.confidenceScore < 0.7);

  const getApplication = (appId: string) =>
    mockApplications.find((a) => a.id === appId);

  const handleApprove = (id: string) => {
    setVerifications((prev) =>
      prev.map((v) => (v.id === id ? { ...v, reviewedByStaff: true, verifiedByAI: true } : v))
    );
    toast({
      title: "Verification Approved",
      description: "The document has been marked as verified.",
    });
  };

  const handleReject = (id: string) => {
    setVerifications((prev) =>
      prev.map((v) => (v.id === id ? { ...v, reviewedByStaff: true, verifiedByAI: false } : v))
    );
    toast({
      title: "Verification Rejected",
      description: "A re-upload request has been sent.",
      variant: "destructive",
    });
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.85) return "text-success";
    if (score >= 0.7) return "text-warning";
    return "text-destructive";
  };

  return (
    <DashboardLayout>
      <Header
        title="AI Verification"
        subtitle="Review AI-assisted document verification results"
      />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Brain className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{verifications.length}</p>
                <p className="text-sm text-muted-foreground">Total Verifications</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-full bg-warning/15">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingReview.length}</p>
                <p className="text-sm text-muted-foreground">Pending Review</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-full bg-success/15">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {verifications.filter((v) => v.verifiedByAI).length}
                </p>
                <p className="text-sm text-muted-foreground">AI Verified</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-full bg-destructive/15">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{lowConfidence.length}</p>
                <p className="text-sm text-muted-foreground">Low Confidence</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Verification Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Verification Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Verification ID</TableHead>
                  <TableHead>Application</TableHead>
                  <TableHead>Document Type</TableHead>
                  <TableHead>Extracted Data</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>AI Status</TableHead>
                  <TableHead>Staff Review</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {verifications.map((ver) => {
                  const app = getApplication(ver.applicationId);
                  return (
                    <TableRow
                      key={ver.id}
                      className={cn(
                        "hover:bg-muted/50",
                        ver.confidenceScore < 0.7 && "bg-destructive/5"
                      )}
                    >
                      <TableCell className="font-mono text-sm">{ver.id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{ver.applicationId}</p>
                          <p className="text-xs text-muted-foreground">
                            {app?.customerName}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">
                        {ver.documentType.replace("_", " ")}
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <p className="text-xs font-mono truncate">
                          {ver.extractedText}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Progress
                              value={ver.confidenceScore * 100}
                              className="h-2 w-20"
                            />
                            <span
                              className={cn(
                                "text-sm font-medium",
                                getConfidenceColor(ver.confidenceScore)
                              )}
                            >
                              {(ver.confidenceScore * 100).toFixed(0)}%
                            </span>
                          </div>
                          {ver.confidenceScore < 0.7 && (
                            <p className="text-xs text-destructive flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              Low confidence
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          variant={ver.verifiedByAI ? "verified" : "rejected"}
                        >
                          {ver.verifiedByAI ? "Passed" : "Failed"}
                        </StatusBadge>
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          variant={ver.reviewedByStaff ? "completed" : "pending"}
                        >
                          {ver.reviewedByStaff ? "Reviewed" : "Pending"}
                        </StatusBadge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {format(ver.timestamp, "MMM dd, HH:mm")}
                      </TableCell>
                      <TableCell className="text-right">
                        {!ver.reviewedByStaff && (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-success hover:text-success hover:bg-success/10"
                              onClick={() => handleApprove(ver.id)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleReject(ver.id)}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AIVerification;
