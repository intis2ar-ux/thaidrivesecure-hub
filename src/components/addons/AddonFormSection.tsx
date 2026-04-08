import { useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Plug, ScrollText, Shield, FileCheck, FileText, Truck, Smartphone,
  ChevronDown, Upload, X, Image, File as FileIcon, AlertCircle,
} from "lucide-react";
import type { AddonServiceConfig, AddonFormData } from "@/types/addon-forms";

const iconMap: Record<string, React.ElementType> = {
  Plug, ScrollText, Shield, FileCheck, FileText, Truck, Smartphone,
};

interface AddonFormSectionProps {
  config: AddonServiceConfig;
  formData: AddonFormData;
  documents: Record<string, File | null>;
  errors: Record<string, string>;
  onFormChange: (key: string, value: string) => void;
  onDocumentChange: (key: string, file: File | null) => void;
  onRemove: () => void;
}

export const AddonFormSection = ({
  config, formData, documents, errors, onFormChange, onDocumentChange, onRemove,
}: AddonFormSectionProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const Icon = iconMap[config.icon] || FileText;

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className={cn(
        "border transition-all",
        hasErrors ? "border-destructive/50" : "border-border"
      )}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors py-3 px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary text-primary-foreground">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{config.title}</h3>
                  <p className="text-xs text-muted-foreground">{config.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {hasErrors && (
                  <Badge variant="destructive" className="text-[10px]">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Incomplete
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-muted-foreground hover:text-destructive"
                  onClick={(e) => { e.stopPropagation(); onRemove(); }}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
                <ChevronDown className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform",
                  isOpen && "rotate-180"
                )} />
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="px-4 pb-4 pt-0 space-y-5">
            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {config.fields.map((field) => (
                <div key={field.key} className="space-y-1.5">
                  <Label htmlFor={`${config.type}-${field.key}`} className="text-xs font-medium">
                    {field.label}
                    {field.required && <span className="text-destructive ml-0.5">*</span>}
                  </Label>
                  <Input
                    id={`${config.type}-${field.key}`}
                    type={field.type}
                    placeholder={field.placeholder}
                    value={formData[field.key] || ""}
                    onChange={(e) => onFormChange(field.key, e.target.value)}
                    className={cn(
                      "h-9 text-sm",
                      errors[field.key] && "border-destructive focus-visible:ring-destructive"
                    )}
                  />
                  {field.helperText && !errors[field.key] && (
                    <p className="text-[11px] text-muted-foreground">{field.helperText}</p>
                  )}
                  {errors[field.key] && (
                    <p className="text-[11px] text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors[field.key]}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Document Uploads */}
            {config.documents.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Upload className="h-4 w-4 text-muted-foreground" />
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Required Documents
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {config.documents.map((doc) => {
                    const file = documents[doc.key];
                    const isImage = file?.type.startsWith("image/");

                    return (
                      <div
                        key={doc.key}
                        className={cn(
                          "border-2 border-dashed rounded-lg p-3 transition-colors",
                          errors[`doc_${doc.key}`]
                            ? "border-destructive/50 bg-destructive/5"
                            : file
                            ? "border-primary/30 bg-primary/5"
                            : "border-border hover:border-primary/30"
                        )}
                      >
                        <Label className="text-xs font-medium flex items-center gap-1 mb-1.5">
                          {doc.label}
                          {doc.required && <span className="text-destructive">*</span>}
                        </Label>
                        <p className="text-[11px] text-muted-foreground mb-2">{doc.helperText}</p>

                        {file ? (
                          <div className="flex items-center gap-2 bg-background rounded-md p-2 border">
                            {isImage ? (
                              <Image className="h-4 w-4 text-primary flex-shrink-0" />
                            ) : (
                              <FileIcon className="h-4 w-4 text-primary flex-shrink-0" />
                            )}
                            <span className="text-xs text-foreground truncate flex-1">{file.name}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                              onClick={() => onDocumentChange(doc.key, null)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <label className="flex items-center justify-center gap-2 cursor-pointer bg-background rounded-md p-3 border border-dashed hover:bg-muted/50 transition-colors">
                            <Upload className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              Choose file or take photo
                            </span>
                            <input
                              type="file"
                              accept="image/*,.pdf"
                              capture="environment"
                              className="hidden"
                              onChange={(e) => {
                                const f = e.target.files?.[0] || null;
                                onDocumentChange(doc.key, f);
                              }}
                            />
                          </label>
                        )}

                        {errors[`doc_${doc.key}`] && (
                          <p className="text-[11px] text-destructive flex items-center gap-1 mt-1.5">
                            <AlertCircle className="h-3 w-3" />
                            {errors[`doc_${doc.key}`]}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};
