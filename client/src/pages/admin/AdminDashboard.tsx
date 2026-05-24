import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import {
  BarChart3,
  Brain,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  DollarSign,
  Home,
  Loader2,
  LogOut,
  MessageCircle,
  Package,
  Settings,
  ShoppingBag,
  Users,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useCallback, useState } from "react";
import BackToHome from "@/components/BackToHome";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const navItems = [
  { href: "/admin", label: "Overview", icon: BarChart3 },
  { href: "/admin/survey", label: "Survey Manager", icon: ClipboardList },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/knowledge", label: "Knowledge Base", icon: Brain },
  { href: "/admin/meetings", label: "Meetings", icon: Calendar },
  { href: "/admin/chatbot", label: "Conversations", icon: MessageCircle },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/admin/users", label: "Users", icon: Users },
];

export function AdminLayout({ children, noPadding }: { children: React.ReactNode; noPadding?: boolean }) {
  const { user, isAuthenticated, logout } = useAuth();
  const [location, navigate] = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = useCallback(async () => {
    await logout();
    navigate("/");
  }, [logout, navigate]);

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <Settings className="h-7 w-7 text-destructive" />
          </div>
          <h2 className="font-serif text-2xl font-semibold">Access Restricted</h2>
          <p className="text-muted-foreground text-sm">You need admin privileges to access this area.</p>
          <div className="flex gap-3 justify-center">
            {!isAuthenticated && (
              <Button
                className="bg-primary text-primary-foreground"
                onClick={() => (window.location.href = getLoginUrl())}
              >
                Sign In
              </Button>
            )}
            <BackToHome />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`relative bg-sidebar-background text-sidebar-foreground flex-shrink-0 flex flex-col transition-all duration-300 ease-in-out ${
          collapsed ? "w-16" : "w-60"
        }`}
      >
        {/* Collapse toggle button — floats on the right edge */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="absolute -right-3 top-6 z-10 w-6 h-6 rounded-full bg-sidebar-background border border-sidebar-border flex items-center justify-center shadow-sm hover:bg-sidebar-accent transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-3.5 w-3.5 text-sidebar-foreground/70" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5 text-sidebar-foreground/70" />
          )}
        </button>

        {/* Logo */}
        <div className={`border-b border-sidebar-border flex-shrink-0 ${collapsed ? "p-3 flex justify-center" : "p-5"}`}>
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center shadow-sm flex-shrink-0">
                <span className="text-sidebar-primary-foreground text-sm font-bold tracking-tight">MC</span>
              </div>
              {!collapsed && (
                <div className="overflow-hidden">
                  <span className="font-bold text-sm text-sidebar-foreground tracking-tight whitespace-nowrap">MCI Store</span>
                  <p className="text-[10px] text-sidebar-foreground/50 leading-none mt-0.5 whitespace-nowrap">Admin Dashboard</p>
                </div>
              )}
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto min-h-0">
          {navItems.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            const navBtn = (
              <Link href={item.href} key={item.href}>
                <div
                  className={`flex items-center gap-3 rounded-lg text-sm font-medium cursor-pointer transition-all ${
                    collapsed ? "px-2 py-2.5 justify-center" : "px-3 py-2.5"
                  } ${
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </div>
              </Link>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.href} delayDuration={100}>
                  <TooltipTrigger asChild>{navBtn}</TooltipTrigger>
                  <TooltipContent side="right" className="text-xs">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            }
            return navBtn;
          })}
        </nav>

        {/* Bottom: Back to Website + Log Out */}
        <div className="p-2 border-t border-sidebar-border space-y-0.5 flex-shrink-0">
          {collapsed ? (
            <>
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <Link href="/">
                    <div className="flex items-center justify-center px-2 py-2.5 rounded-lg text-sm font-medium cursor-pointer text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-all">
                      <Home className="h-4 w-4" />
                    </div>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs">Back to Website</TooltipContent>
              </Tooltip>
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center px-2 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:bg-red-50 hover:text-red-600 transition-all"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs">Log Out</TooltipContent>
              </Tooltip>
            </>
          ) : (
            <>
              <Link href="/">
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-all">
                  <Home className="h-4 w-4" />
                  Back to Website
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:bg-red-50 hover:text-red-600 transition-all"
              >
                <LogOut className="h-4 w-4" />
                Log Out
              </button>
            </>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto min-w-0 h-full">
        {noPadding ? children : <div className="p-8">{children}</div>}
      </main>
    </div>
  );
}

export default function AdminDashboard() {
  const { data: stats, isLoading } = trpc.admin.stats.useQuery();

  const statCards = [
    {
      label: "Total Orders",
      value: stats?.totalOrders ?? 0,
      icon: ShoppingBag,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Total Revenue",
      value: `IDR ${(stats?.totalRevenue ?? 0).toLocaleString("id-ID")}`,
      icon: DollarSign,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Pending Orders",
      value: stats?.pendingOrders ?? 0,
      icon: ClipboardList,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Active Products",
      value: stats?.totalProducts ?? 0,
      icon: Package,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-light text-foreground mb-1">Dashboard Overview</h1>
        <p className="text-muted-foreground text-sm">Welcome back. Here's what's happening today.</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="bg-card rounded-xl border border-border/60 p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                  <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center`}>
                    <Icon className={`h-4 w-4 ${card.color}`} />
                  </div>
                </div>
                <p className="font-serif text-2xl font-semibold text-foreground">{card.value}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Links */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { href: "/admin/survey", label: "Manage Survey", desc: "Add/edit health survey questions and pages", icon: ClipboardList },
          { href: "/admin/products", label: "Manage Products", desc: "Add/edit products, set segments and pricing", icon: Package },
          { href: "/admin/orders", label: "View Orders", desc: "Review and update order statuses", icon: ShoppingBag },
          { href: "/admin/settings", label: "Payment Settings", desc: "Configure bank transfer and shipping rates", icon: Settings },
          { href: "/admin/users", label: "Manage Users", desc: "Update user segments and roles", icon: Users },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Link href={item.href} key={item.href}>
              <div className="bg-card rounded-xl border border-border/60 p-5 card-hover cursor-pointer">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="font-semibold text-sm text-foreground">{item.label}</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </AdminLayout>
  );
}
