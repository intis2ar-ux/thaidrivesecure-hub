import { useState } from "react";
import { FileText, Loader2, ExternalLink, RefreshCw, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Application } from "@/types";
import { Button } from "@/components/ui/button";
import { useApplications } from "@/hooks/useFirestore";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  application: Application;
}

export const InsuranceDocumentAction = ({ application }: Props) => {
  const { user } = useAuth();
  const { generateAndStoreInsuranceDocument } = useApplications();
  const [loading, setLoading] = useState(false);

  const hasDocument = !!application.insuranceDocumentUrl;

  // Eligibility gate for GENERATING a new document.
  // Once a document exists it must always be accessible to staff,
  // regardless of subsequent status / payment / OCR changes.
  const canGenerate =
    application.paymentStatus === "paid" &&
    (application.ocrScore ?? 0) >= 70 &&
    (application.status === "approved" ||
      application.status === "processing" ||
      application.status === "document_generated");

  // Hide the whole block only if there's no document AND staff can't generate one.
  if (!hasDocument && !canGenerate) return null;

  const handleGenerate = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const url = await generateAndStoreInsuranceDocument(application, user);
      toast.success("Insurance document generated successfully");
      // Open immediately for staff convenience
      window.open(url, "_blank", "noopener");
    } catch (err: any) {
      toast.error(err?.message || "Failed to generate document");
    } finally {
      setLoading(false);
    }
  };

  const handleView = () => {
    if (application.insuranceDocumentUrl) {
      window.open(application.insuranceDocumentUrl, "_blank", "noopener");
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-border">
      <div className="flex items-center gap-2 mb-3">
        <ShieldCheck className="h-4 w-4 text-accent" />
        <span className="text-sm font-semibold text-foreground">Application Actions</span>
      </div>

      {!hasDocument ? (
        <Button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <FileText className="h-4 w-4 mr-2" />
              Generate Insurance
            </>
          )}
        </Button>
      ) : canGenerate ? (
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={handleView} disabled={loading}>
            <ExternalLink className="h-4 w-4 mr-2" />
            View Document
          </Button>
          <Button onClick={handleGenerate} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Re-generating...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Re-generate
              </>
            )}
          </Button>
        </div>
      ) : (
        <Button variant="outline" onClick={handleView} disabled={loading} className="w-full">
          <ExternalLink className="h-4 w-4 mr-2" />
          View Insurance Document
        </Button>
      )}
    </div>
  );
};
