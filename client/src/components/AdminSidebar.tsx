import { useAuth } from "@/_core/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { useCallback } from "react";
import {
  BarChart3,
  Brain,
  Calendar,
  ClipboardList,
  Home,
  LogOut,
  MessageCircle,
  Package,
  Settings,
  ShoppingBag,
  Users,
} from "lucide-react";

const NAV_ITEMS = [
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

export default function AdminSidebar() {
  const { logout } = useAuth();
  const [location, navigate] = useLocation();

  const handleLogout = useCallback(async () => {
    await logout();
    navigate("/");
  }, [logout, navigate]);

  return (
    <aside className="w-56 flex-shrink-0 bg-card border-r border-border/60 flex flex-col min-h-screen">
      <div className="p-5 border-b border-border/60">
        {/* Use a plain div inside Link — Link itself renders the <a> */}
        <Link href="/" className="flex items-center gap-2 cursor-pointer">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
            <span className="text-primary-foreground text-xs font-bold tracking-tight">MC</span>
          </div>
          <div>
            <span className="font-bold text-sm text-foreground tracking-tight">MCI Store</span>
            <p className="text-[10px] text-muted-foreground leading-none mt-0.5">Admin Panel</p>
          </div>
        </Link>
      </div>
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-border/60 space-y-0.5">
        <Link
          href="/"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <Home className="h-4 w-4 flex-shrink-0" /> Back to Website
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="h-4 w-4 flex-shrink-0" /> Log Out
        </button>
      </div>
    </aside>
  );
}
