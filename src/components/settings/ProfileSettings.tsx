import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Camera, Mail, AlertCircle, Check } from "lucide-react";
import { format } from "date-fns";

interface ProfileData {
  name: string;
  email: string;
  avatarUrl?: string;
  lastUpdated?: Date;
}

interface ProfileSettingsProps {
  profile: ProfileData;
  userRole: string;
  onUpdate: (field: keyof ProfileData, value: string) => void;
  onSave: () => Promise<void>;
  isSaving: boolean;
}

export const ProfileSettings = ({
  profile,
  userRole,
  onUpdate,
  onSave,
  isSaving,
}: ProfileSettingsProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [emailChanged, setEmailChanged] = useState(false);
  const [originalEmail] = useState(profile.email);

  const handleEmailChange = (value: string) => {
    onUpdate("email", value);
    setEmailChanged(value !== originalEmail);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // For FYP prototype, we'll use a data URL
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdate("avatarUrl", reader.result as string);
        toast({
          title: "Avatar Updated",
          description: "Your profile picture has been updated.",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Profile Settings
        </CardTitle>
        <CardDescription>
          Manage your account information and profile details
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar Section */}
        <div className="flex items-center gap-6">
          <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
            <Avatar className="h-20 w-20 border-2 border-border">
              <AvatarImage src={profile.avatarUrl} alt={profile.name} />
              <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                {getInitials(profile.name || "AD")}
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="h-6 w-6 text-white" />
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
          <div className="space-y-1">
            <p className="font-medium">{profile.name || "Admin User"}</p>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
            <Badge variant="secondary" className="capitalize mt-1">
              {userRole}
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Profile Form */}
        <div className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(e) => onUpdate("name", e.target.value)}
                placeholder="Enter your full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                Email Address
                {emailChanged && (
                  <Badge variant="outline" className="text-warning border-warning text-xs">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Requires Re-verification
                  </Badge>
                )}
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  placeholder="Enter your email"
                  className="pl-10"
                />
              </div>
              {emailChanged && (
                <p className="text-xs text-muted-foreground">
                  A verification link will be sent to your new email address.
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <div className="flex items-center gap-3">
              <Input
                id="role"
                value={userRole}
                disabled
                className="capitalize max-w-[200px] bg-muted"
              />
              <span className="text-sm text-muted-foreground">
                Role can only be changed by system administrators
              </span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Last Updated & Save */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {profile.lastUpdated ? (
              <span className="flex items-center gap-1">
                <Check className="h-4 w-4 text-success" />
                Last updated: {format(profile.lastUpdated, "PPp")}
              </span>
            ) : (
              <span>No recent updates</span>
            )}
          </div>
          <Button
            onClick={onSave}
            disabled={isSaving}
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Save Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
