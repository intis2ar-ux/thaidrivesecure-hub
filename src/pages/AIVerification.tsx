import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertTriangle, CheckCircle, XCircle, Brain, Clock, Flag, FileText, Eye } from "lucide-react";
import { useAIVerifications, useApplications } from "@/hooks/useFirestore";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { AIVerification as AIVerificationType } from "@/types";

const AIVerification = () => {
  const { toast } = useToast();
  const { verifications, loading, updateVerification } = useAIVerifications();
  const { applications } = useApplications();
  const [selectedVerification, setSelectedVerification] = useState<AIVerificationType | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  const pendingReview = verifications.filter((v) => !v.reviewedByStaff);
  const lowConfidence = verifications.filter((v) => v.overallConfidence < 0.7);
  const flaggedCount = verifications.filter((v) => v.flagged).length;

  const getApplication = (appId: string) =>
    applications.find((a) => a.id === appId);

  const handleVerify = async (id: string) => {
    try {
      await updateVerification(id, { reviewedByStaff: true, verifiedByAI: true, flagged: false });
      toast({
        title: "Document Verified",
        description: "The document has been verified and approved.",
      });
      setIsReviewOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify document.",
        variant: "destructive",
      });
    }
  };

  const handleFlag = async (id: string) => {
    try {
      await updateVerification(id, { reviewedByStaff: true, flagged: true, verifiedByAI: false });
      toast({
        title: "Document Flagged",
        description: "The document has been flagged for further review.",
        variant: "destructive",
      });
      setIsReviewOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to flag document.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setIsReviewOpen(false);
    setSelectedVerification(null);
  };

  const openReview = (verification: AIVerificationType) => {
    setSelectedVerification(verification);
    setIsReviewOpen(true);
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.85) return "text-success";
    if (score >= 0.7) return "text-warning";
    return "text-destructive";
  };

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case "drivers_license":
        return "Driver's License";
      case "vehicle_registration":
        return "Vehicle Registration";
      case "passport":
        return "Passport";
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Header
          title="AI Verification"
          subtitle="Review AI-assisted document verification results"
        />
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
      </DashboardLayout>
    );
  }

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
                  {verifications.filter((v) => v.verifiedByAI && v.reviewedByStaff).length}
                </p>
                <p className="text-sm text-muted-foreground">Verified</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-full bg-destructive/15">
                <Flag className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{flaggedCount}</p>
                <p className="text-sm text-muted-foreground">Flagged</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Verification Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Document Verifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            {verifications.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No verifications found
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Application</TableHead>
                    <TableHead>Document Type</TableHead>
                    <TableHead>Document ID</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Status</TableHead>
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
                          "hover:bg-muted/50 cursor-pointer",
                          ver.overallConfidence < 0.7 && "bg-destructive/5",
                          ver.flagged && "bg-warning/5"
                        )}
                        onClick={() => openReview(ver)}
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
                        <TableCell>{getDocumentTypeLabel(ver.documentType)}</TableCell>
                        <TableCell className="font-mono text-sm">{ver.documentId}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                "text-sm font-medium",
                                getConfidenceColor(ver.overallConfidence)
                              )}
                            >
                              {(ver.overallConfidence * 100).toFixed(0)}%
                            </span>
                            {ver.overallConfidence < 0.7 && (
                              <AlertTriangle className="h-3 w-3 text-destructive" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {ver.flagged ? (
                            <StatusBadge variant="rejected">Flagged</StatusBadge>
                          ) : ver.reviewedByStaff ? (
                            <StatusBadge variant="verified">Verified</StatusBadge>
                          ) : (
                            <StatusBadge variant="pending">Pending</StatusBadge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {format(ver.timestamp, "MMM dd, HH:mm")}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              openReview(ver);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Document Review Dialog */}
      <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Document Review</DialogTitle>
          </DialogHeader>
          
          {selectedVerification && (
            <div className="space-y-6">
              {/* Document Info */}
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">{getDocumentTypeLabel(selectedVerification.documentType)}</p>
                  <p className="text-sm text-muted-foreground">Document ID {selectedVerification.documentId}</p>
                </div>
              </div>

              {/* Document Image Placeholder */}
              <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg overflow-hidden flex items-center justify-center">
                <div className="text-center text-white p-4">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-white/20 flex items-center justify-center">
                    <FileText className="h-8 w-8" />
                  </div>
                  <p className="font-semibold">{getDocumentTypeLabel(selectedVerification.documentType)}</p>
                  <p className="text-sm opacity-80">
                    {getApplication(selectedVerification.applicationId)?.customerName}
                  </p>
                </div>
              </div>

              {/* Extracted Fields */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground">Extracted Fields</h4>
                <div className="space-y-2">
                  {selectedVerification.extractedFields.map((field, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-dashed border-muted last:border-0">
                      <div>
                        <p className="text-xs text-muted-foreground">{field.label}</p>
                        <p className="font-medium">{field.value}</p>
                      </div>
                      <span className={cn(
                        "text-sm font-semibold",
                        getConfidenceColor(field.confidence)
                      )}>
                        {(field.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button 
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                  onClick={() => handleVerify(selectedVerification.id)}
                  disabled={selectedVerification.reviewedByStaff}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Verify
                </Button>
                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={() => handleFlag(selectedVerification.id)}
                  disabled={selectedVerification.reviewedByStaff}
                >
                  <Flag className="h-4 w-4 mr-2" />
                  Flag
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
              </div>

              {selectedVerification.reviewedByStaff && (
                <p className="text-center text-sm text-muted-foreground">
                  This document has already been reviewed.
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AIVerification;