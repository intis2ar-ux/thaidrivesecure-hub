import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  LayoutDashboard,
  FileText,
  Brain,
  CreditCard,
  Package,
  BarChart3,
  FileBarChart,
  ScrollText,
  Settings,
  LogOut,
  Shield,
  ChevronLeft,
  ChevronRight,
  UserCircle,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  adminOnly?: boolean;
  moduleKey?: string;
}

const navItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Applications", href: "/applications", icon: FileText },
  { title: "AI Verification", href: "/verification", icon: Brain, moduleKey: "aiVerificationEnabled" },
  { title: "Payments", href: "/payments", icon: CreditCard },
  { title: "Tracking", href: "/tracking", icon: Truck },
  { title: "Add-ons", href: "/addons", icon: Package },
  { title: "Analytics", href: "/analytics", icon: BarChart3 },
  { title: "Reports", href: "/reports", icon: FileBarChart },
  { title: "Logs", href: "/logs", icon: ScrollText, adminOnly: true },
];

interface ModuleSettings {
  aiVerificationEnabled: boolean;
}

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [moduleSettings, setModuleSettings] = useState<ModuleSettings>({
    aiVerificationEnabled: false,
  });

  // Listen to module settings from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, "adminSettings", "config"),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setModuleSettings({
            aiVerificationEnabled: data.modules?.aiVerificationEnabled ?? false,
          });
        }
      },
      (error) => {
        console.error("Error listening to module settings:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  const filteredNavItems = navItems.filter((item) => {
    // Check admin-only items
    if (item.adminOnly && user?.role !== "admin") return false;
    // Check module-based visibility
    if (item.moduleKey === "aiVerificationEnabled" && !moduleSettings.aiVerificationEnabled) return false;
    return true;
  });

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-sidebar transition-all duration-300 flex flex-col z-50",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
            <Shield className="h-6 w-6 text-accent-foreground" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="font-bold text-sidebar-foreground text-lg leading-tight">
                ThaiDrive
              </h1>
              <p className="text-xs text-sidebar-foreground/70">Secure</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {filteredNavItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                "hover:bg-sidebar-accent",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/80"
              )}
            >
              <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-sidebar-primary")} />
              {!collapsed && (
                <span className="font-medium text-sm">{item.title}</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-3 border-t border-sidebar-border space-y-2">
        {/* Settings Button - Admin Only */}
        {user?.role === "admin" && (
          <NavLink
            to="/settings"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
              "bg-accent/10 border border-accent/20 hover:bg-accent/20",
              location.pathname === "/settings"
                ? "bg-accent text-accent-foreground border-accent"
                : "text-accent",
              collapsed && "justify-center px-2"
            )}
          >
            <Settings className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span className="font-medium text-sm">Settings</span>}
          </NavLink>
        )}

        {!collapsed && user && (
          <NavLink
            to="/profile"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200",
              "hover:bg-sidebar-accent",
              location.pathname === "/profile"
                ? "bg-sidebar-accent text-sidebar-primary"
                : "bg-sidebar-accent/50 text-sidebar-foreground"
            )}
          >
            <UserCircle className="h-5 w-5 flex-shrink-0" />
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">
                {user.name}
              </p>
              <p className="text-xs text-sidebar-foreground/70 capitalize">
                {user.role}
              </p>
            </div>
          </NavLink>
        )}
        {collapsed && (
          <NavLink
            to="/profile"
            className={cn(
              "flex items-center justify-center p-2 rounded-lg transition-all duration-200",
              "hover:bg-sidebar-accent",
              location.pathname === "/profile"
                ? "bg-sidebar-accent text-sidebar-primary"
                : "text-sidebar-foreground/80"
            )}
          >
            <UserCircle className="h-5 w-5" />
          </NavLink>
        )}
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent",
            collapsed && "justify-center px-2"
          )}
          onClick={logout}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span className="ml-3">Logout</span>}
        </Button>
      </div>

      {/* Collapse Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-3 top-20 h-6 w-6 rounded-full bg-card border border-border shadow-sm hover:bg-secondary"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4 text-foreground" />
        ) : (
          <ChevronLeft className="h-4 w-4 text-foreground" />
        )}
      </Button>
    </aside>
  );
};
