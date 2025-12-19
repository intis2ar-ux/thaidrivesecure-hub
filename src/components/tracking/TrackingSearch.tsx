import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface TrackingSearchProps {
  onSearch: (trackingNumber: string) => void;
  isLoading?: boolean;
}

export const TrackingSearch = ({ onSearch, isLoading }: TrackingSearchProps) => {
  const [trackingNumber, setTrackingNumber] = useState("");

  const handleSearch = () => {
    if (trackingNumber.trim()) {
      onSearch(trackingNumber.trim().toUpperCase());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Enter Tracking Number (e.g., TDS-2024-001)"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10 h-12 text-base bg-background"
            />
          </div>
          <Button 
            onClick={handleSearch} 
            disabled={!trackingNumber.trim() || isLoading}
            className="h-12 px-8 bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            {isLoading ? "Searching..." : "Track Delivery"}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-3">
          Track your insurance policy delivery status by entering your tracking number
        </p>
      </CardContent>
    </Card>
  );
};
