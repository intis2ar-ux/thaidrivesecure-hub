import { useState } from "react";
import { FileText, Loader2, ExternalLink, RefreshCw, ShieldCheck, Download } from "lucide-react";
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
  const [downloading, setDownloading] = useState(false);

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

  const handleDownload = async () => {
    if (!application.insuranceDocumentUrl || downloading) return;
    setDownloading(true);
    try {
      const refId = application.orderId || application.id;
      const filename = `Insurance-${refId}.pdf`;

      // Try fetch+blob first for a clean custom filename.
      // If CORS blocks it, fall back to a direct anchor download.
      try {
        const res = await fetch(application.insuranceDocumentUrl);
        if (!res.ok) throw new Error("fetch_failed");
        const blob = await res.blob();
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = objectUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(objectUrl);
      } catch {
        // CORS / network fallback — open the storage URL directly.
        // Browser will download (PDF) or open in a new tab depending on headers.
        const link = document.createElement("a");
        link.href = application.insuranceDocumentUrl;
        link.download = filename;
        link.target = "_blank";
        link.rel = "noopener";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      toast.success("Insurance document downloaded");
    } catch (err: any) {
      toast.error(err?.message || "Failed to download document");
    } finally {
      setDownloading(false);
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
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={handleView} disabled={loading || downloading}>
              <ExternalLink className="h-4 w-4 mr-2" />
              View Document
            </Button>
            <Button variant="outline" onClick={handleDownload} disabled={loading || downloading}>
              {downloading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </>
              )}
            </Button>
          </div>
          <Button onClick={handleGenerate} disabled={loading || downloading} className="w-full">
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
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={handleView} disabled={loading || downloading}>
            <ExternalLink className="h-4 w-4 mr-2" />
            View Document
          </Button>
          <Button variant="outline" onClick={handleDownload} disabled={loading || downloading}>
            {downloading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
