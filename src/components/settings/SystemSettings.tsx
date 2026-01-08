import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  Database,
  Brain,
  Gauge,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Trash2,
  Upload,
  HelpCircle,
  Shield,
  Server,
  CreditCard,
} from "lucide-react";

interface SystemData {
  aiConfidenceThreshold: number;
  queuePriorityThreshold: number;
  maintenanceMode: boolean;
}

interface SystemStatus {
  firestore: "online" | "offline" | "degraded";
  aiService: "online" | "offline" | "degraded";
  paymentSystem: "online" | "offline" | "degraded";
}

interface SystemSettingsProps {
  system: SystemData;
  onUpdate: (field: keyof SystemData, value: number | boolean) => void;
  onSave: () => Promise<void>;
  onSeedData: () => Promise<void>;
  onClearAndReseed: () => Promise<void>;
  isSaving: boolean;
  isSeeding: boolean;
  isClearing: boolean;
}

export const SystemSettings = ({
  system,
  onUpdate,
  onSave,
  onSeedData,
  onClearAndReseed,
  isSaving,
  isSeeding,
  isClearing,
}: SystemSettingsProps) => {
  const { toast } = useToast();
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  // Simulated system status for FYP prototype
  const systemStatus: SystemStatus = {
    firestore: "online",
    aiService: "online",
    paymentSystem: "online",
  };

  const handleClearConfirm = async () => {
    if (!confirmPassword) {
      toast({
        title: "Password Required",
        description: "Please enter your password to confirm this action.",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    // Simulate password verification
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsVerifying(false);
    setShowClearDialog(false);
    setConfirmPassword("");
    await onClearAndReseed();
  };

  const getStatusBadge = (status: "online" | "offline" | "degraded") => {
    const config = {
      online: { icon: CheckCircle, color: "bg-success/10 text-success", label: "Online" },
      offline: { icon: XCircle, color: "bg-destructive/10 text-destructive", label: "Offline" },
      degraded: { icon: AlertTriangle, color: "bg-warning/10 text-warning", label: "Degraded" },
    };
    const { icon: Icon, color, label } = config[status];
    return (
      <Badge className={`${color} border-0 gap-1`}>
        <Icon className="h-3 w-3" />
        {label}
      </Badge>
    );
  };

  const getConfidenceLabel = (value: number) => {
    if (value >= 0.9) return { label: "High", color: "text-success" };
    if (value >= 0.7) return { label: "Medium", color: "text-warning" };
    return { label: "Low", color: "text-destructive" };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          System Configuration
        </CardTitle>
        <CardDescription>
          Manage AI thresholds, system behavior, and data operations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* System Status Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
            <div className="flex items-center gap-3">
              <Server className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">Firestore</span>
            </div>
            {getStatusBadge(systemStatus.firestore)}
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
            <div className="flex items-center gap-3">
              <Brain className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">AI Service</span>
            </div>
            {getStatusBadge(systemStatus.aiService)}
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">Payment System</span>
            </div>
            {getStatusBadge(systemStatus.paymentSystem)}
          </div>
        </div>

        <Separator />

        {/* AI Confidence Threshold */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-accent" />
              <Label className="text-base font-medium">AI Confidence Threshold</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[300px]">
                    <p>
                      Sets the minimum confidence score for automatic AI verification.
                      Documents below this threshold require manual review. Higher values
                      mean stricter auto-approval but more manual work.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex items-center gap-2">
              <span className={`font-medium ${getConfidenceLabel(system.aiConfidenceThreshold).color}`}>
                {(system.aiConfidenceThreshold * 100).toFixed(0)}%
              </span>
              <span className={`text-sm ${getConfidenceLabel(system.aiConfidenceThreshold).color}`}>
                ({getConfidenceLabel(system.aiConfidenceThreshold).label})
              </span>
            </div>
          </div>
          <div className="px-2">
            <Slider
              value={[system.aiConfidenceThreshold * 100]}
              onValueChange={([value]) => onUpdate("aiConfidenceThreshold", value / 100)}
              min={50}
              max={99}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>50% (More auto-approvals)</span>
              <span>99% (More manual reviews)</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Queue Priority Threshold */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gauge className="h-5 w-5 text-primary" />
              <Label className="text-base font-medium">Queue Priority Threshold</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[300px]">
                    <p>
                      Maximum number of pending applications before priority queue
                      activation. When exceeded, urgent applications are automatically
                      prioritized for faster processing.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Input
              type="number"
              value={system.queuePriorityThreshold}
              onChange={(e) => onUpdate("queuePriorityThreshold", parseInt(e.target.value) || 0)}
              className="w-32"
              min={10}
              max={500}
            />
            <span className="text-sm text-muted-foreground">pending applications</span>
          </div>
        </div>

        <Separator />

        {/* Maintenance Mode */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
          <div className="flex items-start gap-4">
            <div className={`p-2 rounded-lg ${system.maintenanceMode ? "bg-destructive/10" : "bg-muted"}`}>
              <Shield className={`h-5 w-5 ${system.maintenanceMode ? "text-destructive" : "text-muted-foreground"}`} />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Label className="text-base font-medium">Maintenance Mode</Label>
                {system.maintenanceMode && (
                  <Badge variant="destructive">Active</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Temporarily disable public access for scheduled maintenance
              </p>
            </div>
          </div>
          <Switch
            checked={system.maintenanceMode}
            onCheckedChange={(checked) => onUpdate("maintenanceMode", checked)}
          />
        </div>

        {system.maintenanceMode && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-medium">
              Public access is currently disabled. Users cannot submit new applications.
            </span>
          </div>
        )}

        <Separator />

        {/* Data Operations */}
        <div className="space-y-4">
          <h3 className="font-medium flex items-center gap-2">
            <Database className="h-4 w-4" />
            Data Operations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-border space-y-3">
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4 text-accent" />
                <Label className="font-medium">Seed Sample Data</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Add sample data to Firestore (keeps existing data intact)
              </p>
              <Button
                onClick={onSeedData}
                disabled={isSeeding || isClearing}
                variant="outline"
                className="w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground"
              >
                {isSeeding ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Seeding...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Seed Data
                  </>
                )}
              </Button>
            </div>

            <div className="p-4 rounded-lg border border-destructive/30 bg-destructive/5 space-y-3">
              <div className="flex items-center gap-2">
                <Trash2 className="h-4 w-4 text-destructive" />
                <Label className="font-medium text-destructive">Clear & Reseed Data</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                ⚠️ Destructive action: Clear all existing data and reseed
              </p>
              <Button
                onClick={() => setShowClearDialog(true)}
                disabled={isSeeding || isClearing}
                variant="destructive"
                className="w-full"
              >
                {isClearing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Clearing...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear & Reseed
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <Button
            onClick={onSave}
            disabled={isSaving}
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Save Configuration
          </Button>
        </div>
      </CardContent>

      {/* Clear & Reseed Confirmation Dialog */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Confirm Destructive Action
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                This will <strong>permanently delete all existing data</strong> and replace
                it with fresh sample data. This action cannot be undone.
              </p>
              <p className="text-sm">
                Please enter your password to confirm:
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmPassword("")}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearConfirm}
              disabled={isVerifying || !confirmPassword}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isVerifying ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Confirm Clear & Reseed
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
