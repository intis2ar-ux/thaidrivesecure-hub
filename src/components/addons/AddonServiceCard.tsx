import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import type { AddonServiceConfig } from "@/types/addon-forms";
import {
  Plug, ScrollText, Shield, FileCheck, FileText, Truck, Smartphone,
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  Plug, ScrollText, Shield, FileCheck, FileText, Truck, Smartphone,
};

interface AddonServiceCardProps {
  config: AddonServiceConfig;
  selected: boolean;
  onToggle: () => void;
}

export const AddonServiceCard = ({ config, selected, onToggle }: AddonServiceCardProps) => {
  const Icon = iconMap[config.icon] || FileText;
  const docCount = config.documents.length;

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-200 border-2",
        selected
          ? "border-primary bg-primary/5 shadow-md"
          : "border-border hover:border-primary/30 hover:shadow-sm"
      )}
      onClick={onToggle}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn(
            "p-2.5 rounded-xl flex-shrink-0 transition-colors",
            selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          )}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">{config.title}</h3>
              <Checkbox checked={selected} className="pointer-events-none" />
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{config.description}</p>
            {docCount > 0 && (
              <Badge variant="outline" className="mt-2 text-[10px] font-medium">
                {docCount} document{docCount > 1 ? "s" : ""} required
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
