import React from "react";
import { AlertTriangle, CheckCircle, XCircle, Info, Lock } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { WorkflowValidation } from "@/hooks/useWorkflow";
import { cn } from "@/lib/utils";

interface WorkflowBlockerProps {
  validation: WorkflowValidation;
  className?: string;
  showWhenValid?: boolean;
}

export const WorkflowBlocker: React.FC<WorkflowBlockerProps> = ({
  validation,
  className,
  showWhenValid = false,
}) => {
  if (validation.isValid && !showWhenValid) {
    return null;
  }

  if (validation.isValid) {
    return (
      <Alert className={cn("border-success/30 bg-success/5", className)}>
        <CheckCircle className="h-4 w-4 text-success" />
        <AlertTitle className="text-success">Action Allowed</AlertTitle>
        <AlertDescription>
          All requirements are met. You can proceed with this action.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className={cn("border-destructive/30 bg-destructive/5", className)}>
      <Lock className="h-4 w-4 text-destructive" />
      <AlertTitle className="text-destructive">Action Blocked</AlertTitle>
      <AlertDescription>
        <p className="mb-2">{validation.blockedReason}</p>
        {validation.missingRequirements && validation.missingRequirements.length > 0 && (
          <ul className="list-disc list-inside space-y-1 text-sm">
            {validation.missingRequirements.map((req, idx) => (
              <li key={idx} className="text-muted-foreground">
                {req}
              </li>
            ))}
          </ul>
        )}
      </AlertDescription>
    </Alert>
  );
};

interface WorkflowStageIndicatorProps {
  currentStage: number;
  stages: { label: string; description: string }[];
  className?: string;
}

export const WorkflowStageIndicator: React.FC<WorkflowStageIndicatorProps> = ({
  currentStage,
  stages,
  className,
}) => {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      {stages.map((stage, idx) => {
        const stageNum = idx + 1;
        const isCompleted = currentStage > stageNum;
        const isCurrent = currentStage === stageNum;
        const isPending = currentStage < stageNum;

        return (
          <React.Fragment key={idx}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                      isCompleted && "bg-success border-success text-success-foreground",
                      isCurrent && "bg-primary border-primary text-primary-foreground",
                      isPending && "bg-muted border-border text-muted-foreground"
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <span className="font-semibold">{stageNum}</span>
                    )}
                  </div>
                  <span
                    className={cn(
                      "mt-2 text-xs font-medium",
                      isCompleted && "text-success",
                      isCurrent && "text-primary",
                      isPending && "text-muted-foreground"
                    )}
                  >
                    {stage.label}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-medium">{stage.label}</p>
                <p className="text-xs text-muted-foreground">{stage.description}</p>
              </TooltipContent>
            </Tooltip>
            {idx < stages.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-1 mx-2 rounded-full",
                  currentStage > stageNum + 1 ? "bg-success" : "bg-border"
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

interface RequirementChecklistProps {
  requirements: { label: string; met: boolean; required: boolean }[];
  className?: string;
}

export const RequirementChecklist: React.FC<RequirementChecklistProps> = ({
  requirements,
  className,
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      {requirements.map((req, idx) => (
        <div
          key={idx}
          className={cn(
            "flex items-center gap-2 p-2 rounded-lg",
            req.met ? "bg-success/10" : req.required ? "bg-destructive/10" : "bg-muted"
          )}
        >
          {req.met ? (
            <CheckCircle className="h-4 w-4 text-success shrink-0" />
          ) : req.required ? (
            <XCircle className="h-4 w-4 text-destructive shrink-0" />
          ) : (
            <Info className="h-4 w-4 text-muted-foreground shrink-0" />
          )}
          <span
            className={cn(
              "text-sm",
              req.met ? "text-success" : req.required ? "text-destructive" : "text-muted-foreground"
            )}
          >
            {req.label}
            {req.required && !req.met && (
              <span className="text-xs ml-1">(Required)</span>
            )}
          </span>
        </div>
      ))}
    </div>
  );
};
