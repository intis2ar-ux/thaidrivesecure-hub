import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { seedFirestore } from "@/lib/seedFirestore";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  User,
  Shield,
  Bell,
  Database,
  Key,
  Users,
  Loader2,
  Upload,
} from "lucide-react";

interface AdminSettings {
  profile: {
    name: string;
    email: string;
  };
  security: {
    twoFactorEnabled: boolean;
    sessionTimeout: boolean;
  };
  notifications: {
    emailNotifications: boolean;
    newApplicationAlerts: boolean;
    paymentFailureAlerts: boolean;
    lowConfidenceAIAlerts: boolean;
  };
  system: {
    aiConfidenceThreshold: number;
    queuePriorityThreshold: number;
    maintenanceMode: boolean;
  };
}

const defaultSettings: AdminSettings = {
  profile: {
    name: "",
    email: "",
  },
  security: {
    twoFactorEnabled: false,
    sessionTimeout: true,
  },
  notifications: {
    emailNotifications: true,
    newApplicationAlerts: true,
    paymentFailureAlerts: true,
    lowConfidenceAIAlerts: true,
  },
  system: {
    aiConfidenceThreshold: 0.85,
    queuePriorityThreshold: 100,
    maintenanceMode: false,
  },
};

const Settings = () => {
  const { user, firebaseUser } = useAuth();
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<AdminSettings>(defaultSettings);

  // Fetch settings from Firebase on mount
  useEffect(() => {
    const fetchSettings = async () => {
      if (!firebaseUser) return;

      try {
        const settingsDoc = await getDoc(doc(db, "adminSettings", "config"));
        if (settingsDoc.exists()) {
          const data = settingsDoc.data() as AdminSettings;
          setSettings({
            ...defaultSettings,
            ...data,
            profile: {
              name: user?.name || data.profile?.name || "",
              email: user?.email || data.profile?.email || "",
            },
          });
        } else {
          // Initialize with user data if no settings exist
          setSettings({
            ...defaultSettings,
            profile: {
              name: user?.name || "",
              email: user?.email || "",
            },
          });
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
        toast({
          title: "Error",
          description: "Failed to load settings from database.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [firebaseUser, user]);

  const saveSettings = async (section?: keyof AdminSettings) => {
    if (!firebaseUser) return;

    setIsSaving(true);
    try {
      await setDoc(doc(db, "adminSettings", "config"), settings, { merge: true });
      toast({
        title: "Settings Saved",
        description: section
          ? `${section.charAt(0).toUpperCase() + section.slice(1)} settings saved successfully.`
          : "All settings have been saved successfully.",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to save settings to database.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateProfile = (field: keyof AdminSettings["profile"], value: string) => {
    setSettings((prev) => ({
      ...prev,
      profile: { ...prev.profile, [field]: value },
    }));
  };

  const updateSecurity = (field: keyof AdminSettings["security"], value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      security: { ...prev.security, [field]: value },
    }));
  };

  const updateNotifications = (field: keyof AdminSettings["notifications"], value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, [field]: value },
    }));
  };

  const updateSystem = (field: keyof AdminSettings["system"], value: number | boolean) => {
    setSettings((prev) => ({
      ...prev,
      system: { ...prev.system, [field]: value },
    }));
  };

  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
      const result = await seedFirestore();
      toast({
        title: result.success ? "Success" : "Error",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSeeding(false);
    }
  };

  // Only admin can access this page
  if (user?.role !== "admin") {
    return (
      <DashboardLayout>
        <Header title="Settings" subtitle="Admin access required" />
        <div className="p-6">
          <Card>
            <CardContent className="p-12 text-center">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
              <p className="text-muted-foreground">
                You need admin privileges to access system settings.
              </p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <Header title="Settings" subtitle="Manage system configuration and preferences" />
        <div className="p-6 flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Header
        title="Settings"
        subtitle="Manage system configuration and preferences"
      />

      <div className="p-6">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-fit grid-cols-5 gap-4">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              System
            </TabsTrigger>
            <TabsTrigger value="team" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Team
            </TabsTrigger>
          </TabsList>

          {/* Profile Settings */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>
                  Manage your account information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={settings.profile.name}
                      onChange={(e) => updateProfile("name", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={settings.profile.email}
                      onChange={(e) => updateProfile("email", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input id="role" value={user?.role} disabled className="capitalize" />
                </div>
                <Button
                  onClick={() => saveSettings("profile")}
                  disabled={isSaving}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Manage authentication and security options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Switch
                      checked={settings.security.twoFactorEnabled}
                      onCheckedChange={(checked) => updateSecurity("twoFactorEnabled", checked)}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Session Timeout</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically log out after 30 minutes of inactivity
                      </p>
                    </div>
                    <Switch
                      checked={settings.security.sessionTimeout}
                      onCheckedChange={(checked) => updateSecurity("sessionTimeout", checked)}
                    />
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label>Change Password</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <Input type="password" placeholder="Current password" />
                      <Input type="password" placeholder="New password" />
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => saveSettings("security")}
                  disabled={isSaving}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Update Security
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Configure how you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications via email
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.emailNotifications}
                      onCheckedChange={(checked) => updateNotifications("emailNotifications", checked)}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>New Application Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when new applications are submitted
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.newApplicationAlerts}
                      onCheckedChange={(checked) => updateNotifications("newApplicationAlerts", checked)}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Payment Failure Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when payments fail
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.paymentFailureAlerts}
                      onCheckedChange={(checked) => updateNotifications("paymentFailureAlerts", checked)}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Low Confidence AI Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when AI verification confidence is low
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.lowConfidenceAIAlerts}
                      onCheckedChange={(checked) => updateNotifications("lowConfidenceAIAlerts", checked)}
                    />
                  </div>
                </div>
                <Button
                  onClick={() => saveSettings("notifications")}
                  disabled={isSaving}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Settings */}
          <TabsContent value="system">
            <Card>
              <CardHeader>
                <CardTitle>System Configuration</CardTitle>
                <CardDescription>
                  Manage system-wide settings and integrations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>AI Confidence Threshold</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Minimum confidence score for AI auto-verification
                    </p>
                    <Input
                      type="number"
                      value={settings.system.aiConfidenceThreshold}
                      onChange={(e) => updateSystem("aiConfidenceThreshold", parseFloat(e.target.value))}
                      step="0.05"
                      min="0"
                      max="1"
                      className="w-32"
                    />
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label>Queue Priority Threshold</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Maximum items before priority queue activation
                    </p>
                    <Input
                      type="number"
                      value={settings.system.queuePriorityThreshold}
                      onChange={(e) => updateSystem("queuePriorityThreshold", parseInt(e.target.value))}
                      className="w-32"
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Maintenance Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Temporarily disable public access for maintenance
                      </p>
                    </div>
                    <Switch
                      checked={settings.system.maintenanceMode}
                      onCheckedChange={(checked) => updateSystem("maintenanceMode", checked)}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Seed Sample Data</Label>
                      <p className="text-sm text-muted-foreground">
                        Add sample data to Firestore for testing
                      </p>
                    </div>
                    <Button
                      onClick={handleSeedData}
                      disabled={isSeeding}
                      variant="outline"
                      className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
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
                </div>
                <Button
                  onClick={() => saveSettings("system")}
                  disabled={isSaving}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Save Configuration
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team Settings */}
          <TabsContent value="team">
            <Card>
              <CardHeader>
                <CardTitle>Team Management</CardTitle>
                <CardDescription>
                  Manage staff accounts and permissions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                        <span className="text-primary-foreground font-medium">A</span>
                      </div>
                      <div>
                        <p className="font-medium">Admin User</p>
                        <p className="text-sm text-muted-foreground">admin@thaidrivesecure.com</p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-accent">Admin</span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                        <span className="text-secondary-foreground font-medium">S</span>
                      </div>
                      <div>
                        <p className="font-medium">Staff User</p>
                        <p className="text-sm text-muted-foreground">staff@thaidrivesecure.com</p>
                      </div>
                    </div>
                    <span className="text-sm font-medium">Staff</span>
                  </div>
                </div>
                <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  <Key className="h-4 w-4 mr-2" />
                  Invite New Member
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
