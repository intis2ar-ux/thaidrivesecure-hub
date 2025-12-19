import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Applications", href: "/applications", icon: FileText },
  { title: "AI Verification", href: "/verification", icon: Brain },
  { title: "Payments", href: "/payments", icon: CreditCard },
  { title: "Add-ons", href: "/addons", icon: Package },
  { title: "Analytics", href: "/analytics", icon: BarChart3 },
  { title: "Reports", href: "/reports", icon: FileBarChart },
  { title: "Logs", href: "/logs", icon: ScrollText, adminOnly: true },
  { title: "Settings", href: "/settings", icon: Settings, adminOnly: true },
];

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const filteredNavItems = navItems.filter(
    (item) => !item.adminOnly || user?.role === "admin"
  );

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
      <div className="p-3 border-t border-sidebar-border">
        {!collapsed && user && (
          <NavLink
            to="/profile"
            className={cn(
              "flex items-center gap-3 mb-3 px-3 py-2 rounded-lg transition-all duration-200",
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
              "flex items-center justify-center mb-3 p-2 rounded-lg transition-all duration-200",
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
