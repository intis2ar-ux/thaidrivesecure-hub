import { MapPin, Calendar } from "lucide-react";
import { Application } from "@/types";
import { Section } from "./SectionHeader";

interface Props {
  application: Application;
}

export const TripSection = ({ application }: Props) => (
  <Section icon={MapPin} title="Trip Details">
    <div className="flex items-start gap-3">
      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
      <div>
        <p className="text-xs text-muted-foreground">Border Route</p>
        <p className="font-medium text-foreground">{application.where || "-"}</p>
      </div>
    </div>
    <div className="flex items-start gap-3">
      <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
      <div>
        <p className="text-xs text-muted-foreground">Travel Day</p>
        <p className="font-medium text-foreground">{application.when || "-"}</p>
      </div>
    </div>
  </Section>
);
